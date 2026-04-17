import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function AddDonation() {
  const { donorId } = useParams();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [donationType, setDonationType] = useState("");
  const [dateGiven, setDateGiven] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [remarks, setRemarks] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!amount) {
      toast.error("Amount is required");
      return;
    }

    const { error } = await supabase
      .from("donor_donations")
      .insert([
        {
          donor_id: donorId,
          amount: Number(amount),
          donation_type: donationType,
          date_given: dateGiven,
          remarks,
        },
      ]);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Donation added successfully!");
    navigate(`/donors/view/${donorId}`);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link to={`/donors/view/${donorId}`} className="text-blue-600">
        ← Back to Donor
      </Link>

      <h1 className="text-3xl font-bold text-green-700 mt-4 mb-6">
        Add Donation
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-6 border space-y-6"
      >
        <input
          type="number"
          placeholder="Amount"
          className="w-full border p-3 rounded-lg"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Donation Type"
          className="w-full border p-3 rounded-lg"
          value={donationType}
          onChange={(e) => setDonationType(e.target.value)}
        />

        <input
          type="date"
          className="w-full border p-3 rounded-lg"
          value={dateGiven}
          onChange={(e) => setDateGiven(e.target.value)}
        />

        <textarea
          placeholder="Remarks"
          className="w-full border p-3 rounded-lg"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg"
        >
          Save Donation
        </button>
      </form>
    </div>
  );
}
