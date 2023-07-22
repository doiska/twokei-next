CREATE TABLE IF NOT EXISTS "guilds" (
	"guild_id" varchar PRIMARY KEY NOT NULL,
	"name" varchar,
	"locale" varchar DEFAULT 'en_us' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "played_songs" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"guild_id" varchar NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"song_name" varchar NOT NULL,
	"song_url" varchar NOT NULL,
	"song_length" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "users_playlists" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"playlist_name" varchar NOT NULL,
	"playlist_url" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "song_channels" (
	"guild_id" varchar PRIMARY KEY NOT NULL,
	"channel_id" varchar NOT NULL,
	"message_id" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"name" varchar,
	"locale" varchar DEFAULT 'en_us' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "songUrlUnique" ON "played_songs" ("song_url","user_id");
DO $$ BEGIN
 ALTER TABLE "played_songs" ADD CONSTRAINT "played_songs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
