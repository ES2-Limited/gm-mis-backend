import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_REFERRAL_AUTHORITIES = [
  { name: 'Customary / Area Court', type: 'Court / Judiciary' },
  { name: 'State High Court', type: 'Court / Judiciary' },
  { name: 'Traditional Ruler / District Head', type: 'Traditional / Community Authority' },
  { name: 'Community / Ward Development Committee', type: 'Traditional / Community Authority' },
  { name: 'State Land / Boundary Bureau', type: 'Land / Boundary Commission' },
  { name: 'Nigeria Police Force', type: 'Police / Security' },
  { name: 'Local Government Authority', type: 'Local Government' },
  { name: 'State Ministry of Justice', type: 'Government Ministry / Agency' },
];

export class SeedReferralAuthorities1718000000014
  implements MigrationInterface
{
  name = 'SeedReferralAuthorities1718000000014';

  public async up(q: QueryRunner): Promise<void> {

    await q.query(
      `INSERT INTO "app_settings" ("key","value") VALUES ('referralAuthorities', $1)
       ON CONFLICT ("key") DO NOTHING`,
      [JSON.stringify(DEFAULT_REFERRAL_AUTHORITIES)],
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(
      `DELETE FROM "app_settings" WHERE "key" = 'referralAuthorities'`,
    );
  }
}
