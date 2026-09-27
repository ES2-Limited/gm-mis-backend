import { MigrationInterface, QueryRunner } from 'typeorm';

export class SuperAdmin1718000000004 implements MigrationInterface {
  name = 'SuperAdmin1718000000004';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isSuperAdmin" boolean NOT NULL DEFAULT false`,
    );
    await q.query(
      `UPDATE "users" SET "isSuperAdmin" = true WHERE "email" = 'admin@spinproject.ng'`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "isSuperAdmin"`);
  }
}
