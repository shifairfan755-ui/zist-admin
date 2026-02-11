import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function EditPayment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    payee_name: "",
    category: "",
    amount: "",
    payment_date: "",
    notes: "",
    mode: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /** Load payment */
  const loadPayment = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      alert("Payment not found");
      navigate("/payments");
      return;
    }

    setForm({
      payee_name: data.payee_name,
      category: data.category,
      amount: data.amount,
      payment_date: data.payment_date,
      notes: data.notes,
      mode: data.mode,
    });

    setLoading(false);
  };

  useEffect(() => {
    loadPayment();
  }, [id]);

  /** Save updated payment */
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("payments")
      .update({
        payee_name: form.payee_name,
        category: form.category,
        amount: Number(form.amount),
        payment_date: form.payment_date,
        notes: form.notes,
        mode: form.mode,
        updated_at: new Date(),
      })
      .eq("id", id);

    if (error) {
      alert("Failed to update payment");
      console.log(error);
      setLoading(false);
      return;
    }

    alert("Payment updated successfully!");
    navigate("/payments");
  };

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        Edit Payment
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl shadow">

        <input
          name="payee_name"
          placeholder="Payee Name"
          value={form.payee_name}
          onChange={handleChange}
          className="border p-3 rounded w-full"
          required
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        >
          <option value="">Select Category</option>
          <option value="Education">Education</option>
          <option value="Medical">Medical</option>
          <option value="Sheep Unit">Sheep Unit</option>
          <option value="Livelihood Generation">Livelihood Generation</option>
          <option value="Salary">Salary</option>
          <option value="Office Expense">Office Expense</option>
          <option value="Monthly Assistance">Monthly Assistance</option>
          <option value="Soft Loan">Soft Loan</option>
          <option value="Other">Other</option>
        </select>

        <input
          name="amount"
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        />

        <select
          name="mode"
          value={form.mode}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        >
          <option value="">Payment Mode</option>
          <option value="Cash">Cash</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Cheque">Cheque</option>
          <option value="UPI">UPI</option>
        </select>

        <input
          type="date"
          name="payment_date"
          value={form.payment_date}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        />

        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        />

        <button className="bg-blue-600 text-white w-full p-3 rounded-lg">
          Save Changes
        </button>
      </form>
    </div>
  );
}
