import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";

function getAlertMeta(message) {
  const normalized = String(message || "").toLowerCase();

  if (
    normalized.includes("gagal") ||
    normalized.includes("error") ||
    normalized.includes("tidak valid") ||
    normalized.includes("tidak didukung")
  ) {
    return {
      title: "Terjadi Kendala",
      icon: XCircle,
      accent: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      button: "bg-red-600 hover:bg-red-700",
    };
  }

  if (
    normalized.includes("berhasil") ||
    normalized.includes("sukses") ||
    normalized.includes("selesai") ||
    normalized.includes("success")
  ) {
    return {
      title: "Berhasil",
      icon: CheckCircle,
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      button: "bg-emerald-600 hover:bg-emerald-700",
    };
  }

  if (
    normalized.includes("silakan") ||
    normalized.includes("tidak ada") ||
    normalized.includes("warning")
  ) {
    return {
      title: "Perhatian",
      icon: AlertCircle,
      accent: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      button: "bg-amber-600 hover:bg-amber-700",
    };
  }

  return {
    title: "Informasi",
    icon: Info,
    accent: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    button: "bg-blue-600 hover:bg-blue-700",
  };
}

function formatAlertLines(message) {
  return String(message ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function AppAlertProvider({ children }) {
  const [alertMessage, setAlertMessage] = useState(null);

  const closeAlert = useCallback(() => {
    setAlertMessage(null);
  }, []);

  useLayoutEffect(() => {
    const nativeAlert = window.alert;

    window.alert = (message) => {
      setAlertMessage(String(message ?? ""));
    };

    return () => {
      window.alert = nativeAlert;
    };
  }, []);

  const meta = useMemo(() => getAlertMeta(alertMessage), [alertMessage]);
  const lines = useMemo(() => formatAlertLines(alertMessage), [alertMessage]);
  const Icon = meta.icon;

  return (
    <>
      {children}

      {alertMessage !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
          onClick={closeAlert}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-alert-title"
          >
            <div className={`border-b px-6 py-5 ${meta.bg} ${meta.border}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white p-2 shadow-sm">
                    <Icon className={meta.accent} size={24} />
                  </div>
                  <div>
                    <h2 id="app-alert-title" className="text-lg font-semibold text-slate-900">
                      {meta.title}
                    </h2>
                    <p className="text-sm text-slate-500">Ringkasan hasil proses</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeAlert}
                  className="rounded-md p-1 text-slate-500 transition hover:bg-white/70 hover:text-slate-700"
                  aria-label="Tutup"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
              {lines.length > 1 ? (
                <div className="space-y-2">
                  {lines.map((line, index) => (
                    <p key={`${line}-${index}`} className="text-sm leading-6 text-slate-700">
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-slate-700">
                  {lines[0] || "Tidak ada pesan detail."}
                </p>
              )}
            </div>

            <div className="flex justify-end border-t bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={closeAlert}
                className={`rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition ${meta.button}`}
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
