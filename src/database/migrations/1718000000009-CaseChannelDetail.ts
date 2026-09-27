import { MigrationInterface, QueryRunner } from 'typeorm';

export class CaseChannelDetail1718000000009 implements MigrationInterface {
  name = 'CaseChannelDetail1718000000009';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "channelDetail" varchar`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "cases" DROP COLUMN IF EXISTS "channelDetail"`);
  }
}
