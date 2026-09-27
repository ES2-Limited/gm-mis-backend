import { MigrationInterface, QueryRunner } from 'typeorm';
import { TAXONOMY } from '../seed-data';

export class AddDomainToCategories1718000000012 implements MigrationInterface {
  name = 'AddDomainToCategories1718000000012';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "domain" varchar NOT NULL DEFAULT 'Other'`,
    );

    for (const c of TAXONOMY) {
      await q.query(`UPDATE "categories" SET "domain" = $1 WHERE "name" = $2`, [
        c.domain,
        c.name,
      ]);
    }
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "domain"`);
  }
}
