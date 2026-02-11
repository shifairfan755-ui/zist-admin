import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ViewPayment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<any>(null);

  const loadPayment = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .single();

    if (!data) {
      alert("Payment not found");
      navigate("/payments");
      return;
    }

    setPayment(data);
  };

  useEffect(() => {
    loadPayment();
  }, [id]);

  if (!payment) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <Link to="/payments" className="text-blue-600">← Back</Link>

      <h1 className="text-3xl font-bold mt-4 mb-5 text-blue-700">
        Payment Details
      </h1>

      <div className="bg-white shadow rounded-xl p-6 space-y-3">
        <Detail label="Payee Name" value={payment.payee_name} />
        <Detail label="Category" value={payment.category} />
        <Detail label="Amount" value={`₹${payment.amount}`} />
        <Detail label="Payment Date" value={payment.payment_date} />
        <Detail label="Mode" value={payment.mode} />
        <Detail label="Notes" value={payment.notes || "---"} />
      </div>

      <div className="flex gap-4 mt-6">
        <Link
          to={`/edit-payment/${payment.id}`}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg"
        >
          Edit Payment
        </Link>

        <button
          className="bg-red-600 text-white px-5 py-3 rounded-lg"
          onClick={async () => {
            const yes = confirm("Delete this payment?");
            if (!yes) return;

            await supabase.from("payments").delete().eq("id", id);
            navigate("/payments");
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }: any) {
  return (
    <p className="text-lg">
      <span className="font-semibold">{label}:</span> {value}
    </p>
  );
}
