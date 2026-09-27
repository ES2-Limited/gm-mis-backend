import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1718000000000 implements MigrationInterface {
  name = 'InitSchema1718000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "title" varchar,
        "email" varchar,
        "phone" varchar,
        "role" varchar NOT NULL,
        "specialty" varchar,
        "tier" integer,
        "scope" varchar NOT NULL DEFAULT 'All states',
        "status" varchar NOT NULL DEFAULT 'active',
        "permissions" jsonb,
        "passwordHash" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
