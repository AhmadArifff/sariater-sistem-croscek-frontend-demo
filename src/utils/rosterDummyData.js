export const ROSTER_MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];

export const ROSTER_DAY_CODES = ["MG", "SN", "SL", "RB", "KM", "JM", "SB"];

const SPECIAL_SHIFT_CODES = new Set(["X", "CT", "CTB", "CTT", "OF1", "EO"]);

const normalizeCode = (value) => String(value || "").trim().toUpperCase();

export const normalizeRosterCount = (value, max) => {
  const safeMax = Math.max(0, Number(max) || 0);
  if (safeMax === 0) return 0;

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 1;
  return Math.min(Math.max(parsed, 1), safeMax);
};

export const normalizeEmployeeForRoster = (employee) => ({
  nik: String(employee?.nik || "").trim(),
  nama: String(employee?.nama || "").trim(),
  jabatan: String(employee?.jabatan || "").trim(),
  dept: String(employee?.dept || employee?.departemen || "").trim()
});

export const getRosterShiftCodes = (shiftCodes) => {
  const uniqueCodes = Array.from(new Set((shiftCodes || []).map(normalizeCode).filter(Boolean)));
  const workCodes = uniqueCodes.filter((code) => !SPECIAL_SHIFT_CODES.has(code));

  return {
    allCodes: uniqueCodes.includes("X") ? uniqueCodes : ["X", ...uniqueCodes],
    workCodes: workCodes.length > 0 ? workCodes : uniqueCodes.filter((code) => code !== "X")
  };
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

export const generateRosterRows = ({
  employees,
  shiftCodes,
  month,
  year
}) => {
  const normalizedEmployees = (employees || [])
    .map(normalizeEmployeeForRoster)
    .filter((employee) => employee.nik && employee.nama);

  const selectedMonth = Number(month);
  const selectedYear = Number(year);
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const { workCodes } = getRosterShiftCodes(shiftCodes);
  const safeWorkCodes = workCodes.length > 0 ? workCodes : ["1"];
  const random = createSeededRandom(Date.now() + normalizedEmployees.length + selectedMonth + selectedYear);
  const rotatedCodes = shuffle(safeWorkCodes, random);

  return normalizedEmployees.map((employee, employeeIndex) => {
    const shifts = [];

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(selectedYear, selectedMonth, day);
      const isSunday = date.getDay() === 0;
      const weeklyOff = ((day + employeeIndex) % 7) === 0;

      if (isSunday || weeklyOff) {
        shifts.push("X");
      } else {
        const shiftIndex = (employeeIndex * 3 + day + Math.floor(day / 7)) % rotatedCodes.length;
        shifts.push(rotatedCodes[shiftIndex]);
      }
    }

    return {
      ...employee,
      no: employeeIndex + 1,
      shifts
    };
  });
};

export const buildRosterSheetData = ({ rosterRows, month, year }) => {
  const selectedMonth = Number(month);
  const selectedYear = Number(year);
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const monthText = `${ROSTER_MONTH_NAMES[selectedMonth]} ${selectedYear}`;
  const totalColumns = 3 + 31;
  const padRow = (row) => {
    const padded = [...row];
    while (padded.length < totalColumns) padded.push("");
    return padded;
  };

  const weekdayHeader = ["NO.", "ID ABSEN", "NAMA"];
  const dateHeader = ["", "", ""];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(selectedYear, selectedMonth, day);
    weekdayHeader.push(ROSTER_DAY_CODES[date.getDay()]);
    dateHeader.push(day);
  }

  const sheetData = [
    padRow(["SCHEDULE"]),
    padRow([monthText]),
    padRow(weekdayHeader),
    padRow(dateHeader)
  ];

  rosterRows.forEach((row) => {
    sheetData.push(padRow([
      row.no,
      row.nik,
      row.nama,
      ...row.shifts
    ]));
  });

  return { sheetData, daysInMonth, monthText, totalColumns };
};

export const buildRosterPreviewRows = (rosterRows, daysInMonth, maxRows = 30) => (
  rosterRows.slice(0, maxRows).map((row) => {
    const preview = {
      NO: row.no,
      "ID ABSEN": row.nik,
      NAMA: row.nama
    };

    for (let day = 1; day <= daysInMonth; day += 1) {
      preview[day] = row.shifts[day - 1] || "";
    }

    return preview;
  })
);
