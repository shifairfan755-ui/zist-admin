import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function AddDonation() {
  const { id } = useParams(); // donor_id
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [donationType, setDonationType] = useState("");
  const [dateGiven, setDateGiven] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState<File | null>(null);

  async function saveDonation() {
    if (!amount || !donationType || !dateGiven) {
      toast.error("Please fill all required fields");
      return;
    }

    // 1️⃣ Insert donation
    const { data: donation, error } = await supabase
      .from("donor_donations")
      .insert({
        donor_id: id,
        amount: Number(amount),
        donation_type: donationType,
        date_given: dateGiven,
        remarks,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      toast.error("Failed to save donation");
      return;
    }

    // 2️⃣ Upload receipt if attached
    if (file) {
      const fileName = `donations/${donation.id}-${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("donor-files")
        .upload(fileName, file);

      if (!uploadError) {
        const fileUrl = supabase.storage
          .from("donor-files")
          .getPublicUrl(fileName).data.publicUrl;

        // Save receipt record
        await supabase.from("donor_receipts").insert({
          donation_id: donation.id,
          file_url: fileUrl,
        });
      }
    }

    toast.success("Donation added successfully!");
    navigate(`/donor/${id}`);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to={`/donor/${id}`} className="text-blue-600">
        ← Back to Donor
      </Link>

      <h1 className="text-3xl font-bold text-green-700 mt-4 mb-6">
        Add Donation
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-6 border space-y-6">
        {/* AMOUNT */}
        <div>
          <label className="block mb-2 font-semibold">Amount *</label>
          <input
            type="number"
            className="w-full border p-3 rounded-lg"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Donation Amount"
          />
        </div>

        {/* DONATION TYPE */}
        <div>
          <label className="block mb-2 font-semibold">Donation Type *</label>
          <select
            className="w-full border p-3 rounded-lg"
            value={donationType}
            onChange={(e) => setDonationType(e.target.value)}
          >
            <option value="">Select</option>
            <option value="Zakat">Zakat</option>
            <option value="Sadaqah">Sadaqah</option>
            <option value="Imdaad">Imdaad</option>
            <option value="Donation">Donation</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* DATE GIVEN */}
        <div>
          <label className="block mb-2 font-semibold">Date Given *</label>
          <input
            type="date"
            className="w-full border p-3 rounded-lg"
            value={dateGiven}
            onChange={(e) => setDateGiven(e.target.value)}
          />
        </div>

        {/* REMARKS */}
        <div>
          <label className="block mb-2 font-semibold">Remarks</label>
          <textarea
            className="w-full border p-3 rounded-lg h-28"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Any notes about this donation"
          ></textarea>
        </div>

        {/* RECEIPT UPLOAD */}
        <div>
          <label className="block mb-2 font-semibold">Upload Receipt</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={saveDonation}
          className="w-full bg-green-600 text-white text-lg py-3 rounded-lg shadow hover:bg-green-700"
        >
          Save Donation
        </button>
      </div>
    </div>
  );
}
