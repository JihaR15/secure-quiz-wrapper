import * as XLSX from "xlsx";
import { Submission } from "@/lib/db";

export function generateExcelReport(
  quizTitle: string,
  submissions: Submission[]
): Buffer {
  const rows = submissions.map((sub, index) => {
    let riskLevel = "Normal";
    if (sub.violationCount >= 5) {
      riskLevel = "Risiko Tinggi (High Risk)";
    } else if (sub.violationCount > 0) {
      riskLevel = "Perhatian (Warning)";
    }

    const breakdown = sub.violationBreakdown ?? {};
    return {
      "No.": index + 1,
      "Nama Peserta": sub.participantName,
      "Jumlah Pelanggaran": sub.violationCount,
      "Pindah Tab": breakdown.tab ?? 0,
      "Pindah Window": breakdown.window ?? 0,
      "Copy/Paste": breakdown.clipboard ?? 0,
      "Klik Kanan": breakdown.contextmenu ?? 0,
      "Tingkat Risiko": riskLevel,
      "Waktu Mulai": new Date(sub.startedAt).toLocaleString("id-ID"),
      "Aktivitas Terakhir": new Date(sub.lastActiveAt).toLocaleString("id-ID"),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 6 },  // No.
    { wch: 30 }, // Nama Peserta
    { wch: 20 }, // Jumlah Pelanggaran
    { wch: 12 }, // Pindah Tab
    { wch: 14 }, // Pindah Window
    { wch: 12 }, // Copy/Paste
    { wch: 12 }, // Klik Kanan
    { wch: 28 }, // Tingkat Risiko
    { wch: 24 }, // Waktu Mulai
    { wch: 24 }, // Aktivitas Terakhir
  ];

  // Set AutoFilter on header columns
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:J1");
  worksheet["!autofilter"] = { ref: XLSX.utils.encode_range(range) };

  const workbook = XLSX.utils.book_new();
  const safeSheetName = quizTitle.substring(0, 30).replace(/[:\\/?*\[\]]/g, "") || "Laporan Kuis";
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return excelBuffer;
}
