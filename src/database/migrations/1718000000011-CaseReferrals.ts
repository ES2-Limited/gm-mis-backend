import { MigrationInterface, QueryRunner } from 'typeorm';

export class CaseReferrals1718000000011 implements MigrationInterface {
  name = 'CaseReferrals1718000000011';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "referrals" jsonb NOT NULL DEFAULT '[]'`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "cases" DROP COLUMN IF EXISTS "referrals"`);
  }
}
