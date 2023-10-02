CREATE TABLE IF NOT EXISTS "main"."player_sessions" (
	"guild_id" varchar PRIMARY KEY NOT NULL,
	"queue" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "main"."logs";--> statement-breakpoint
DROP TABLE "main"."song_user_events";--> statement-breakpoint
DROP TABLE "main"."users_benefits";
