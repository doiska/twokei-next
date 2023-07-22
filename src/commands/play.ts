import {Command, container} from '@sapphire/framework';
import {isGuildMember} from '@sapphire/discord.js-utilities';
import {ApplyOptions} from '@sapphire/decorators';

import {fetchT} from 'twokei-i18next';
import {getRandomLoadingMessage} from '@/utils/utils';
import {Embed} from '@/utils/messages';
import {getReadableException} from '@/structures/exceptions/utils/get-readable-exception';
import {addNewSong} from '@/music/heizou/add-new-song';
import {createPlayEmbed} from '@/constants/music/create-play-embed';
import {ComponentType} from "discord.js";
import {noop} from "@sapphire/utilities";

@ApplyOptions<Command.Options>({
    name: 'play',
    aliases: ['p'],
    description: 'ping pong',
    enabled: true,
    preconditions: ['GuildTextOnly'],
    cooldownDelay: 1_000,
})
export class PlayCommand extends Command {
    registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(
                (option) => option.setName('search')
                    .setDescription('Input')
                    .setRequired(true),
            ));
    }

    public override async chatInputRun(
        interaction: Command.ChatInputCommandInteraction,
    ) {
        const search = interaction.options.getString('search');

        const {member} = interaction;

        if (!member || !isGuildMember(member)) {
            return;
        }

        if (!search) {
            return;
        }

        const t = await fetchT(interaction);

        await interaction.reply({
            ephemeral: true,
            embeds: [Embed.loading(t(getRandomLoadingMessage()) ?? 'Loading..')]
        });

        try {
            const result = await addNewSong(search, member);
            const embedResult = createPlayEmbed(t, member, result);
            const replied = await interaction.editReply({...embedResult});

            replied.awaitMessageComponent({
                filter: (i) => i.user.id === interaction.user.id && ['like', 'dislike'].includes(i.customId),
                componentType: ComponentType.Button,
                time: 15000,
            })
                .then(async response => {
                    await container.analytics.track({
                        userId: interaction.user.id,
                        event: response.customId === 'like' ? 'like_song' : 'dislike_song',
                        source: 'Guild',
                        properties: {
                            track: result.tracks?.[0].short()
                        }
                    });

                    response.reply({
                        embeds: [Embed.success(t('player:play.buttons.thanks') ?? 'Thanks!')]
                    });
                })
                .catch(noop)
                .finally(() => void interaction.deleteReply().catch(noop));

        } catch (error) {
            await container.client.replyTo(
                interaction,
                Embed.error(await getReadableException(error, interaction.guild)),
            );
        }
    }
}
