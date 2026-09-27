import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPin1718000000010 implements MigrationInterface {
  name = 'UserPin1718000000010';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pinHash" varchar`);
    await q.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pinAttempts" integer NOT NULL DEFAULT 0`);
    await q.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pinLockedUntil" timestamptz`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "pinLockedUntil"`);
    await q.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "pinAttempts"`);
    await q.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "pinHash"`);
  }
}
