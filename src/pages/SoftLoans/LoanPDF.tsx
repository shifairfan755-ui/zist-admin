import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* -----------------------------------------
   Generate Soft Loan PDF
----------------------------------------- */
export const generateLoanPDF = (
  loan: any,
  installments: any[]
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  /* -----------------------------------------
     PREP DATA
  ----------------------------------------- */
  const totalPaid =
    installments.reduce(
      (
        sum: number,
        item: any
      ) =>
        sum +
        Number(
          item.amount ||
            0
        ),
      0
    );

  const balance =
    Number(
      loan.amount ||
        0
    ) - totalPaid;

  /* -----------------------------------------
     HEADER
  ----------------------------------------- */
  doc.setFillColor(
    16,
    185,
    129
  );

  doc.rect(
    0,
    0,
    210,
    25,
    "F"
  );

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.setFontSize(18);

  doc.text(
    "ZIST FOUNDATION",
    105,
    11,
    {
      align:
        "center",
    }
  );

  doc.setFontSize(11);

  doc.text(
    "Soft Loan Profile Report",
    105,
    18,
    {
      align:
        "center",
    }
  );

  /* -----------------------------------------
     TITLE
  ----------------------------------------- */
  doc.setTextColor(
    0,
    0,
    0
  );

  doc.setFontSize(15);

  doc.text(
    "Borrower Details",
    14,
    35
  );

  /* -----------------------------------------
     BORROWER DETAILS
  ----------------------------------------- */
  const leftX = 14;
  const rightX = 110;

  doc.setFontSize(11);

  doc.text(
    `Name: ${
      loan.name ||
      "---"
    }`,
    leftX,
    45
  );

  doc.text(
    `Parentage: ${
      loan.parentage ||
      "---"
    }`,
    leftX,
    53
  );

  doc.text(
    `Phone: ${
      loan.phone ||
      "---"
    }`,
    leftX,
    61
  );

  doc.text(
    `Address: ${
      loan.address ||
      "---"
    }`,
    leftX,
    69
  );

  doc.text(
    `Loan Amount: ₹${Number(
      loan.amount ||
        0
    ).toLocaleString()}`,
    rightX,
    45
  );

  doc.text(
    `Cheque No: ${
      loan.cheque_no ||
      "---"
    }`,
    rightX,
    53
  );

  doc.text(
    `Loan Date: ${
      loan.loan_date ||
      "---"
    }`,
    rightX,
    61
  );

  doc.text(
    `Status: ${
      loan.status ||
      "---"
    }`,
    rightX,
    69
  );

  doc.text(
    `Recommendation: ${
      loan.recommendation ||
      "---"
    }`,
    14,
    79
  );

  doc.line(
    14,
    85,
    196,
    85
  );

  /* -----------------------------------------
     SUMMARY BOXES
  ----------------------------------------- */
  doc.setFontSize(15);

  doc.text(
    "Financial Summary",
    14,
    95
  );

  const drawBox = (
    x: number,
    y: number,
    title: string,
    value: string
  ) => {
    doc.setDrawColor(
      220
    );

    doc.roundedRect(
      x,
      y,
      56,
      22,
      2,
      2
    );

    doc.setFontSize(
      9
    );

    doc.setTextColor(
      120
    );

    doc.text(
      title,
      x + 3,
      y + 7
    );

    doc.setFontSize(
      11
    );

    doc.setTextColor(
      0
    );

    doc.text(
      value,
      x + 3,
      y + 15
    );
  };

  drawBox(
    14,
    100,
    "Loan Amount",
    `₹${Number(
      loan.amount ||
        0
    ).toLocaleString()}`
  );

  drawBox(
    76,
    100,
    "Recovered",
    `₹${totalPaid.toLocaleString()}`
  );

  drawBox(
    138,
    100,
    "Balance",
    `₹${balance.toLocaleString()}`
  );

  /* -----------------------------------------
     INSTALLMENT TABLE
  ----------------------------------------- */
  doc.setFontSize(15);

  doc.text(
    "Installment History",
    14,
    135
  );

  const rows =
    installments.length ===
    0
      ? [
          [
            "-",
            "-",
            "No installments found",
            "-",
          ],
        ]
      : installments.map(
          (
            item: any,
            index: number
          ) => [
            index + 1,
            `₹${Number(
              item.amount ||
                0
            ).toLocaleString()}`,
            item.payment_date ||
              item.date ||
              "-",
            item.notes ||
              "-",
          ]
        );

  autoTable(doc, {
    startY: 140,
    head: [
      [
        "#",
        "Amount",
        "Date",
        "Notes",
      ],
    ],
    body: rows,
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [
        16,
        185,
        129,
      ],
    },
  });

  /* -----------------------------------------
     FOOTER
  ----------------------------------------- */
  const finalY =
    (
      doc as any
    ).lastAutoTable
      ?.finalY ||
    250;

  doc.setFontSize(10);

  doc.setTextColor(
    120
  );

  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    14,
    finalY + 10
  );

  doc.text(
    "Generated by ZIST Beneficiary Management System",
    105,
    287,
    {
      align:
        "center",
    }
  );

  /* -----------------------------------------
     SAVE
  ----------------------------------------- */
  doc.save(
    `SoftLoan_${loan.name || "Profile"}.pdf`
  );
};

/* -----------------------------------------
   Empty Component
----------------------------------------- */
export default function LoanPDF() {
  return <></>;
}