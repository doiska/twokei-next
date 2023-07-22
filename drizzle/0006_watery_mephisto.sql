CREATE TABLE IF NOT EXISTS "app"."song_profile_actions" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"target_id" varchar NOT NULL,
	"action" song_profile_action NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "app"."song_user_events" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"source" song_user_events_source NOT NULL,
	"event" song_user_events_type NOT NULL,
	"properties" jsonb,
	"created_at" timestamp DEFAULT now()
);

DO $$ BEGIN
 ALTER TABLE "app"."song_profile_actions" ADD CONSTRAINT "song_profile_actions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "app"."song_profile_actions" ADD CONSTRAINT "song_profile_actions_target_id_users_user_id_fk" FOREIGN KEY ("target_id") REFERENCES "app"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "app"."song_user_events" ADD CONSTRAINT "song_user_events_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
