import { MigrationInterface, QueryRunner } from 'typeorm';

export class OfflinePolicy1718000000017 implements MigrationInterface {
  name = 'OfflinePolicy1718000000017';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "activation_codes" ADD COLUMN IF NOT EXISTS "maxOfflineDays" int NOT NULL DEFAULT 10`);
    await q.query(`ALTER TABLE "devices" ADD COLUMN IF NOT EXISTS "maxOfflineDays" int`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "activation_codes" DROP COLUMN IF EXISTS "maxOfflineDays"`);
    await q.query(`ALTER TABLE "devices" DROP COLUMN IF EXISTS "maxOfflineDays"`);
  }
}
