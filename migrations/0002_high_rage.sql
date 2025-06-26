ALTER TABLE "kv" ALTER COLUMN "key" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "kv" ALTER COLUMN "key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "kv" ADD CONSTRAINT "kv_key_unique" UNIQUE("key");