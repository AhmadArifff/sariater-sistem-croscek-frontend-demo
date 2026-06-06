/**
 * Utility Functions for Formatting Data
 */

// ============================================
// Date & Time Formatting
// ============================================

export function formatDate(date, format = "DD/MM/YYYY") {
  if (!date) return "-";

  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  if (format === "DD/MM/YYYY") return `${day}/${month}/${year}`;
  if (format === "YYYY-MM-DD") return `${year}-${month}-${day}`;
  if (format === "DD MMM YYYY") {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${day} ${months[d.getMonth()]} ${year}`;
  }

  return d.toLocaleDateString();
}

export function formatDateTime(datetime, format = "DD/MM/YYYY HH:mm") {
  if (!datetime) return "-";

  const d = new Date(datetime);
  const date = formatDate(d, "DD/MM/YYYY");
  const time = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");

  if (format === "DD/MM/YYYY HH:mm") return `${date} ${time}`;
  if (format === "HH:mm") return time;

  return d.toLocaleString();
}

export function formatTime(time) {
  if (!time) return "-";
  return String(time).substring(0, 5); // HH:mm from HH:mm:ss
}

export function getTimeAgo(date) {
  if (!date) return "-";

  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(date);
}

// ============================================
// Number Formatting
// ============================================

export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined) return "-";
  return parseFloat(num).toFixed(decimals);
}

export function formatCurrency(amount, currency = "IDR") {
  if (amount === null || amount === undefined) return "-";

  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);

  return formatted;
}

export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return "-";
  return `${formatNumber(value * 100, decimals)}%`;
}

// ============================================
// Status Formatting
// ============================================

export const ATTENDANCE_STATUS = {
  present: { label: "Hadir", color: "green", bg: "bg-green-100", text: "text-green-800" },
  absent: { label: "Tidak Hadir", color: "red", bg: "bg-red-100", text: "text-red-800" },
  late: { label: "Terlambat", color: "yellow", bg: "bg-yellow-100", text: "text-yellow-800" },
  excused: { label: "Izin", color: "blue", bg: "bg-blue-100", text: "text-blue-800" },
  sick: { label: "Sakit", color: "purple", bg: "bg-purple-100", text: "text-purple-800" },
  pending: { label: "Pending", color: "gray", bg: "bg-gray-100", text: "text-gray-800" },
};

export function formatAttendanceStatus(status) {
  return ATTENDANCE_STATUS[status] || ATTENDANCE_STATUS.pending;
}

export const USER_ROLES = {
  admin: { label: "Admin", color: "red", bg: "bg-red-100", text: "text-red-800" },
  staff: { label: "Staff", color: "blue", bg: "bg-blue-100", text: "text-blue-800" },
};

export function formatUserRole(role) {
  return USER_ROLES[role] || { label: role, color: "gray", bg: "bg-gray-100", text: "text-gray-800" };
}

export const ACTIVE_STATUS = {
  true: { label: "Active", color: "green", bg: "bg-green-100", text: "text-green-800" },
  false: { label: "Inactive", color: "gray", bg: "bg-gray-100", text: "text-gray-800" },
};

export function formatActiveStatus(isActive) {
  return ACTIVE_STATUS[isActive] || ACTIVE_STATUS.false;
}

// ============================================
// Text Formatting
// ============================================

export function truncate(text, length = 50) {
  if (!text) return "-";
  return text.length > length ? text.substring(0, length) + "..." : text;
}

export function capitalize(text) {
  if (!text) return "-";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function formatName(text) {
  if (!text) return "-";
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ============================================
// Data Processing
// ============================================

export function groupBy(arr, key) {
  return arr.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
}

export function sumBy(arr, key) {
  return arr.reduce((sum, item) => sum + (item[key] || 0), 0);
}

export function averageBy(arr, key) {
  if (arr.length === 0) return 0;
  return sumBy(arr, key) / arr.length;
}

export function countBy(arr, key, value) {
  return arr.filter((item) => item[key] === value).length;
}

export function getPercentage(value, total) {
  if (total === 0) return 0;
  return (value / total) * 100;
}
