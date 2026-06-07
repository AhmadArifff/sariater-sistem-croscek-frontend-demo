export const EMPLOYEE_DUMMY_HEADERS = ["NAMA", "NIK", "JABATAN", "DEPT", "ID ABSEN"];
export const EMPLOYEE_DUMMY_MAX_ROWS = 1000;

const FIRST_NAMES = [
  "AARON",
  "ABDUL",
  "ADITYA",
  "AGUNG",
  "AHMAD",
  "AISYAH",
  "ALDI",
  "AMALIA",
  "ANDI",
  "ANGGA",
  "ANISA",
  "ARIF",
  "ARYA",
  "BAGAS",
  "BAYU",
  "BIMA",
  "CANDRA",
  "CITRA",
  "DEWI",
  "DIAN",
  "DIMAS",
  "EKA",
  "ELSA",
  "FAJAR",
  "FARHAN",
  "FITRI",
  "GALIH",
  "GITA",
  "HADI",
  "HENDRA",
  "ILHAM",
  "INTAN",
  "IRFAN",
  "JOKO",
  "KURNIA",
  "LAILA",
  "LINA",
  "MAULANA",
  "MAYA",
  "NADIA",
  "NANDA",
  "NUR",
  "OKTA",
  "PRIMA",
  "PUTRA",
  "PUTRI",
  "RAHMA",
  "RANGGA",
  "REZA",
  "RINA",
  "RIZKY",
  "SANDI",
  "SANTI",
  "SATRIA",
  "SITI",
  "TANTO",
  "TIKA",
  "WAHYU",
  "YOGA",
  "YULIA"
];

const MIDDLE_NAMES = [
  "ADI",
  "AJI",
  "BAGUS",
  "BUDI",
  "CAHYA",
  "DWI",
  "EKO",
  "FAHMI",
  "GILANG",
  "HAFIZ",
  "IBRA",
  "JAYA",
  "KRESNA",
  "LUHUR",
  "MAHA",
  "NUSA",
  "PRAJA",
  "RAKA",
  "RAMA",
  "RIZAL",
  "SAKTI",
  "SURYA",
  "TIRTA",
  "UTAMA",
  "WIRA"
];

const LAST_NAMES = [
  "ADINATA",
  "ANGGRAINI",
  "FIRMANSYAH",
  "GUNAWAN",
  "HARTONO",
  "HIDAYAT",
  "KARTIKA",
  "KUSUMA",
  "LESTARI",
  "MAHARANI",
  "NUGRAHA",
  "PERDANA",
  "PERMANA",
  "PRADANA",
  "PRAMUDYA",
  "PRATAMA",
  "RAHAYU",
  "RAHMAN",
  "RAMADHAN",
  "SAPUTRA",
  "SARI",
  "SETIAWAN",
  "SUSANTI",
  "UTAMI",
  "WIBOWO",
  "WIJAYA",
  "YUDHISTIRA"
];

const DEPTS = [
  "A & G",
  "ACCOUNTING",
  "CAMPERVAN",
  "CAMPING PARK",
  "ENGINEERING",
  "F&B PRODUCT",
  "F&B SERVICE",
  "FOOD & BEVERAGE",
  "FRONT OFFICE",
  "HOUSEKEEPING",
  "HUMAN RESOURCE",
  "IT",
  "PURCHASING",
  "RECREATION",
  "SALES & MARKETING",
  "SECURITY",
  "SPORT ADVENTURE",
  "TICKETING"
];

