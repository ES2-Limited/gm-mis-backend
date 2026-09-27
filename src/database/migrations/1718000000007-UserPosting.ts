import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPosting1718000000007 implements MigrationInterface {
  name = 'UserPosting1718000000007';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lga" varchar`);
    await q.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "community" varchar`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "community"`);
    await q.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "lga"`);
  }
}
