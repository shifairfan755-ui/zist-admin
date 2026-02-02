import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

export default function ViewPayment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadPayment = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select(
        `
        id,
        beneficiary_id,
        payee_name,
        amount,
        category,
        payment_date,
        cheque_no,
        description,
        notes,
        remarks,
        beneficiaries ( full_name )
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      toast.error("Payment not found");
      navigate("/payments");
      return;
    }

    setPayment(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPayment();
  }, [id]);

  const deletePayment = async () => {
    const yes = confirm("Are you sure you want to delete this payment?");
    if (!yes) return;

    const { error } = await supabase.from("payments").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete payment");
      return;
    }

    toast.success("Payment deleted successfully");
    navigate("/payments");
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!payment) return <p className="p-6 text-red-600">Payment not found</p>;

  const payee = payment.beneficiary_id
    ? payment.beneficiaries?.full_name
    : payment.payee_name;

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <Link to="/payments" className="text-blue-600 text-lg">
        ← Back to Payments
      </Link>

      <h1 className="text-3xl font-bold text-green-700 mt-4 mb-6">
        Payment Details
      </h1>

      {/* MAIN CARD */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border">

        {/* HEADER SECTION */}
        <div className="flex justify-between items-start border-b pb-5 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{payee}</h2>
            <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-green-100 text-green-700 font-semibold">
              {payment.category}
            </span>
          </div>

          <h2 className="text-3xl font-bold text-green-700">
            ₹{payment.amount?.toLocaleString()}
          </h2>
        </div>

        {/* DETAILS GRID */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">

          <Detail label="Category" value={payment.category} />

          <Detail
            label="Payment Date"
            value={new Date(payment.payment_date).toLocaleDateString()}
          />

          <Detail
            label="Cheque Number"
            value={payment.cheque_no || "—"}
          />

          <Detail
            label="Beneficiary?"
            value={
              payment.beneficiary_id
                ? "Yes (Linked to beneficiary)"
                : "No (External Payee)"
            }
          />
        </div>

        {/* DESCRIPTION / NOTES / REMARKS */}
        <div className="space-y-6">

          {/* Beautiful DESCRIPTION BOX */}
          <DetailBox label="Description" value={payment.description} />

          <DetailBox label="Notes" value={payment.notes} />

          <DetailBox label="Remarks" value={payment.remarks} />
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-10 flex gap-4">

          <Link
            to={`/edit-payment/${payment.id}`}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700"
          >
            Edit Payment
          </Link>

          <button
            onClick={deletePayment}
            className="bg-red-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-red-700"
          >
            Delete Payment
          </button>

        </div>
      </div>
    </div>
  );
}

/* SMALL DETAIL FIELD */
function Detail({ label, value }: any) {
  return (
    <div className="bg-gray-50 p-5 rounded-xl border shadow-sm">
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="text-gray-900 font-semibold">{value || "—"}</p>
    </div>
  );
}

/* LARGE BEAUTIFUL BOX */
function DetailBox({ label, value }: any) {
  return (
    <div className="bg-gray-50 p-5 rounded-xl border shadow-sm">
      <p className="text-gray-500 text-sm mb-2">{label}</p>
      <p className="text-gray-900 whitespace-pre-line leading-relaxed">
        {value || "—"}
      </p>
    </div>
  );
}
