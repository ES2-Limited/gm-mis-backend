import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';

const SUPERADMIN = {
  name: 'System Administrator',
  email: 'admin@spinproject.ng',
  role: 'FPMU Admin',
  scope: 'All states',
  status: 'active',
};

export class SeedUsers1718000000001 implements MigrationInterface {
  name = 'SeedUsers1718000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = process.env.SEED_PASSWORD || 'spin2026';
    const hash = await bcrypt.hash(password, 10);

    await queryRunner.query(
      `INSERT INTO "users" ("name", "email", "role", "scope", "status", "passwordHash")
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT ("email") DO NOTHING`,
      [SUPERADMIN.name, SUPERADMIN.email, SUPERADMIN.role, SUPERADMIN.scope, SUPERADMIN.status, hash],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "users" WHERE "email" = $1`, [SUPERADMIN.email]);
  }
}
