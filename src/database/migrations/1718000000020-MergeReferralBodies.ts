import { MigrationInterface, QueryRunner } from 'typeorm';

export class MergeReferralBodies1718000000020 implements MigrationInterface {
  name = 'MergeReferralBodies1718000000020';

  public async up(q: QueryRunner): Promise<void> {
    const directory = [
  {
    "name": "Ministry of Gender Affairs and Social Development, Enugu State",
    "type": "SMWA (State Ministry of Women Affairs)",
    "state": "Enugu",
    "area": "Adani Rice Irrigation Project",
    "contact": "SARC office Hotlines: 07032567458, 08060084441 Evelyn Ngozi Onah – 08068528819 Contact 07080798927 Designation: Center Manager"
  },
  {
    "name": "Women Aid Collective, Ulo Umunwanyi (WACOL) Tamar",
    "type": "CSO / NGO",
    "state": "Enugu",
    "area": "Adani Rice Irrigation Project",
    "contact": "Barr Susan Ugwu- 07066135597 SARC Hotlines- 09091333000, 09092777000, 07074792985"
  },
  {
    "name": "Global Health Awareness Research Foundation (GHARF).",
    "type": "CSO / NGO",
    "state": "Enugu",
    "area": "Adani Rice Irrigation Project",
    "contact": "Mrs. Nkechi Igwe- 09080808080 Nwatu Uche- 07031975797"
  },
  {
    "name": "General Hospital Iboko, Ebonyi State",
    "type": "Health / Medical",
    "state": "Ebonyi",
    "area": "Ndieze Irrigation Scheme",
    "contact": "Dr. Okpo Solomon: 08037416285 Eze Susan Amaoge: 09068741873"
  },
  {
    "name": "PHCC Ndiaboishiagu, Ebonyi State",
    "type": "Health / Medical",
    "state": "Ebonyi",
    "area": "Ndieze Irrigation Scheme",
    "contact": "Inspector Agnes: 08030419901"
  },
  {
    "name": "Divisional Police Headquarters, Iboko, Ebonyi State",
    "type": "Security / Police",
    "state": "Ebonyi",
    "area": "Ndieze Irrigation Scheme",
    "contact": "CSP Anthony Nwaba: 08062138581"
  },
  {
    "name": "Ekiti SARC",
    "type": "SARC / One-Stop Centre",
    "state": "Ekiti",
    "area": "Ogbese Irrigation Scheme",
    "contact": "Bar. Rita Ilevbare Ekiti SARC Coordinator Moremi Clinic Hospital Ado-Ekiti: 07050752287; 07039786904"
  },
  {
    "name": "Moremi Clinic",
    "type": "Health / Medical",
    "state": "Ekiti",
    "area": "Ogbese Irrigation Scheme",
    "contact": "Mrs. Tabitha Ogunwale Moremi Clinic state specialist Hospital, Ikere-Ekiti: 08037827284 Mrs. Bankole Abimbola-Moremi Clinic state specialist Hospital, Ikere-Ekiti: 08066459310"
  },
  {
    "name": "Jigawa SARC, General Hospital Dutse, Jigawa State",
    "type": "SARC / One-Stop Centre",
    "state": "Jigawa",
    "area": "Warwade Irrigation Scheme",
    "contact": "Dr Abbas Ya'u Garba: 09033035588 SARC Manager: Aisha Abubakar 08069444225 Nurse"
  },
  {
    "name": "Waraka SARC Centre, Murtala Muhammad Specialist Hospital, Kano State",
    "type": "SARC / One-Stop Centre",
    "state": "Kano",
    "area": "Jakara Irrigation Scheme",
    "contact": "Dr Nasir: 08065340578"
  },
  {
    "name": "Gezawa General Hospital, Kano State",
    "type": "Health / Medical",
    "state": "Kano",
    "area": "Jakara Irrigation Scheme",
    "contact": "Sale A. Sale: 08025743250 BaffahGzw@gmail.com"
  },
  {
    "name": "Minjibir General Hospital, Kano State",
    "type": "Health / Medical",
    "state": "Kano",
    "area": "Jakara Irrigation Scheme",
    "contact": "Nuradden Haladu: 08105442778, 08021219174 annorhaladu@gmail.com"
  },
  {
    "name": "Hisbah Command Minjibir Kano State",
    "type": "Security / Police",
    "state": "Kano",
    "area": "Jakara Irrigation Scheme",
    "contact": "Muhammad Abdussalam Usman: 08062135114 usmanabdassalammuhammad@gmail.com"
  },
  {
    "name": "Dalhatu Araf Specialist Hospital (DASH) SARC, Lafia, Nasarawa State",
    "type": "SARC / One-Stop Centre",
    "state": "Nasarawa",
    "area": "Doma Irrigation Scheme",
    "contact": "Luka Dauda Ogu: 08064992704 SARC manager SARC hotline number: 08067388668"
  },
  {
    "name": "Cottage Hospital Dyerok-Chip, Plateau State",
    "type": "Health / Medical",
    "state": "Plateau",
    "area": "Lonkat Irrigation Scheme",
    "contact": "Mrs. Mwar Samson – 09129216868"
  },
  {
    "name": "NKST Hospital, Makar, Benue State",
    "type": "Health / Medical",
    "state": "Benue",
    "area": "Katsina-Ala Irrigation Scheme",
    "contact": "Dr. Soo Sekav Contact Phone: 08166335526 Designation: Medical Superintendent"
  },
  {
    "name": "General Hospital Gboko, Benue State",
    "type": "Health / Medical",
    "state": "Benue",
    "area": "Katsina-Ala Irrigation Scheme",
    "contact": "Mr Hosea Orsar Ayankaa Contact Number: 07035776002 Designation: Secretary/Head of Department Representative."
  },
  {
    "name": "Ogoja SARC Centre, No. 19 Ikaptang Street, Igoli, Ogoja LGA",
    "type": "SARC / One-Stop Centre",
    "state": "Cross River",
    "area": "Bansara Irrigation Scheme",
    "contact": "Ikpeme Ekanem Kate- 08169042419 Dr. Eka Sonni -08030670543."
  },
  {
    "name": "Bansara Primary Healthcare Centre, Cross River State",
    "type": "Health / Medical",
    "state": "Cross River",
    "area": "Bansara Irrigation Scheme",
    "contact": "Mrs Ebu Juliana Achu- 07030360914 Primary Health Care- 08138345167"
  },
  {
    "name": "Bansara Police Division, Cross River State",
    "type": "Security / Police",
    "state": "Cross River",
    "area": "Bansara Irrigation Scheme",
    "contact": "ASP Emmanuel Ekele: 08027137714: 07080652537"
  },
  {
    "name": "SALAMA Centre, Yusuf Dantsoho Memorial Hospital, Tudun Wada, Kaduna State",
    "type": "SARC / One-Stop Centre",
    "state": "Kaduna",
    "area": "Kangimi Irrigation Scheme",
    "contact": "08092877682;09011578622; 08063968541"
  },
  {
    "name": "Rayuwa SARC, Minna Central Police Clinic, Unguwan Daji, Stadium Road, Minna",
    "type": "Security / Police",
    "state": "Niger",
    "area": "Rabba Irrigation Scheme",
    "contact": "Dr. Tapshak B. Sekat – 08060175683 tapshaksekat@yahoo.com"
  },
  {
    "name": "Bida General Hospital SARC Centre, Bida, Niger State",
    "type": "SARC / One-Stop Centre",
    "state": "Niger",
    "area": "Rabba Irrigation Scheme",
    "contact": "Abdullahi Usman – 08039687936 abdullahelusman@gmail.com"
  },
  {
    "name": "Dallaji Primary Health Care, Warji LGA, Bauchi State",
    "type": "Health / Medical",
    "state": "Bauchi",
    "area": "Galala Irrigation Scheme",
    "contact": "Ahmed Habila – 08100414731"
  },
  {
    "name": "Police Tudun Wada Outpost Division, Warji LGA, Bauchi State",
    "type": "Security / Police",
    "state": "Bauchi",
    "area": "Galala Irrigation Scheme",
    "contact": "ASP Sa’id Shuaibu – 07037198909"
  },
  {
    "name": "Hope Centre, State Specialist Hospital, Jimeta, Yola, Adamawa State",
    "type": "SARC / One-Stop Centre",
    "state": "Adamawa",
    "area": "Gerio Irrigation Scheme",
    "contact": "Dr. Usha Saxena – 08069710461"
  },
  {
    "name": "Women Development One-Stop Centre, beside High Court, Yola, Adamawa State",
    "type": "Legal / Justice",
    "state": "Yobe",
    "area": "Lava Irrigation Scheme",
    "contact": "Falda Wesley – 08032448480"
  },
  {
    "name": "General Hospital Gashua SARC Centre, Sabongari Ward, Bade LGA, Yobe State",
    "type": "SARC / One-Stop Centre",
    "state": "Yobe",
    "area": "Lava Irrigation Scheme",
    "contact": "Bukar Tijjani: 08037686520; Sister Sadiya Usman: 08033876043"
  },
  {
    "name": "First Referral Hospital, Gwadabawa Lau, Taraba State",
    "type": "Health / Medical",
    "state": "Taraba",
    "area": "Lau Irrigation Scheme",
    "contact": "Dr. Lawrence 08026097020; 08035666214 Dr. Abdullahi Mohammad: 08100497240"
  },
  {
    "name": "Primary Health Care Centre, Lau, Taraba State",
    "type": "Health / Medical",
    "state": "Taraba",
    "area": "Lau Irrigation Scheme",
    "contact": "Theophilus Patrik: 09036263680, 09116702196"
  },
  {
    "name": "General Hospital, Balanga, Balanga Local Government Area, Gombe State",
    "type": "Health / Medical",
    "state": "Gombe",
    "area": "Balanga Dam Scheme",
    "contact": "Emmanuel Kabziel- 07069436933"
  },
  {
    "name": "NSCDC Balanga, Balanga Local Government Area, Gombe State",
    "type": "Security / Police",
    "state": "Gombe",
    "area": "Balanga Dam Scheme",
    "contact": "Hassan Sarki- 08027913107"
  },
  {
    "name": "FOMWAN Balanga, Balanga Local Government Area, Gombe State",
    "type": "CSO / NGO",
    "state": "Gombe",
    "area": "Balanga Dam Scheme",
    "contact": "Dija Ayuba Gudu: 07030524357"
  },
  {
    "name": "Balanga LGA Social welfare, Balanga Local Government Area, Gombe State",
    "type": "SMWA (State Ministry of Women Affairs)",
    "state": "Gombe",
    "area": "Balanga Dam Scheme",
    "contact": "Munatu Simon: 08068445418"
  },
  {
    "name": "TADEPA Talasse Balanga, Balanga Local Government Area, Gombe State",
    "type": "CSO / NGO",
    "state": "Gombe",
    "area": "Balanga Dam Scheme",
    "contact": "Ahmadu Ali Lumbo: 08038189840 Sector/Service: Legal"
  },
  {
    "name": "Comprehensive Health Centre (CHC) Danja",
    "type": "Health / Medical",
    "state": "Katsina",
    "area": "Danja Irrigation Scheme",
    "contact": "Kabir Danja: 08053313831"
  },
  {
    "name": "The Nigerian Police, Danja Division",
    "type": "Security / Police",
    "state": "Katsina",
    "area": "Danja Irrigation Scheme",
    "contact": "Ibrahim Damagun: 08034391632"
  },
  {
    "name": "Shari'a Court",
    "type": "Legal / Justice",
    "state": "Katsina",
    "area": "Danja Irrigation Scheme",
    "contact": "Danja Town, Danja Local Govt Area, Katsina State"
  },
  {
    "name": "Nana Khadija Sexual Assult Referral Centre, Specialist Hospital Sokoto",
    "type": "SARC / One-Stop Centre",
    "state": "Sokoto",
    "area": "Kware Irrigation Scheme",
    "contact": "Centre Manager. Dr. Auwal Ahmed Musa 08039438289 Director, Women & Child Affairs: Hadiza Umar Jabo: 08035775191 GBV & Child Protection Coordinator Rabiu Bello Gandi: 0903234444"
  },
  {
    "name": "Mai Talle Tara, Kebbi State, Teaching Hospital, Kalgo, Birnin Kebbi",
    "type": "Health / Medical",
    "state": "Kebbi",
    "area": "B/Kebbi Irrigation Scheme",
    "contact": ""
  },
  {
    "name": "General Hospital, Odo-Ere",
    "type": "Health / Medical",
    "state": "Kwara",
    "area": "Duku-Lade Irrigation Scheme",
    "contact": "Thomas Lapenle Omowumi: (Hospital sec) 07037358108"
  },
  {
    "name": "Cottage Hospital, Lade",
    "type": "Health / Medical",
    "state": "Kwara",
    "area": "Duku-Lade Irrigation Scheme",
    "contact": "NdakansaMuhammed: 07069422350"
  },
  {
    "name": "N.S.C.D.C",
    "type": "Other",
    "state": "Kwara",
    "area": "Duku-Lade Irrigation Scheme",
    "contact": "Ibrahim W. Obansa: 07068483556"
  },
  {
    "name": "Area court, Lade",
    "type": "Legal / Justice",
    "state": "Kwara",
    "area": "Duku-Lade Irrigation Scheme",
    "contact": "Aliyu Gana (Registrar): 08068765008"
  },
  {
    "name": "Generel Hospital Talata Mafara: Along Sokoto Gusau road, Talata Mafara",
    "type": "Health / Medical",
    "state": "Zamfara",
    "area": "Natu Irrigation Scheme",
    "contact": "Sanusi Nuhu : 08066845432"
  },
  {
    "name": "Hisbah commission: Talata Mafara local government secretariat",
    "type": "Security / Police",
    "state": "Zamfara",
    "area": "Natu Irrigation Scheme",
    "contact": "Sani Muhammad: 07067690432"
  },
  {
    "name": "NSCDC: Talata Mafara, Along Gusau road",
    "type": "Security / Police",
    "state": "Zamfara",
    "area": "Natu Irrigation Scheme",
    "contact": "Saleh Umar: 08136313336"
  }
];
    const rows = await q.query(
      `SELECT "value" FROM "app_settings" WHERE "key" = 'referralBodies'`,
    );
    const cur = rows?.[0]?.value;
    const existing: any[] = Array.isArray(cur) ? cur : [];
    const key = (b: any) =>
      `${(b?.name || '').trim().toLowerCase()}|${(b?.state || '').trim().toLowerCase()}`;
    const seen = new Set(existing.map(key));
    const merged = [...existing];
    for (const b of directory) {
      if (!seen.has(key(b))) {
        seen.add(key(b));
        merged.push(b);
      }
    }
    await q.query(
      `INSERT INTO "app_settings" ("key","value") VALUES ('referralBodies', $1)
       ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value"`,
      [JSON.stringify(merged)],
    );
  }

  public async down(): Promise<void> {
    // no-op: a merge cannot be safely reverted without dropping curated entries
  }
}
