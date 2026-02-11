import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AddPayment() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    payee_name: "",
    category: "",
    amount: "",
    payment_date: "",
    notes: "",
    mode: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("payments").insert([
      {
        payee_name: form.payee_name,
        category: form.category,
        amount: Number(form.amount),
        payment_date:
          form.payment_date || new Date().toISOString().slice(0, 10),
        notes: form.notes,
        mode: form.mode,
        created_at: new Date(),
      },
    ]);

    if (error) {
      alert("Error saving payment");
      console.log(error);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/payments");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        Add New Payment
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-6 rounded-xl shadow"
      >
        {/* Payee */}
        <input
          name="payee_name"
          placeholder="Payee Name"
          value={form.payee_name}
          onChange={handleChange}
          className="border p-3 rounded w-full"
          required
        />

        {/* Category */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border p-3 rounded w-full"
          required
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

        {/* Amount */}
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          className="border p-3 rounded w-full"
          required
        />

        {/* Mode */}
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

        {/* Date */}
        <input
          type="date"
          name="payment_date"
          value={form.payment_date}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        />

        {/* Notes */}
        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          className="border p-3 rounded w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full p-3 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Add Payment"}
        </button>
      </form>
    </div>
  );
}
