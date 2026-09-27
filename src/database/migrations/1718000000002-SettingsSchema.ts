import { MigrationInterface, QueryRunner } from 'typeorm';

export class SettingsSchema1718000000002 implements MigrationInterface {
  name = 'SettingsSchema1718000000002';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "description" text NOT NULL DEFAULT '',
        "subgroups" jsonb NOT NULL DEFAULT '[]',
        "responsible" jsonb NOT NULL DEFAULT '[]',
        "lead" varchar,
        "route" jsonb NOT NULL DEFAULT '[]',
        "priority" varchar NOT NULL DEFAULT 'medium',
        "restricted" boolean NOT NULL DEFAULT false,
        "startLevel" integer NOT NULL DEFAULT 1,
        "custom" boolean NOT NULL DEFAULT false,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories_id" PRIMARY KEY ("id")
      )`);
    await q.query(`CREATE UNIQUE INDEX "IDX_categories_name" ON "categories" ("name")`);

    await q.query(`
      CREATE TABLE "coverage_states" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_coverage_states_id" PRIMARY KEY ("id")
      )`);
    await q.query(`CREATE UNIQUE INDEX "IDX_coverage_states_name" ON "coverage_states" ("name")`);

    await q.query(`
      CREATE TABLE "coverage_lgas" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "state" varchar NOT NULL,
        "name" varchar NOT NULL,
        "covered" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_coverage_lgas_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_coverage_lgas" UNIQUE ("state", "name")
      )`);
    await q.query(`CREATE INDEX "IDX_coverage_lgas_state" ON "coverage_lgas" ("state")`);

    await q.query(`
      CREATE TABLE "communities" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "state" varchar NOT NULL,
        "lga" varchar NOT NULL,
        "name" varchar NOT NULL,
        CONSTRAINT "PK_communities_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_communities" UNIQUE ("state", "lga", "name")
      )`);
    await q.query(`CREATE INDEX "IDX_communities_state" ON "communities" ("state")`);
    await q.query(`CREATE INDEX "IDX_communities_lga" ON "communities" ("lga")`);

    await q.query(`
      CREATE TABLE "app_settings" (
        "key" varchar NOT NULL,
        "value" jsonb NOT NULL,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_app_settings_key" PRIMARY KEY ("key")
      )`);

    await q.query(`
      CREATE TABLE "audit_log" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "at" TIMESTAMPTZ NOT NULL,
        "actor" varchar NOT NULL,
        "role" varchar,
        "scope" varchar,
        "action" varchar NOT NULL,
        "label" varchar,
        "target" varchar,
        "detail" text,
        "ip" varchar,
        "severity" varchar NOT NULL DEFAULT 'normal',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_log_id" PRIMARY KEY ("id")
      )`);
    await q.query(`CREATE INDEX "IDX_audit_log_at" ON "audit_log" ("at")`);
    await q.query(`CREATE INDEX "IDX_audit_log_action" ON "audit_log" ("action")`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "audit_log"`);
    await q.query(`DROP TABLE IF EXISTS "app_settings"`);
    await q.query(`DROP TABLE IF EXISTS "communities"`);
    await q.query(`DROP TABLE IF EXISTS "coverage_lgas"`);
    await q.query(`DROP TABLE IF EXISTS "coverage_states"`);
    await q.query(`DROP TABLE IF EXISTS "categories"`);
  }
}
