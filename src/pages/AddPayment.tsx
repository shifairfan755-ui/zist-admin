import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AddPayment() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    payee_name: "",
    category: "",
    amount: "",
    cheque_no: "", // ✅ added
    payment_date: new Date()
      .toISOString()
      .slice(0, 10),
    notes: "",
    mode: "",
  });

  const [loading, setLoading] =
    useState(false);

  const categories = [
    "Sheep",
    "Cow",
    "Monthly Assistance",
    "Education",
    "Medical",
    "Livelihood Generation",
    "Soft Loan",
    "Salary",
    "Office Expense",
    "Other",
  ];

  const paymentModes = [
    "Cash",
    "Bank Transfer",
    "Cheque",
    "UPI",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    const { error } =
      await supabase
        .from("payments")
        .insert([
          {
            payee_name:
              form.payee_name,
            category:
              form.category,
            amount: Number(
              form.amount
            ),
            cheque_no:
              form.cheque_no ||
              null, // ✅ save
            payment_date:
              form.payment_date,
            notes:
              form.notes ||
              null,
            mode:
              form.mode ||
              null,
          },
        ]);

    if (error) {
      alert(
        "Error saving payment"
      );
      console.log(error);
      setLoading(false);
      return;
    }

    navigate("/payments");
  };

  return (
    <div className="p-3 md:p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Add Payment
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Record a new payment
          or assistance entry
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={
          handleSubmit
        }
        className="bg-white rounded-2xl shadow p-4 md:p-8 space-y-6"
      >

        {/* Payee */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Payee Name
          </label>

          <input
            type="text"
            name="payee_name"
            value={
              form.payee_name
            }
            onChange={
              handleChange
            }
            placeholder="Enter full name"
            required
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>

            <select
              name="category"
              value={
                form.category
              }
              onChange={
                handleChange
              }
              required
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="">
                Select Category
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Amount
            </label>

            <input
              type="number"
              name="amount"
              value={
                form.amount
              }
              onChange={
                handleChange
              }
              placeholder="0"
              required
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          {/* ✅ Cheque No */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cheque No / Reference
            </label>

            <input
              type="text"
              name="cheque_no"
              value={
                form.cheque_no
              }
              onChange={
                handleChange
              }
              placeholder="Enter cheque number"
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Mode
            </label>

            <select
              name="mode"
              value={form.mode}
              onChange={
                handleChange
              }
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="">
                Select Mode
              </option>

              {paymentModes.map(
                (mode) => (
                  <option
                    key={mode}
                    value={mode}
                  >
                    {mode}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Date */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Date
            </label>

            <input
              type="date"
              name="payment_date"
              value={
                form.payment_date
              }
              onChange={
                handleChange
              }
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Notes
          </label>

          <textarea
            name="notes"
            rows={4}
            value={form.notes}
            onChange={
              handleChange
            }
            placeholder="Optional notes..."
            className="w-full rounded-xl border px-4 py-3 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse md:flex-row gap-3 pt-2">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/payments"
              )
            }
            className="w-full md:w-auto px-5 py-3 rounded-xl border"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-blue-600 text-white"
          >
            {loading
              ? "Saving..."
              : "Save Payment"}
          </button>

        </div>
      </form>
    </div>
  );
}