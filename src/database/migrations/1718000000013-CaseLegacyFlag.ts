import { MigrationInterface, QueryRunner } from 'typeorm';

export class CaseLegacyFlag1718000000013 implements MigrationInterface {
  name = 'CaseLegacyFlag1718000000013';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "legacy" boolean NOT NULL DEFAULT false`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "cases" DROP COLUMN IF EXISTS "legacy"`);
  }
}
