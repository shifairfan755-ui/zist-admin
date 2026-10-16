import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateLoanPDF = (
  loan: any,
  installments: any[],
  imdaadAmount = 0
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const left = 12;
  const right = 198;
  const contentWidth = right - left;
  const loanAmount = Number(loan.amount || 0);

  const installmentTotal = installments.reduce(
    (sum: number, item: any) => sum + Number(item.amount || 0),
    0
  );

  const totalPaid =
    loan.status === "Paid on Time"
      ? loanAmount
      : Math.min(installmentTotal, loanAmount);

  const totalImdaad = Math.min(
    Math.max(0, loanAmount - totalPaid),
    Math.max(0, Number(imdaadAmount || 0))
  );

  const balance = Math.max(
    0,
    loanAmount - totalPaid - totalImdaad
  );

  const formatAmount = (value: number) =>
    "Rs. " +
    Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  const display = (value: any) =>
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
      ? String(value)
      : "-";

  const formatDate = (value: any) => {
    if (!value) return "-";
    const dateText = String(value);
    const match = dateText.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    return match
      ? match[3] + "-" + match[2] + "-" + match[1]
      : dateText;
  };

  /* HEADER */
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("ZIST FOUNDATION", pageWidth / 2, 10.5, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    "Soft Loan Profile & Recovery Statement",
    pageWidth / 2,
    18,
    { align: "center" }
  );

  /* BORROWER DETAILS */
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Borrower Details", left, 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  doc.text("Name: " + display(loan.name), left, 43);
  doc.text("Parentage: " + display(loan.parentage), left, 51);
  doc.text("Phone: " + display(loan.phone), left, 59);
  doc.text("Address: " + display(loan.address), left, 67);

  doc.text("Loan Amount: " + formatAmount(loanAmount), 108, 43);
  doc.text("Cheque No: " + display(loan.cheque_no), 108, 51);
  doc.text("Loan Date: " + formatDate(loan.loan_date), 108, 59);
  doc.text("Status: " + display(loan.status), 108, 67);

  doc.text(
    "Recommendation: " + display(loan.recommendation),
    left,
    77,
    { maxWidth: 115 }
  );

  doc.text("Record Ref: " + display(loan.id), 108, 77, {
    maxWidth: 88,
  });

  doc.setDrawColor(170, 170, 170);
  doc.line(left, 83, right, 83);

  /* FINANCIAL SUMMARY */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Financial Summary", left, 92);

  const boxGap = 3;
  const boxWidth = (contentWidth - boxGap * 3) / 4;

  const drawBox = (
    x: number,
    title: string,
    value: string
  ) => {
    doc.setDrawColor(210, 210, 210);
    doc.setFillColor(248, 250, 249);
    doc.roundedRect(x, 97, boxWidth, 22, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(title, x + 2.5, 104);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(value, x + 2.5, 112);
  };

  drawBox(left, "Loan Amount", formatAmount(loanAmount));
  drawBox(
    left + boxWidth + boxGap,
    "Recovered",
    formatAmount(totalPaid)
  );
  drawBox(
    left + (boxWidth + boxGap) * 2,
    "Imdaad",
    formatAmount(totalImdaad)
  );
  drawBox(
    left + (boxWidth + boxGap) * 3,
    "Outstanding",
    formatAmount(balance)
  );

  /* INSTALLMENT HISTORY */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Installment History", left, 129);

  const rows =
    installments.length === 0
      ? [["-", "-", "-", "-", "-", "-", "-", "-", "No installments found"]]
      : installments.map((item: any, index: number) => [
          String(index + 1),
          formatDate(item.payment_date || item.date),
          formatAmount(Number(item.amount || 0)),
          display(item.payment_mode),
          display(item.reference_number),
          display(item.received_by),
          display(item.receipt_number),
          display(item.deposited_into),
          display(item.notes),
        ]);

  autoTable(doc, {
    startY: 134,
    margin: { left, right: 12, bottom: 30, top: 12 },
    head: [[
      "#",
      "Date",
      "Amount",
      "Mode",
      "Reference No.",
      "Received By",
      "Receipt No.",
      "Deposited Into",
      "Notes",
    ]],
    body: rows,
    theme: "grid",
    showHead: "everyPage",
    styles: {
      font: "helvetica",
      fontSize: 6.5,
      cellPadding: 1.4,
      overflow: "linebreak",
      valign: "middle",
      textColor: [35, 35, 35],
      lineColor: [210, 210, 210],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 6.5,
    },
    columnStyles: {
      0: { cellWidth: 7 },
      1: { cellWidth: 17 },
      2: { cellWidth: 22 },
      3: { cellWidth: 17 },
      4: { cellWidth: 27 },
      5: { cellWidth: 23 },
      6: { cellWidth: 22 },
      7: { cellWidth: 29 },
      8: { cellWidth: 21 },
    },
  });

  /* SIGNATURES */
  let signatureY = (doc as any).lastAutoTable?.finalY || 140;

  signatureY += 12;

  if (signatureY + 20 > 185) {
    doc.addPage();
    signatureY = 35;
  }

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);

  doc.text("Prepared By", 16, signatureY);
  doc.text("Verified By", 77, signatureY);
  doc.text("Authorized Signatory", 138, signatureY);

  doc.setDrawColor(100, 100, 100);
  doc.line(14, signatureY + 14, 62, signatureY + 14);
  doc.line(75, signatureY + 14, 123, signatureY + 14);
  doc.line(136, signatureY + 14, 194, signatureY + 14);

  /* FOOTER AND PAGE NUMBERS */
  const pageCount = doc.getNumberOfPages();
  const generatedOn = new Date().toLocaleString();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);

    doc.text("Generated on " + generatedOn, left, 199);

    doc.text(
      "ZIST Beneficiary Management System",
      pageWidth / 2,
      204,
      { align: "center" }
    );

    doc.text(
      "Page " + page + " of " + pageCount,
      right,
      199,
      { align: "right" }
    );
  }

  /* SAVE PDF */
  const safeName = String(loan.name || "Profile").replace(
    /[\\/:*?"<>|]/g,
    "_"
  );

  doc.save("SoftLoan_" + safeName + ".pdf");
};

export default function LoanPDF() {
  return <></>;
}