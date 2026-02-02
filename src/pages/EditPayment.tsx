import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

export default function EditPayment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<any>(null);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    "Livestock",
    "Medical",
    "Education",
    "Soft Loan",
    "Monthly Assistance",
    "Livelihood Generation",
    "Office Expense",
    "Salary",
    "Office Rent",
    "Petrol Expense",
    "Other",
  ];

  // Load Beneficiaries + Payment
  const loadData = async () => {
    const { data: benData } = await supabase
      .from("beneficiaries")
      .select("id, full_name");

    const { data: paymentData, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !paymentData) {
      toast.error("Payment not found");
      navigate("/payments");
      return;
    }

    setBeneficiaries(benData || []);
    setPayment(paymentData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Handle Save
  const updatePayment = async (e: any) => {
    e.preventDefault();

    const payload = {
      beneficiary_id: payment.beneficiary_id || null,
      payee_name: payment.beneficiary_id ? null : payment.payee_name,
      amount: payment.amount,
      payment_date: payment.payment_date,
      cheque_no: payment.cheque_no,
      category: payment.category,
      description: payment.description,
      notes: payment.notes,
      remarks: payment.remarks,
    };

    const { error } = await supabase
      .from("payments")
      .update(payload)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update payment");
      return;
    }

    toast.success("Payment updated successfully");
    navigate(`/view-payment/${id}`);
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!payment) return <p className="p-6 text-red-600">Payment not found</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/payments" className="text-blue-600 text-lg">
        ← Back to Payments
      </Link>

      <h1 className="text-3xl font-bold text-green-700 mt-4 mb-6">
        Edit Payment
      </h1>

      <form
        onSubmit={updatePayment}
        className="bg-white rounded-xl shadow p-6 border space-y-6"
      >
        {/* Payee Selection */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="font-semibold">Beneficiary (optional)</label>
            <select
              className="border p-2 rounded w-full"
              value={payment.beneficiary_id || ""}
              onChange={(e) =>
                setPayment({
                  ...payment,
                  beneficiary_id: e.target.value || null,
                })
              }
            >
              <option value="">— Select Beneficiary —</option>
              {beneficiaries.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* External Payee */}
          <div>
            <label className="font-semibold">External Payee Name</label>
            <input
              className="border p-2 rounded w-full"
              value={payment.payee_name || ""}
              disabled={payment.beneficiary_id}
              onChange={(e) =>
                setPayment({ ...payment, payee_name: e.target.value })
              }
              placeholder="If no beneficiary selected"
            />
          </div>
        </div>

        {/* Category + Amount */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="font-semibold">Category</label>
            <select
              className="border p-2 rounded w-full"
              value={payment.category}
              onChange={(e) =>
                setPayment({ ...payment, category: e.target.value })
              }
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold">Amount</label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={payment.amount}
              onChange={(e) =>
                setPayment({ ...payment, amount: Number(e.target.value) })
              }
            />
          </div>
        </div>

        {/* Date + Cheque */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="font-semibold">Date</label>
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={payment.payment_date?.split("T")[0]}
              onChange={(e) =>
                setPayment({ ...payment, payment_date: e.target.value })
              }
            />
          </div>

          <div>
            <label className="font-semibold">Cheque No</label>
            <input
              className="border p-2 rounded w-full"
              value={payment.cheque_no || ""}
              onChange={(e) =>
                setPayment({ ...payment, cheque_no: e.target.value })
              }
            />
          </div>
        </div>

        {/* Text Areas */}
        <div>
          <label className="font-semibold">Description</label>
          <textarea
            className="border p-2 rounded w-full"
            rows={2}
            value={payment.description || ""}
            onChange={(e) =>
              setPayment({ ...payment, description: e.target.value })
            }
          ></textarea>
        </div>

        <div>
          <label className="font-semibold">Notes</label>
          <textarea
            className="border p-2 rounded w-full"
            rows={2}
            value={payment.notes || ""}
            onChange={(e) =>
              setPayment({ ...payment, notes: e.target.value })
            }
          ></textarea>
        </div>

        <div>
          <label className="font-semibold">Remarks</label>
          <textarea
            className="border p-2 rounded w-full"
            rows={2}
            value={payment.remarks || ""}
            onChange={(e) =>
              setPayment({ ...payment, remarks: e.target.value })
            }
          ></textarea>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700"
          >
            Save Changes
          </button>

          <Link
            to={`/view-payment/${id}`}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg shadow hover:bg-gray-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
