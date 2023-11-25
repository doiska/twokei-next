CREATE TABLE IF NOT EXISTS "dev"."core_guilds"
(
    "guild_id"   varchar PRIMARY KEY       NOT NULL,
    "name"       varchar,
    "locale"     varchar   DEFAULT 'pt_br' NOT NULL,
    "created_at" timestamp DEFAULT now()   NOT NULL,
    "updated_at" timestamp DEFAULT now()   NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dev"."core_users"
(
    "user_id"    varchar PRIMARY KEY     NOT NULL,
    "name"       varchar,
    "locale"     varchar   DEFAULT 'pt_br',
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dev"."player_sessions"
(
    "guild_id"   varchar PRIMARY KEY           NOT NULL,
    "queue"      jsonb     DEFAULT '[]'::jsonb NOT NULL,
    "state"      jsonb     DEFAULT '{}'::jsonb NOT NULL,
    "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dev"."core_settings"
(
    "name"  varchar PRIMARY KEY NOT NULL,
    "value" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dev"."player_song_channels"
(
    "guild_id"   varchar PRIMARY KEY NOT NULL,
    "channel_id" varchar             NOT NULL,
    "message_id" varchar             NOT NULL
);
