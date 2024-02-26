CREATE TABLE IF NOT EXISTS "app"."analytics_track_info" (
	"id" varchar PRIMARY KEY NOT NULL,
	"spotify_id" varchar,
	"title" varchar,
	"artists" varchar,
	"duration_in_ms" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."analytics_user_added_tracks" (
	"user_id" varchar NOT NULL,
	"track_id" varchar NOT NULL,
	"guild_id" varchar,
	"listened" integer DEFAULT 1,
	"properties" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "analytics_user_added_tracks_user_id_track_id_guild_id_unique" UNIQUE("user_id","track_id","guild_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."analytics_user_listened_tracks" (
	"user_id" varchar NOT NULL,
	"track_id" varchar NOT NULL,
	"guild_id" varchar,
	"listened" integer DEFAULT 1,
	"properties" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "analytics_user_listened_tracks_user_id_track_id_guild_id_unique" UNIQUE("user_id","track_id","guild_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."core_guilds" (
	"guild_id" varchar PRIMARY KEY NOT NULL,
	"name" varchar,
	"locale" varchar DEFAULT 'pt_br' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."core_nodes" (
	"name" varchar NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"current_status" varchar DEFAULT 'DISCONNECTED',
	"url" varchar PRIMARY KEY NOT NULL,
	"auth" varchar NOT NULL,
	"secure" boolean DEFAULT false NOT NULL,
	"group" varchar DEFAULT 'default' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."core_scheduler" (
	"name" varchar NOT NULL,
	"service" varchar PRIMARY KEY NOT NULL,
	"schedule" varchar NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."core_users" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"locale" varchar DEFAULT 'pt_br',
	"role" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."player_categories" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"icon" varchar(255) NOT NULL,
	"market" varchar(255) NOT NULL,
	"locale" varchar(255) NOT NULL,
	"href" varchar(255),
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."player_embed_arts" (
	"name" varchar,
	"url" varchar PRIMARY KEY NOT NULL,
	"author" varchar NOT NULL,
	"author_url" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."player_playlists" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"category_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"icon" varchar(255),
	"href" varchar(255),
	"genres" jsonb DEFAULT '[]'::jsonb,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."player_presets" (
	"name" varchar,
	"market" varchar,
	"popularity" numeric,
	"categories" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."player_sessions" (
	"guild_id" varchar PRIMARY KEY NOT NULL,
	"queue" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."player_song_channels" (
	"guild_id" varchar PRIMARY KEY NOT NULL,
	"channel_id" varchar NOT NULL,
	"message_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
