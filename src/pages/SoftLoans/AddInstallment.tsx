import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function AddInstallment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const saveInstallment = async () => {
    if (!date || !amount) {
      toast.error("Please fill all required fields");
      return;
    }

    const { error } = await supabase.from("soft_loan_installments").insert([
      {
        loan_id: id,
        date: date,  // ✅ FIXED — matches your database column
        amount: Number(amount),
        notes: notes || "",
      },
    ]);

    if (error) {
      console.error(error);
      toast.error("Failed to save installment");
      return;
    }

    toast.success("Installment added successfully");
    navigate(`/view-soft-loan/${id}`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to={`/view-soft-loan/${id}`} className="text-blue-600">
        ← Back to Loan
      </Link>

      <h1 className="text-3xl font-bold text-green-700 mt-4 mb-6">
        Add Installment
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-6 border">

        {/* DATE */}
        <label className="block mb-3 text-gray-700 font-medium">
          Installment Date
        </label>
        <input
          type="date"
          className="border p-3 rounded-lg w-full mb-6"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* AMOUNT */}
        <label className="block mb-3 text-gray-700 font-medium">
          Amount
        </label>
        <input
          type="number"
          className="border p-3 rounded-lg w-full mb-6"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {/* NOTES */}
        <label className="block mb-3 text-gray-700 font-medium">Notes</label>
        <textarea
          className="border p-3 rounded-lg w-full mb-6 h-28"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* SAVE */}
        <button
          onClick={saveInstallment}
          className="bg-green-600 text-white px-5 py-3 rounded-lg shadow hover:bg-green-700 w-full text-lg"
        >
          Save Installment
        </button>
      </div>
    </div>
  );
}
