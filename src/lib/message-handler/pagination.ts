import type {
  ButtonInteraction,
  EmbedBuilder,
  InteractionButtonComponentData,
  InteractionCollector,
  InteractionEditReplyOptions,
  InteractionResponse,
  LinkButtonComponentData,
  Message,
  MessageActionRowComponentBuilder,
  StringSelectMenuComponentData,
} from "discord.js";
import {
  ButtonBuilder,
  ChannelSelectMenuBuilder,
  Collection,
  MentionableSelectMenuBuilder,
  RoleSelectMenuBuilder,
  SelectMenuInteraction,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
} from "discord.js";
import type { AnyInteractableInteraction } from "@sapphire/discord.js-utilities";
import {
  createPartitionedMessageRow,
  isMessageButtonInteractionData,
  isMessageChannelSelectInteractionData,
  isMessageMentionableSelectInteractionData,
  isMessageRoleSelectInteractionData,
  isMessageStringSelectInteractionData,
  isMessageUserSelectInteractionData,
} from "@sapphire/discord.js-utilities";
import type { Awaitable } from "@sapphire/utilities";
import { isFunction, noop } from "@sapphire/utilities";

interface ActionContext {
  response: InteractionResponse;
  collectedInteraction: SelectMenuInteraction | ButtonInteraction;
  collector: InteractionCollector<any>;
  handler: Pagination;
}

type RawAction =
  | StringSelectMenuComponentData
  | LinkButtonComponentData
  | (InteractionButtonComponentData & {
      run: (context: ActionContext) => Awaitable<any>;
    });

export type CallableAction = (context: Pagination) => RawAction;

export type Action = RawAction | CallableAction;

export class Pagination {
  private response!: Message | InteractionResponse;

  public page = 0;

  private static readonly handlers: Collection<string, Pagination> =
    new Collection<string, Pagination>();
  private collector?: InteractionCollector<any>;

  private readonly actions = new Map<string, Action>();

  constructor(
    private readonly interaction: AnyInteractableInteraction,
    public readonly pages: EmbedBuilder[],
    actionsArr?: Action[],
  ) {
    actionsArr?.forEach((raw) => {
      const action = isFunction(raw) ? raw(this) : raw;

      if ("customId" in action) {
        this.actions.set(action.customId, raw);
      } else if ("url" in action) {
        this.actions.set(action.url, raw);
      }
    });
  }

  public async run(ephemeral = true) {
    if (this.interaction.replied) {
      this.response = await this.interaction.fetchReply();
    } else {
      this.response = await this.interaction.deferReply({
        ephemeral: ephemeral ?? true,
        fetchReply: true,
      });
    }

    this.createCollector();
    await this.setPage(0);
  }

  private createCollector() {
    if (this.exists()) {
      this.stopCollector();
    }

    this.collector = this.response
      .createMessageComponentCollector({
        filter: (interaction) =>
          (interaction.isStringSelectMenu() || interaction.isButton()) &&
          interaction.user.id === this.interaction.user.id,
      })
      .on("collect", async (collectedInteraction) => {
        const customId = collectedInteraction.customId;
        const action = this.getAction(customId);

        if (!action || !this.collector) {
          return;
        }

        if (
          !(
            collectedInteraction.isStringSelectMenu() ||
            collectedInteraction.isButton()
          )
        ) {
          return;
        }

        if ("run" in action) {
          await action.run({
            collectedInteraction: collectedInteraction,
            collector: this.collector,
            response: this.response as InteractionResponse,
            handler: this,
          });
        }
      })
      .on("end", () => {
        this.response.delete().catch(noop);
      });
  }

  public exists() {
    return Pagination.handlers.has(this.interaction.user.id);
  }

  private stopCollector() {
    Pagination.handlers.get(this.interaction.user.id)?.collector?.stop();
    Pagination.handlers.delete(this.interaction.user.id);
  }

  public async setPage(index: number) {
    this.page = index;
    await this.interaction.editReply(await this.resolvePage());
  }

  private async resolvePage(): Promise<InteractionEditReplyOptions> {
    const resolved = await this.handleActionLoad(
      Array.from(this.actions.values()),
    );

    return {
      components: createPartitionedMessageRow(resolved),
      embeds: [this.pages[this.page]],
    };
  }

  private getAction(customId: string) {
    const action = this.actions.get(customId);

    if (isFunction(action)) {
      return action(this);
    }

    return action;
  }

  protected async handleActionLoad(
    actions: Action[],
  ): Promise<MessageActionRowComponentBuilder[]> {
    return Promise.all(
      actions.map<Promise<MessageActionRowComponentBuilder>>(
        async (rawInteraction) => {
          const interaction = isFunction(rawInteraction)
            ? rawInteraction(this)
            : rawInteraction;

          if (isMessageButtonInteractionData(interaction)) {
            return new ButtonBuilder(interaction);
          }

          if (isMessageUserSelectInteractionData(interaction)) {
            return new UserSelectMenuBuilder(interaction);
          }

          if (isMessageRoleSelectInteractionData(interaction)) {
            return new RoleSelectMenuBuilder(interaction);
          }

          if (isMessageMentionableSelectInteractionData(interaction)) {
            return new MentionableSelectMenuBuilder(interaction);
          }

          if (isMessageChannelSelectInteractionData(interaction)) {
            return new ChannelSelectMenuBuilder(interaction);
          }

          if (isMessageStringSelectInteractionData(interaction)) {
            return new StringSelectMenuBuilder(interaction);
          }

          throw new Error(
            "Unsupported message component type detected. Validate your code and if you're sure this is a bug in Sapphire make a report in the server",
          );
        },
      ),
    );
  }
}