const JOBS = [
  "ACCOUNT PAYABLE SPV",
  "ACCOUNT PAYABLE STAFF",
  "ACCOUNT RECEIVABLE STAFF",
  "ACCOUNTING ADM",
  "ADM IT",
  "ADMINISTRATION",
  "ADMINTRATION",
  "ASSISTANT HR. MANAGER",
  "ASSISTANT PUBLIC RELATIONS MANAGER",
  "ASST. CAMPING PARK MGR",
  "ASST. CHIEF ACCOUNTING",
  "ASST. CHIEF SECURITY",
  "ASST. CIVIL SPV",
  "ASST. CREDIT MANAGER",
  "ASST. EXECUTIVE HOUSE KEEPER",
  "ASST. FRONT OFFICE MANAGER",
  "ASST. HK SUPERVISOR",
  "ASST. PURCHASING  MANAGER",
  "ASST. TECHNICIAN SPV",
  "ASST. TIKETING MANAGER",
  "AUTOMOTIVE OFFICER",
  "BARISTA",
  "BELL BOY",
  "BOOK KEEPER",
  "CAMPERVAN ATT",
  "CAMPERVAN PARK SPV",
  "CAMPERVANS PARK COORD",
  "CAMPING PARK SPV",
  "CAPTAIN OUTLET",
  "CAPTAIN WAITER",
  "CARD CENTRE STAFF",
  "CASHIER SPV",
  "CHEF DE PARTIE",
  "CHIEF ACCOUNTING",
  "CHIEF ARGO & NURSERY",
  "CHIEF CAMPING PARK",
  "CHIEF ENGINEERING",
  "CHIEF ENGINEERING ADM",
  "CHIEF GARDENER & ARTIST",
  "CHIEF LINEN",
  "CHIEF SECURITY",
  "CHIEF STEWARD",
  "CHIEF ZONA",
  "CHIF DE PARTIE",
  "COOK 2",
  "COST CONTROL SUPERVISOR",
  "DANRU",
  "DIGITAL MARKETING",
  "DIRECTOR OF SALES",
  "DIRECTOR OF SALES & MARKETING",
  "DRAFTER & ESTIMATOR SPV",
  "DRIVER",
  "DUTY MANAGER",
  "E-COMMERCE OFFICER",
  "ELECTRICAL SUPERVISOR",
  "ELECTRICAL TECHNICIAN",
  "EMPLOYEE PERFORMANCE COORD",
  "ENGINEERING SECRETARY",
  "EQUIPMENT STORAGE CLERK",
  "EXECUTIVE CHEF",
  "EXECUTIVE HOUSE KEEPER",
  "F&B OUTLET MGR",
  "FB SECRETARY",
  "FIRST COOK",
  "FIRST COOK ( PASTRY )",
  "FO CASHIER",
  "FRONT OFFICE SUPERVISOR",
  "GENERAL CASHIER",
  "GENERAL CASHIER EXPEDITION",
  "GENERAL CASHIER STAFF",
  "GENERAL MANAGER",
  "GM SECRETARY",
  "GRAPHIC DESIGNER",
  "GRO",
  "HEAD WAITER",
  "HEALTH & SAFETY COORD",
  "HEALTH & SAFETY STAFF",
  "HK SECTION SUPERVISOR",
  "HK. SECTION SUPERVISOR",
  "HOUSE KEEPING STAFF",
  "HOUSEKEEPING STAFF",
  "HR GENERAL SERVICE SPV",
  "HSP MEMBER ADM",
  "HSP MEMBER SUPERVISOR",
  "HUMAN RESOURCES MANAGER",
  "INCOME AUDIT",
  "INFORMATION DESK",
  "IT OPERATION & SERVICE DESK",
  "KITCHEN ADMINITRATION",
  "LANDSCAPE ATTENDANT",
  "LANDSCAPE SUPERVISOR",
  "LEISURE & AMUSEMENT",
  "LEISURE & ENTERTAIMENT SPV",
  "MARKETING EXECUTIVE",
  "MARKETING SUPPORT",
  "NIGHT AUDIT",
  "OFFICE BOY",
  "OPERATIONAL IT MANAGER",
  "OUTLET CASHIER",
  "PANTRY RUNNER",
  "PASTRY COOK",
  "PLUMBER",
  "PLUMBING TECHNICIAN",
  "POOL & BATH ATT",
  "POOL ATTENDANT",
  "POOL GUARD",
  "POOL GUARD HOTEL ATT",
  "POOL GUARD LEADER",
  "POOL SUPERVISOR",
  "PRODUCT RESEARCH & DEVELOPMENT MANAGER",
  "PROPERTY CONTROL",
  "PUBLIC AREA COORD",
  "PURCHASING SUPERVISOR",
  "RECEIVING SPV",
  "RECEIVING STAFF",
  "RECEPTIONIST",
  "RECREATION MANAGER",
  "RENTAL SUPERVISOR",
  "RESERVATION",
  "RESORT MANAGER",
  "RESORT SECRETARY",
  "RESTAURANT COORDINATOR",
  "SALES  EXECUTIVE",
  "SALES EXECUTIVE",
  "SECOND COOK",
  "SECRETARY HRM",
  "SECURITY GUARD",
  "SERVICE MANAGER",
  "SOUS CHEF",
  "SPIRITUAL SERVICE ATT",
  "SPORT & LEISURE ATTENDANT",
  "SPORT & LEISURE OFFICER",
  "SPORT ADVENTURE MANAGER",
  "SPORT OFFICER",
  "SPV CASHIER",
  "STEWARD",
  "STEWARD COORD",
  "STORE KEEPER",
  "T & D COORD",
  "TECHNICAL SUPPORT",
  "TECHNICIAN",
  "TECHNICIAN ( CIVIL )",
  "TECHNICIAN ( MECHANICAL )",
  "TELEPHONE OPERATOR",
  "TELP OPERATOR",
  "TICKET AUDIT",
  "TICKETING CONTROL",
  "TICKETING SUPERVISOR",
  "TIME KEEPER",
  "TRANSPORT SPV",
  "WAITER",
  "WAITER BANQUET",
  "WAITRESS",
  "WATER PARK SUPERVISOR",
  "ZONA ATTENDANT",
  "ZONA SUPERVISOR"
];

