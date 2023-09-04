import "reflect-metadata";
import "./env";
import "../db/Kil";

import "@sapphire/plugin-i18next/register";

import {
  ActionRowBuilder,
  ActivityType,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import {
  ApplicationCommandRegistries,
  container,
  LogLevel,
  RegisterBehavior,
} from "@sapphire/framework";

import { eq } from "drizzle-orm";
import { kil } from "@/db/Kil";
import { guilds } from "@/db/schemas/guild";
import { DEFAULT_LOCALE, isValidLocale } from "@/locales/i18n";
import { TwokeiClient } from "@/structures/TwokeiClient";
import type { InternationalizationContext } from "@sapphire/plugin-i18next";
import pt_br from "@/locales/pt_br";
import { noop } from "@sapphire/utilities";
import { isTextChannel } from "@sapphire/discord.js-utilities";
import { env } from "@/app/env";
import { Icons, RawIcons } from "@/constants/icons";

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.VerboseOverwrite,
);

export const Twokei = new TwokeiClient({
  caseInsensitiveCommands: true,
  logger: {
    level: LogLevel.Error,
  },
  shards: "auto",
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
  ],
  partials: [Partials.Channel],
  loadMessageCommandListeners: true,
  enableLoaderTraceLoggings: false,
  i18n: {
    defaultLanguageDirectory: "./dist/locales",
    i18next: {
      fallbackLng: "pt_br",
      supportedLngs: ["pt_br", "en_us"],
      resources: {
        pt_br,
      },
      interpolation: {
        defaultVariables: {
          name: "Twokei",
          mention: "@Twokei",
        },
      },
      joinArrays: "\n",
    },
    fetchLanguage: async (context: InternationalizationContext) => {
      if (!context.guild?.id) {
        return DEFAULT_LOCALE;
      }

      const [guild] = await kil
        .select({ locale: guilds.locale })
        .from(guilds)
        .where(eq(guilds.guildId, context.guild.id));

      if (!guild || !isValidLocale(guild.locale)) {
        return DEFAULT_LOCALE;
      }

      return isValidLocale(guild.locale) ? guild.locale : DEFAULT_LOCALE;
    },
  },
});

const main = async () => {
  await Twokei.login(process.env.DISCORD_TOKEN);

  Twokei?.user?.setPresence({
    activities: [
      {
        name: "twokei.com",
        type: ActivityType.Listening,
        url: "https://twokei.com",
      },
    ],
  });

  for (const guild of Twokei.guilds.cache.values()) {
    container.sc.reset(guild).catch(noop);

    if (typeof env.CLIENT_ID === "string") {
      const { channelId } = (await container.sc.get(guild)) ?? {};

      if (!channelId) {
        continue;
      }

      const channel = await guild.channels.fetch(channelId).catch(noop);

      const owner = await guild.fetchOwner().catch(noop);

      const button = new ButtonBuilder()
        .setLabel("Convite")
        .setEmoji(RawIcons.Lightning)
        .setURL("https://twokei.com")
        .setStyle(ButtonStyle.Link);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

      const embed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setDescription(
          [
            `## ${Icons.Hanakin} Atenção - Este bot foi descontinuado!`,
            `### Peço que convide a versão verificada: https://twokei.com`,
            `**Convide a [nova versão](https://twokei.com) para seu servidor em até <t:1694875980:R>!**`,
            "Você pode expulsar este bot do seu servidor, ou somente apagar este canal.",
            "Caso tenha alguma dúvida, entre em contato com o desenvolvedor: **doiska#0001**",
            "Se você já convidou, desconsidere esta mensagem.",
            " ",
            `${Icons.HanakoEating} Obrigado por utilizar o Twokei Music!`,
          ].join("\n"),
        );

      if (channel && isTextChannel(channel)) {
        await channel.send({ embeds: [embed], components: [row] }).catch(noop);
      }

      if (owner) {
        await owner.send({ embeds: [embed], components: [row] }).catch(noop);
      }
    }
  }
};

void main();
