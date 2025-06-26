CREATE TABLE "kv" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" uuid,
	"value" json
);