const clampCount = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 1;
  return Math.min(Math.max(parsed, 1), EMPLOYEE_DUMMY_MAX_ROWS);
};

const createSeededRandom = (seed) => {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
};

const shuffle = (items, random) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(random() * (index + 1));
    [result[index], result[targetIndex]] = [result[targetIndex], result[index]];
  }
  return result;
};

const buildNamePool = () => {
  const names = [];
  for (const firstName of FIRST_NAMES) {
    for (const middleName of MIDDLE_NAMES) {
      for (const lastName of LAST_NAMES) {
        names.push(`${firstName} ${middleName} ${lastName}`);
      }
    }
  }
  return names;
};

const buildNikPool = (count, typeKey, random) => {
  const prefix = typeKey === "dw" ? "82" : "92";
  const nicks = new Set();

  while (nicks.size < count) {
    const randomPart = Math.floor(1000000 + random() * 9000000);
    nicks.add(Number(`${prefix}${randomPart}`));
  }

  return [...nicks];
};

const buildIdAbsenPool = (count, typeKey) => {
  const base = typeKey === "dw" ? 810000 : 710000;
  return Array.from({ length: count }, (_, index) => base + index + 1);
};

export const generateEmployeeDummyRows = (count, typeKey = "karyawan") => {
  const safeCount = clampCount(count);
  const random = createSeededRandom(Date.now() + Math.floor(Math.random() * 100000));
  const namePool = shuffle(buildNamePool(), random);
  const nikPool = buildNikPool(safeCount, typeKey, random);
  const idAbsenPool = buildIdAbsenPool(safeCount, typeKey);
  const jobPool = shuffle(JOBS, random);
  const deptPool = shuffle(DEPTS, random);

  return Array.from({ length: safeCount }, (_, index) => ({
    NAMA: namePool[index],
    NIK: nikPool[index],
    JABATAN: jobPool[index % jobPool.length],
    DEPT: deptPool[index % deptPool.length],
    "ID ABSEN": idAbsenPool[index]
  }));
};

export const normalizeEmployeeDummyCount = clampCount;
