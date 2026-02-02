import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";


export default function NewPaymentForm() {
  const [paymentType, setPaymentType] = useState("");
  const [paidToName, setPaidToName] = useState("");
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);

  // Load beneficiaries
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      const { data } = await supabase
        .from("beneficiaries")
        .select("id, full_name")
        .order("full_name", { ascending: true });

      setBeneficiaries(data || []);
    };

    fetchBeneficiaries();
  }, []);

  const paymentTypes = [
    "Beneficiary",
    "Vendor",
    "Rent",
    "Salary",
    "Office Expense",
    "Utility Bill",
    "Donation Disbursement",
    "Other"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // STEP 1: Insert payment record
    const { data, error } = await supabase.from("payments").insert([
      {
        payment_type: paymentType,
        paid_to_name: paidToName,
        beneficiary_id: paymentType === "Beneficiary" ? beneficiaryId : null,
        amount,
        date,
        notes
      }
    ]);

    if (error) {
      alert("Error saving payment: " + error.message);
      return;
    }

    const paymentId = data[0].id;

    // STEP 2: Upload file if selected
    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${paymentId}.${fileExt}`;

      await supabase.storage
        .from("payment_files")
        .upload(`${fileName}`, file);
    }

    alert("Payment Added Successfully!");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-xl mx-auto mt-6 border">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">
        Add New Payment
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Payment Type */}
        <div>
          <label className="block font-semibold mb-1">Payment Type</label>
          <select
            className="w-full p-2 border rounded"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            required
          >
            <option value="">Select Type</option>
            {paymentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <Route path="/payments/new" element={<PaymentsNew />} />

        {/* Paid To Name */}
        <div>
          <label className="block font-semibold mb-1">Paid To (Person / Vendor)</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Enter name of person/vendor"
            value={paidToName}
            onChange={(e) => setPaidToName(e.target.value)}
            required
          />
        </div>

        {/* Beneficiary Dropdown — ONLY IF paymentType = Beneficiary */}
        {paymentType === "Beneficiary" && (
          <div>
            <label className="block font-semibold mb-1">Select Beneficiary</label>
            <select
              className="w-full p-2 border rounded"
              value={beneficiaryId}
              onChange={(e) => setBeneficiaryId(e.target.value)}
            >
              <option value="">Select Beneficiary</option>
              {beneficiaries.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.full_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block font-semibold mb-1">Amount</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block font-semibold mb-1">Payment Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block font-semibold mb-1">Notes (Optional)</label>
          <textarea
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        {/* File Upload */}
        <div>
          <label className="block font-semibold mb-1">Upload Receipt (Optional)</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg w-full mt-4 font-semibold"
        >
          Save Payment
        </button>
      </form>
    </div>
  );
}
