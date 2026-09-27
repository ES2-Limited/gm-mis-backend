import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  TAXONOMY,
  defaultRoute,
  COVERAGE,
  SLA_DEFAULT,
  TIER_DAYS_DEFAULT,
} from '../seed-data';

export class SeedSettings1718000000003 implements MigrationInterface {
  name = 'SeedSettings1718000000003';

  public async up(q: QueryRunner): Promise<void> {

    let order = 0;
    for (const c of TAXONOMY) {
      await q.query(
        `INSERT INTO "categories"
           ("name","description","subgroups","responsible","lead","route","priority","restricted","startLevel","custom","sortOrder")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,false,$10)
         ON CONFLICT ("name") DO NOTHING`,
        [
          c.name,
          c.description,
          JSON.stringify(c.subgroups),
          JSON.stringify(c.responsible),
          c.lead,
          JSON.stringify(defaultRoute(c)),
          c.priority,
          c.restricted ?? false,
          1,
          order++,
        ],
      );
    }

    for (const [state, lgas] of Object.entries(COVERAGE)) {
      await q.query(
        `INSERT INTO "coverage_states" ("name","active") VALUES ($1, true)
         ON CONFLICT ("name") DO NOTHING`,
        [state],
      );
      for (const lga of lgas as string[]) {
        await q.query(
          `INSERT INTO "coverage_lgas" ("state","name","covered") VALUES ($1,$2,true)
           ON CONFLICT ("state","name") DO NOTHING`,
          [state, lga],
        );
      }
    }

    await q.query(
      `INSERT INTO "app_settings" ("key","value") VALUES ('sla', $1)
       ON CONFLICT ("key") DO NOTHING`,
      [JSON.stringify(SLA_DEFAULT)],
    );
    await q.query(
      `INSERT INTO "app_settings" ("key","value") VALUES ('tierDays', $1)
       ON CONFLICT ("key") DO NOTHING`,
      [JSON.stringify(TIER_DAYS_DEFAULT)],
    );

    // Audit log is NOT seeded — it is a real, append-only trail populated by
    // genuine activity (logins, case actions, restricted access, Insights use).
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DELETE FROM "audit_log"`);
    await q.query(`DELETE FROM "app_settings" WHERE "key" IN ('sla','tierDays')`);
    await q.query(`DELETE FROM "communities"`);
    await q.query(`DELETE FROM "coverage_lgas"`);
    await q.query(`DELETE FROM "coverage_states"`);
    await q.query(`DELETE FROM "categories" WHERE "custom" = false`);
  }
}
