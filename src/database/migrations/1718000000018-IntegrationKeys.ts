import { MigrationInterface, QueryRunner } from 'typeorm';

export class IntegrationKeys1718000000018 implements MigrationInterface {
  name = 'IntegrationKeys1718000000018';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS "integration_keys" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "label" varchar NOT NULL,
        "prefix" varchar NOT NULL,
        "keyHash" varchar NOT NULL,
        "scope" varchar NOT NULL DEFAULT 'create_cases',
        "createdBy" varchar,
        "lastUsedAt" timestamptz,
        "requests" int NOT NULL DEFAULT 0,
        "revoked" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_integration_keys_id" PRIMARY KEY ("id")
      )
    `);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_integration_keys_prefix" ON "integration_keys" ("prefix")`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "integration_keys"`);
  }
}
