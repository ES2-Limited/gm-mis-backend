import { MigrationInterface, QueryRunner } from 'typeorm';

export class CasesSchema1718000000005 implements MigrationInterface {
  name = 'CasesSchema1718000000005';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE "cases" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" varchar NOT NULL,
        "complainant" varchar NOT NULL,
        "phone" varchar,
        "email" varchar,
        "anonymous" boolean NOT NULL DEFAULT false,
        "state" varchar NOT NULL,
        "lga" varchar,
        "community" varchar,
        "lat" double precision,
        "lng" double precision,
        "category" varchar NOT NULL,
        "subcategory" varchar,
        "channel" varchar NOT NULL,
        "priority" varchar NOT NULL DEFAULT 'medium',
        "status" varchar NOT NULL DEFAULT 'received',
        "tier" integer NOT NULL DEFAULT 1,
        "tier_since" TIMESTAMPTZ,
        "responsibleUnit" varchar,
        "assignedOfficer" varchar,
        "screening" varchar,
        "narrative" text,
        "description" text,
        "due_at" TIMESTAMPTZ,
        "resolved_at" TIMESTAMPTZ,
        "notes" jsonb NOT NULL DEFAULT '[]',
        "investigation" jsonb,
        "correctiveActions" jsonb NOT NULL DEFAULT '[]',
        "appeals" jsonb NOT NULL DEFAULT '[]',
        "escalations" jsonb NOT NULL DEFAULT '[]',
        "activity" jsonb NOT NULL DEFAULT '[]',
        "satisfaction" jsonb,
        "autoEscalated" boolean NOT NULL DEFAULT false,
        "registeredBy" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cases_id" PRIMARY KEY ("id")
      )`);
    await q.query(`CREATE UNIQUE INDEX "IDX_cases_code" ON "cases" ("code")`);
    await q.query(`CREATE INDEX "IDX_cases_state" ON "cases" ("state")`);
    await q.query(`CREATE INDEX "IDX_cases_category" ON "cases" ("category")`);
    await q.query(`CREATE INDEX "IDX_cases_status" ON "cases" ("status")`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "cases"`);
  }
}
