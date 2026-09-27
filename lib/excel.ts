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

    return {
      "No.": index + 1,
      "Nama Peserta": sub.participantName,
      "Jumlah Pelanggaran": sub.violationCount,
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
    { wch: 25 }, // Tingkat Risiko
    { wch: 24 }, // Waktu Mulai
    { wch: 24 }, // Aktivitas Terakhir
  ];

  const workbook = XLSX.utils.book_new();
  const safeSheetName = quizTitle.substring(0, 30).replace(/[:\\/?*\[\]]/g, "") || "Laporan Kuis";
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return excelBuffer;
}
