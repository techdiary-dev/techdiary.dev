CREATE TABLE "gist_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gist_id" uuid NOT NULL,
	"filename" varchar NOT NULL,
	"content" text NOT NULL,
	"language" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT true,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "gist_files" ADD CONSTRAINT "gist_files_gist_id_gists_id_fk" FOREIGN KEY ("gist_id") REFERENCES "public"."gists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gists" ADD CONSTRAINT "gists_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;