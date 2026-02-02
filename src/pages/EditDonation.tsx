import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function EditDonation() {
  const { id } = useParams(); // donation_id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [donorId, setDonorId] = useState("");
  const [amount, setAmount] = useState("");
  const [donationType, setDonationType] = useState("");
  const [dateGiven, setDateGiven] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [existingReceipt, setExistingReceipt] = useState<any>(null);

  useEffect(() => {
    loadDonation();
  }, [id]);

  async function loadDonation() {
    const { data: donation, error } = await supabase
      .from("donor_donations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Donation not found");
      return navigate("/donors");
    }

    setDonorId(donation.donor_id);
    setAmount(donation.amount);
    setDonationType(donation.donation_type);
    setDateGiven(donation.date_given);
    setRemarks(donation.remarks);

    // Load existing receipt
    const { data: receipt } = await supabase
      .from("donor_receipts")
      .select("*")
      .eq("donation_id", donation.id)
      .single();

    if (receipt) setExistingReceipt(receipt);

    setLoading(false);
  }

  async function saveChanges() {
    if (!amount || !donationType || !dateGiven) {
      toast.error("Please fill required fields");
      return;
    }

    // 1️⃣ Update donation record
    const { error } = await supabase
      .from("donor_donations")
      .update({
        amount: Number(amount),
        donation_type: donationType,
        date_given: dateGiven,
        remarks,
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update donation");
      return;
    }

    // 2️⃣ Upload new receipt (if any)
    if (file) {
      const fileName = `donations/${id}-${Date.now()}-${file.name}`;

      // Delete old receipt if exists
      if (existingReceipt) {
        const path = existingReceipt.file_url.split("/public/")[1];
        await supabase.storage.from("donor-files").remove([path]);
        await supabase.from("donor_receipts").delete().eq("id", existingReceipt.id);
      }

      const { error: uploadError } = await supabase.storage
        .from("donor-files")
        .upload(fileName, file);

      if (!uploadError) {
        const fileUrl = supabase.storage
          .from("donor-files")
          .getPublicUrl(fileName).data.publicUrl;

        await supabase.from("donor_receipts").insert({
          donation_id: id,
          file_url: fileUrl,
        });
      }
    }

    toast.success("Donation updated successfully!");
    navigate(`/donor/${donorId}`);
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to={`/donor/${donorId}`} className="text-blue-600">
        ← Back to Donor
      </Link>

      <h1 className="text-3xl font-bold text-green-700 mt-4 mb-6">
        Edit Donation
      </h1>

      <div className="bg-white p-6 rounded-xl shadow border space-y-6">
        {/* AMOUNT */}
        <div>
          <label className="block mb-1 font-semibold">Amount *</label>
          <input
            type="number"
            className="w-full border p-3 rounded-lg"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* DONATION TYPE */}
        <div>
          <label className="block mb-1 font-semibold">Donation Type *</label>
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
          <label className="block mb-1 font-semibold">Date Given *</label>
          <input
            type="date"
            className="w-full border p-3 rounded-lg"
            value={dateGiven}
            onChange={(e) => setDateGiven(e.target.value)}
          />
        </div>

        {/* REMARKS */}
        <div>
          <label className="block mb-1 font-semibold">Remarks</label>
          <textarea
            className="w-full border p-3 rounded-lg h-28"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        {/* EXISTING RECEIPT */}
        {existingReceipt && (
          <div className="border rounded-lg p-3 bg-gray-50">
            <p className="font-medium mb-2">Existing Receipt:</p>
            <a
              href={existingReceipt.file_url}
              target="_blank"
              className="text-blue-600 underline"
            >
              View Receipt
            </a>
          </div>
        )}

        {/* FILE UPLOAD */}
        <div>
          <label className="block mb-2 font-semibold">Upload New Receipt</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>

        <button
          onClick={saveChanges}
          className="w-full bg-green-600 text-white text-lg py-3 rounded-lg shadow hover:bg-green-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
