ALTER TABLE "app"."song_profile_sources" ALTER COLUMN "source" SET DATA TYPE source;
ALTER TABLE "app"."song_profile_sources" ALTER COLUMN "source" SET NOT NULL;
ALTER TABLE "app"."song_profile_sources" ALTER COLUMN "source_url" SET NOT NULL;
ALTER TABLE "app"."song_profile" ADD COLUMN "display_name" varchar NOT NULL;
ALTER TABLE "app"."song_profile" ADD COLUMN "pronouns" varchar;