export const ATTENDANCE_DUMMY_HEADERS = [
  "Tanggal scan",
  "Tanggal",
  "Jam",
  "PIN",
  "NIP",
  "Nama",
  "Jabatan",
  "Departemen",
  "Kantor",
  "Verifikasi",
  "I/O",
  "Workcode",
  "SN",
  "Mesin"
];

const DEFAULT_START_TIME = "08:00:00";
const DEFAULT_END_TIME = "17:00:00";
const SKIP_SHIFT_CODES = new Set(["X", "CT", "CTB", "CTT", "OF1", "EO"]);

const pad = (value) => String(value).padStart(2, "0");

const normalizeDateOnly = (dateValue) => {
  if (!dateValue) return "";
  return String(dateValue).split("T")[0];
};

const formatDateId = (dateValue) => {
  const [year, month, day] = normalizeDateOnly(dateValue).split("-");
  if (!year || !month || !day) return "";
  return `${day}-${month}-${year}`;
};

const normalizeEmployee = (employee) => ({
  nik: String(employee?.nik || "").trim(),
  pin: String(
    employee?.id_absen ||
    employee?.ID_ABSEN ||
    employee?.["ID ABSEN"] ||
    employee?.pin ||
    employee?.PIN ||
    employee?.nik ||
    ""
  ).trim(),
  nama: String(employee?.nama || "").trim(),
  jabatan: String(employee?.jabatan || "").trim(),
  dept: String(employee?.dept || employee?.departemen || "").trim()
});

const normalizeTime = (timeValue, fallback) => {
  const text = String(timeValue || "").trim();
  if (!text) return fallback;

  const parts = text.split(":").map((part) => Number.parseInt(part, 10));
  if (parts.length < 2 || parts.some((part) => Number.isNaN(part))) return fallback;

  const [hours, minutes, seconds = 0] = parts;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const timeToSeconds = (timeValue) => {
  const [hours, minutes, seconds = 0] = normalizeTime(timeValue, "00:00:00")
    .split(":")
    .map((part) => Number.parseInt(part, 10));
  return hours * 3600 + minutes * 60 + seconds;
};

const secondsToTime = (secondsValue) => {
  const daySeconds = 24 * 3600;
  const seconds = ((secondsValue % daySeconds) + daySeconds) % daySeconds;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
};

const addMinutes = (timeValue, minutes) => secondsToTime(timeToSeconds(timeValue) + (minutes * 60));

const createSeededRandom = (seed) => {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
};

const randomInt = (random, min, max) => Math.floor(random() * (max - min + 1)) + min;

export const normalizeAttendanceCount = (value, max) => {
  const safeMax = Math.max(0, Number(max) || 0);
  if (safeMax === 0) return 0;

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.min(Math.max(parsed, 0), safeMax);
};

export const buildDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return [];

  const parseDate = (value) => {
    const [year, month, day] = String(value).split("-").map((part) => Number.parseInt(part, 10));
    if (!year || !month || !day) return null;
    return new Date(Date.UTC(year, month - 1, day));
  };
  const formatDate = (date) => (
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
  );

  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];

  const dates = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(formatDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
};

export const buildScheduleLookup = (schedules = []) => {
  const lookup = new Map();
  schedules.forEach((schedule) => {
    const nik = String(schedule?.nik || "").trim();
    const idAbsen = String(schedule?.id_absen || schedule?.pin || schedule?.PIN || "").trim();
    const tanggal = normalizeDateOnly(schedule?.tanggal);
    const kodeShift = String(schedule?.kode_shift || "").trim().toUpperCase();
    if (!tanggal || !kodeShift) return;
    if (nik) lookup.set(`${nik}|${tanggal}`, kodeShift);
    if (idAbsen) lookup.set(`${idAbsen}|${tanggal}`, kodeShift);
  });
  return lookup;
};

export const assignAttendanceCategories = ({
  employees,
  lateCount,
  earlyCount,
  forgotCheckinCount,
  forgotCheckoutCount
}) => {
  const random = createSeededRandom(Date.now() + employees.length);
  const selected = employees.map((employee) => employee.nik);
  for (let index = selected.length - 1; index > 0; index -= 1) {
    const targetIndex = randomInt(random, 0, index);
    [selected[index], selected[targetIndex]] = [selected[targetIndex], selected[index]];
  }
  const assignments = new Map();
  let cursor = 0;

  const apply = (category, count) => {
    for (let index = 0; index < count && cursor < selected.length; index += 1) {
      assignments.set(selected[cursor], category);
      cursor += 1;
    }
  };

  apply("late", lateCount);
  apply("early", earlyCount);
  apply("forgotCheckin", forgotCheckinCount);
  apply("forgotCheckout", forgotCheckoutCount);

  selected.forEach((nik) => {
    if (!assignments.has(nik)) assignments.set(nik, "normal");
  });

  return assignments;
};

