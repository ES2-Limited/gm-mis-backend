import { MigrationInterface, QueryRunner } from 'typeorm';

export class OtpCodes1718000000008 implements MigrationInterface {
  name = 'OtpCodes1718000000008';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE "otp_codes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "email" varchar NOT NULL,
        "purpose" varchar NOT NULL,
        "caseRef" varchar,
        "codeHash" varchar NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "consumedAt" TIMESTAMPTZ,
        "attempts" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_otp_codes_id" PRIMARY KEY ("id")
      )`);
    await q.query(`CREATE INDEX "IDX_otp_user" ON "otp_codes" ("userId")`);
    await q.query(`CREATE INDEX "IDX_otp_purpose" ON "otp_codes" ("purpose")`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "otp_codes"`);
  }
}
