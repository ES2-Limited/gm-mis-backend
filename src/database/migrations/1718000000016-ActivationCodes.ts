import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActivationCodes1718000000016 implements MigrationInterface {
  name = 'ActivationCodes1718000000016';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS "activation_codes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" varchar NOT NULL,
        "userId" varchar, "userEmail" varchar NOT NULL, "userName" varchar,
        "state" varchar, "role" varchar, "tier" int,
        "issuedBy" varchar,
        "status" varchar NOT NULL DEFAULT 'pending',
        "deviceId" varchar,
        "activatedAt" timestamptz,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activation_codes_id" PRIMARY KEY ("id")
      )
    `);
    await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_activation_codes_code" ON "activation_codes" ("code")`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_activation_codes_state" ON "activation_codes" ("state")`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "activation_codes"`);
  }
}
