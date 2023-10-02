CREATE TABLE IF NOT EXISTS "dev"."giftcards" (
	"code" varchar PRIMARY KEY NOT NULL,
	"consumed" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
DROP TABLE "dev"."song_user_playlists";