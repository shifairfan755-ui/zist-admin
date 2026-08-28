import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function PaymentReceipt() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    loadPayment();
  }, [id]);

  async function loadPayment() {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .single();

    if (!data) {
      alert("Receipt not found");
      navigate("/payments");
      return;
    }

    setPayment(data);
  }

  const handlePrint = () => {
    window.print();
  };

  if (!payment) {
    return (
      <div className="p-10 text-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  const receiptNo = `ZIST-${new Date().getFullYear()}-${String(
    payment.id
  ).slice(0, 6)}`;

  return (
    <>
      {/* Buttons */}
      <div className="no-print p-4 flex justify-center gap-3 bg-slate-100">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 rounded-lg border bg-white"
        >
          Back
        </button>

        <button
          onClick={handlePrint}
          className="px-6 py-2 rounded-lg bg-blue-700 text-white"
        >
          Print Receipt
        </button>
      </div>

      {/* PRINT AREA */}
      <div id="print-area" className="bg-white mx-auto w-[210mm] min-h-[297mm] text-slate-800 relative">

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center text-[95px] font-bold opacity-[0.03] rotate-[-28deg] pointer-events-none">
          ZIST
        </div>

        {/* HEADER */}
        <div className="border-b px-8 pt-6 pb-4 text-center relative z-10">
          <h1 className="text-[23px] font-bold uppercase leading-tight">
            Zakat, Infaq and Sadaqah Trust (ZIST)
          </h1>

          <h2 className="text-[30px] font-bold text-blue-700 leading-tight mt-1">
            ZIST Foundation
          </h2>

          <p className="text-[10px] mt-2 leading-4">
            (Registered under section 80G read with section 12A of the Income Tax Act, 1961 for Tax exemption)
          </p>

          <p className="text-[10px] leading-4 mt-1">
            Office: Veracity House, Raj Bagh, Srinagar, J & K-190001 India |
            Tel: 9596444908 | zistjk@gmail.com | www.zistjk.org
          </p>

          <p className="text-[10px] leading-4 mt-1 font-medium">
            J&K Govt. Registration No: 2023/87/4/275 |
            Bank Account: 0007010100003884, J&K Bank, Hazratbal
          </p>
        </div>

        {/* TITLE */}
        <div className="text-center py-4 border-b relative z-10">
          <h3 className="text-[26px] font-bold tracking-wide">
            PAYMENT RECEIPT
          </h3>

          <p className="text-[11px] text-slate-500">
            Official Payment Disbursement Voucher
          </p>
        </div>

        {/* TOP META */}
        <div className="grid grid-cols-2 gap-4 px-8 py-4 border-b text-[11px] relative z-10">
          <div className="space-y-1">
            <p>
              <span className="font-bold">Receipt No:</span>{" "}
              {receiptNo}
            </p>

            <p>
              <span className="font-bold">Prepared By:</span>{" "}
              Admin Office
            </p>
          </div>

          <div className="space-y-1 text-right">
            <p>
              <span className="font-bold">Date:</span>{" "}
              {payment.payment_date}
            </p>

            <p>
              <span className="font-bold">Status:</span>{" "}
              Approved
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="px-8 py-5 relative z-10">

          <table className="w-full border text-[12px]">
            <tbody>
              <Row label="Payee Name" value={payment.payee_name} />
              <Row label="Category" value={payment.category} />
              <Row
                label="Amount"
                value={`₹${Number(payment.amount).toLocaleString()}`}
              />
              <Row label="Payment Date" value={payment.payment_date} />
              <Row label="Payment Mode" value={payment.mode || "---"} />
              <Row label="Cheque No" value={payment.cheque_no || "---"} />
              <Row label="Notes" value={payment.notes || "---"} />
            </tbody>
          </table>

          {/* Highlight Box */}
          <div className="mt-5 border rounded-xl p-4 bg-slate-50">
            <p className="text-[11px] text-slate-500">
              Amount Released
            </p>

            <p className="text-[30px] font-bold text-green-700">
              ₹{Number(payment.amount).toLocaleString()}
            </p>
          </div>

          {/* Approval Note */}
          <div className="mt-4 text-[11px] text-slate-600 border-l-4 border-blue-600 pl-3 italic">
            This payment has been reviewed and approved
            under internal ZIST administrative process.
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-10 text-center text-[11px] mt-12">
            <div>
              <div className="border-t pt-2">
                Receiver Signature
              </div>
            </div>

            <div>
              <div className="border-t pt-2">
                Prepared By
              </div>
            </div>

            <div>
              <div className="border-t pt-2">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-0 left-0 right-0 border-t text-center py-3 text-[10px] text-slate-500 relative z-10">
          Generated by ZIST Admin Panel | Confidential Internal Record
        </div>
      </div>

      {/* PRINT CSS */}
      <style>{`
        body{
          background:#e5e7eb;
        }

        @media print {

          body *{
            visibility:hidden;
          }

          #print-area,
          #print-area *{
            visibility:visible;
          }

          #print-area{
            position:absolute;
            left:0;
            top:0;
            width:100%;
            min-height:auto;
            margin:0;
            padding:0;
          }

          .no-print{
            display:none !important;
          }

          @page{
            size:A4 portrait;
            margin:6mm;
          }

          body{
            background:white;
          }
        }
      `}</style>
    </>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <tr className="border">
      <td className="w-[34%] border px-3 py-3 font-semibold bg-slate-50">
        {label}
      </td>

      <td className="border px-3 py-3">
        {value}
      </td>
    </tr>
  );
}