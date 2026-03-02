import { Expense } from "@/types";
import { formatDate, formatCurrency } from "./formatting";

export type ExportFormat = "csv" | "json" | "pdf";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCSV(expenses: Expense[], filename = "expenses"): void {
  const headers = ["Date", "Category", "Description", "Amount"];
  const rows = expenses.map((e) => [
    formatDate(e.date),
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
  ]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filename}.csv`);
}

export function exportToJSON(expenses: Expense[], filename = "expenses"): void {
  const data = expenses.map((e) => ({
    date: formatDate(e.date),
    category: e.category,
    description: e.description,
    amount: e.amount,
  }));
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  triggerDownload(blob, `${filename}.json`);
}

export async function exportToPDF(
  expenses: Expense[],
  filename = "expenses"
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  // Header
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Expense Report", 14, 16);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated on ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    14,
    23
  );

  // Summary box
  doc.setTextColor(30, 30, 30);
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(14, 34, 182, 18, 3, 3, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Records: ${expenses.length}`, 20, 44);
  doc.text(`Total Amount: ${formatCurrency(total)}`, 90, 44);
  if (expenses.length > 0) {
    const dates = expenses.map((e) => e.date).sort();
    doc.text(`Period: ${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}`, 150, 44);
  }

  // Table
  autoTable(doc, {
    startY: 58,
    head: [["Date", "Category", "Description", "Amount"]],
    body: expenses.map((e) => [
      formatDate(e.date),
      e.category,
      e.description,
      formatCurrency(e.amount),
    ]),
    foot: [["", "", "Total", formatCurrency(total)]],
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    footStyles: {
      fillColor: [243, 244, 246],
      textColor: [30, 30, 30],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: { 3: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${filename}.pdf`);
}
