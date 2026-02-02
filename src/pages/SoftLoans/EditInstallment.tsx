import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";

export default function EditInstallment() {
  const { id } = useParams(); // installment id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    loan_id: "",
    installment_date: "",
    amount: "",
    notes: "",
  });

  const loadInstallment = async () => {
    const { data, error } = await supabase
      .from("soft_loan_installments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast.error("Installment not found");
      return navigate("/soft-loans");
    }

    setForm({
      loan_id: data.loan_id,
      installment_date: data.installment_date,
      amount: data.amount,
      notes: data.notes || "",
    });

    setLoading(false);
  };

  useEffect(() => {
    loadInstallment();
  }, [id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateInstallment = async () => {
    if (!form.amount || !form.installment_date) {
      toast.error("Amount and Date are required!");
      return;
    }

    const { error } = await supabase
      .from("soft_loan_installments")
      .update({
        installment_date: form.installment_date,
        amount: Number(form.amount),
        notes: form.notes,
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update installment");
      return;
    }

    toast.success("Installment updated successfully!");
    navigate(`/view-soft-loan/${form.loan_id}`);
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">

      <Link
        to={`/view-soft-loan/${form.loan_id}`}
        className="text-blue-600"
      >
        ← Back to Loan
      </Link>

      <h1 className="text-3xl font-bold text-green-700 mt-3 mb-6">
        Edit Installment
      </h1>

      <div className="bg-white p-6 rounded-xl shadow border space-y-6">

        <div>
          <label className="text-gray-600 text-sm">Installment Date</label>
          <input
            type="date"
            name="installment_date"
            value={form.installment_date}
            onChange={handleChange}
            className="border p-3 rounded-lg w-full mt-1"
          />
        </div>

        <div>
          <label className="text-gray-600 text-sm">Amount</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="border p-3 rounded-lg w-full mt-1"
          />
        </div>

        <div>
          <label className="text-gray-600 text-sm">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="border p-3 rounded-lg w-full mt-1 h-28"
          ></textarea>
        </div>

        <button
          onClick={updateInstallment}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-lg"
        >
          Save Changes
        </button>

      </div>
    </div>
  );
}
