CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1000),
	"price" numeric NOT NULL,
	"category" varchar(100),
	"stock" integer DEFAULT 0 NOT NULL
);