const getScheduleTimes = ({ employee, date, scheduleLookup, shiftScheduleMap }) => {
  const kodeShift = scheduleLookup.get(`${employee.pin}|${date}`) || scheduleLookup.get(`${employee.nik}|${date}`);
  if (kodeShift && SKIP_SHIFT_CODES.has(String(kodeShift).toUpperCase())) {
    return null;
  }

  const schedule = shiftScheduleMap?.[String(kodeShift || "").toUpperCase()] || null;
  return {
    kodeShift: kodeShift || "",
    startTime: normalizeTime(schedule?.jam_masuk, DEFAULT_START_TIME),
    endTime: normalizeTime(schedule?.jam_pulang, DEFAULT_END_TIME)
  };
};

const buildScanRow = ({ employee, date, time, machineName, io = 1 }) => ({
  "Tanggal scan": `${formatDateId(date)} ${time}`,
  Tanggal: formatDateId(date),
  Jam: time,
  PIN: employee.pin || employee.nik,
  NIP: employee.nik,
  Nama: employee.nama,
  Jabatan: employee.jabatan,
  Departemen: employee.dept,
  Kantor: "",
  Verifikasi: 20,
  "I/O": io,
  Workcode: 0,
  SN: "66686018291441",
  Mesin: machineName
});

export const generateAttendanceRows = ({
  employees,
  schedules,
  shiftScheduleMap,
  startDate,
  endDate,
  lateCount,
  earlyCount,
  forgotCheckinCount,
  forgotCheckoutCount,
  machineName = "Karyawan 2"
}) => {
  const normalizedEmployees = (employees || [])
    .map(normalizeEmployee)
    .filter((employee) => employee.nik && employee.nama);
  const dates = buildDateRange(startDate, endDate);
  const scheduleLookup = buildScheduleLookup(schedules);
  const categoryAssignments = assignAttendanceCategories({
    employees: normalizedEmployees,
    lateCount,
    earlyCount,
    forgotCheckinCount,
    forgotCheckoutCount
  });
  const random = createSeededRandom(Date.now() + normalizedEmployees.length + dates.length);
  const rows = [];

  normalizedEmployees.forEach((employee) => {
    const category = categoryAssignments.get(employee.nik) || "normal";

    dates.forEach((date) => {
      const schedule = getScheduleTimes({ employee, date, scheduleLookup, shiftScheduleMap });
      if (!schedule) return;

      let checkInTime = addMinutes(schedule.startTime, -randomInt(random, 5, 25));
      let checkOutTime = addMinutes(schedule.endTime, randomInt(random, 5, 25));

      if (category === "late") {
        checkInTime = addMinutes(schedule.startTime, randomInt(random, 10, 60));
      }
      if (category === "early") {
        checkOutTime = addMinutes(schedule.endTime, -randomInt(random, 10, 60));
      }

      if (category !== "forgotCheckin") {
        rows.push(buildScanRow({ employee, date, time: checkInTime, machineName, io: 1 }));
      }
      if (category !== "forgotCheckout") {
        rows.push(buildScanRow({ employee, date, time: checkOutTime, machineName, io: 1 }));
      }
    });
  });

  rows.sort((a, b) => {
    const scanA = String(a["Tanggal scan"]);
    const scanB = String(b["Tanggal scan"]);
    if (scanA === scanB) return String(a.Nama).localeCompare(String(b.Nama));
    const [dateA, timeA] = scanA.split(" ");
    const [dateB, timeB] = scanB.split(" ");
    const isoA = `${dateA.split("-").reverse().join("-")} ${timeA}`;
    const isoB = `${dateB.split("-").reverse().join("-")} ${timeB}`;
    return isoA.localeCompare(isoB);
  });

  return rows;
};

export const buildAttendanceSheetData = (attendanceRows) => [
  Array(ATTENDANCE_DUMMY_HEADERS.length).fill(""),
  ATTENDANCE_DUMMY_HEADERS,
  Array(ATTENDANCE_DUMMY_HEADERS.length).fill(""),
  ...attendanceRows.map((row) => ATTENDANCE_DUMMY_HEADERS.map((header) => row[header] ?? ""))
];
