import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function PaymentModal({
  isOpen,
  onClose,
  beneficiaryId,
  editPayment,
  refreshPayments,
}) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("");
  const [date, setDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  // Load existing payment for EDIT mode
  useEffect(() => {
    if (editPayment) {
      setAmount(editPayment.amount || "");
      setMode(editPayment.mode || "");
      setDate(editPayment.date || "");
      setRemarks(editPayment.remarks || "");
    } else {
      setAmount("");
      setMode("");
      setDate("");
      setRemarks("");
    }
  }, [editPayment]);

  if (!isOpen) return null;

  // -------------------------------
  // SAVE PAYMENT
  // -------------------------------
  const handleSave = async () => {
    if (!amount || !date) {
      alert("Amount and Date are required.");
      return;
    }

    setLoading(true);

    if (editPayment) {
      // UPDATE
      await supabase
        .from("payments")
        .update({
          amount,
          mode,
          date,
          remarks,
        })
        .eq("id", editPayment.id);
    } else {
      // INSERT
      await supabase.from("payments").insert([
        {
          beneficiary_id: beneficiaryId,
          amount,
          mode,
          date,
          remarks,
        },
      ]);
    }

    setLoading(false);
    refreshPayments();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        
        <h2 className="text-2xl font-bold text-blue-600 mb-4">
          {editPayment ? "Edit Payment" : "Add Payment"}
        </h2>

        {/* AMOUNT */}
        <label className="font-semibold">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 border rounded mb-3"
          placeholder="Enter amount"
        />

        {/* MODE */}
        <label className="font-semibold">Mode</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full p-3 border rounded mb-3"
        >
          <option value="">Select Mode</option>
          <option value="Online">Online</option>
          <option value="Cash">Cash</option>
          <option value="Cheque">Cheque</option>
        </select>

        {/* DATE */}
        <label className="font-semibold">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 border rounded mb-3"
        />

        {/* REMARKS */}
        <label className="font-semibold">Remarks</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full p-3 border rounded mb-4"
          placeholder="Optional remarks"
        ></textarea>

        {/* BUTTONS */}
        <div className="flex justify-between">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Payment"}
          </button>
        </div>

      </div>
    </div>
  );
}
