import { MigrationInterface, QueryRunner } from 'typeorm';

export class DevicesSchema1718000000015 implements MigrationInterface {
  name = 'DevicesSchema1718000000015';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS "devices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "deviceId" varchar NOT NULL,
        "userEmail" varchar,
        "userName" varchar,
        "role" varchar,
        "tier" int,
        "state" varchar,
        "lga" varchar,
        "platform" varchar,
        "osVersion" varchar,
        "appVersion" varchar,
        "firstSeenAt" timestamptz NOT NULL,
        "lastSeenAt" timestamptz NOT NULL,
        "lastSyncAt" timestamptz,
        "heartbeats" int NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_devices_id" PRIMARY KEY ("id")
      )
    `);
    await q.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_devices_deviceId" ON "devices" ("deviceId")`,
    );
    await q.query(
      `CREATE INDEX IF NOT EXISTS "IDX_devices_state" ON "devices" ("state")`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "devices"`);
  }
}
