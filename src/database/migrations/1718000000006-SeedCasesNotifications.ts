import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCasesNotifications1718000000006 implements MigrationInterface {
  name = 'SeedCasesNotifications1718000000006';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "recipientName" varchar,
        "recipientScope" varchar,
        "type" varchar NOT NULL,
        "title" varchar NOT NULL,
        "body" text,
        "caseId" uuid,
        "caseCode" varchar,
        "severity" varchar NOT NULL DEFAULT 'normal',
        "read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id")
      )`);
    await q.query(`CREATE INDEX "IDX_notifications_recipient" ON "notifications" ("recipientName")`);
    await q.query(`CREATE INDEX "IDX_notifications_read" ON "notifications" ("read")`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "notifications"`);
  }
}
