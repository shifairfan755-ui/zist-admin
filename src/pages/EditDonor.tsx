import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function EditDonor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  // Donor fields
  const [donorName, setDonorName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [donationType, setDonationType] = useState("");
  const [dateGiven, setDateGiven] = useState("");
  const [remarks, setRemarks] = useState("");

  // Load donor data
  useEffect(() => {
    loadDonor();
  }, [id]);

  async function loadDonor() {
    const { data, error } = await supabase
      .from("donors")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Failed to load donor");
      navigate("/donors");
      return;
    }

    setDonorName(data.donor_name || "");
    setPhone(data.phone || "");
    setAddress(data.address || "");
    setAmount(data.amount || "");
    setDonationType(data.donation_type || "");
    setDateGiven(data.date_given || "");
    setRemarks(data.remarks || "");

    setLoading(false);
  }

  async function handleUpdate(e: any) {
    e.preventDefault();

    const { error } = await supabase
      .from("donors")
      .update({
        donor_name: donorName,
        phone,
        address,
        amount: Number(amount),
        donation_type: donationType,
        date_given: dateGiven,
        remarks,
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update donor");
      return;
    }

    // If user uploaded a new file
    if (file) {
      const fileName = `${id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("donor-files")
        .upload(fileName, file, { upsert: false });

      if (!uploadError) {
        const fileUrl = supabase.storage
          .from("donor-files")
          .getPublicUrl(fileName).data.publicUrl;

        await supabase.from("donor_files").insert({
          donor_id: id,
          file_url: fileUrl,
        });
      }
    }

    toast.success("Updated successfully");
    navigate(`/donor/${id}`);
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link to={`/donor/${id}`} className="text-blue-600">
        ← Back to Donor
      </Link>

      <h1 className="text-3xl font-bold mt-4 mb-6">Edit Donor</h1>

      <form onSubmit={handleUpdate} className="space-y-5 bg-white p-6 rounded-xl shadow border">

        {/* NAME */}
        <div>
          <label className="block font-semibold mb-1">Full Name</label>
          <input
            className="w-full border p-3 rounded"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            required
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="block font-semibold mb-1">Phone</label>
          <input
            className="w-full border p-3 rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* ADDRESS */}
        <div>
          <label className="block font-semibold mb-1">Address</label>
          <input
            className="w-full border p-3 rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* AMOUNT */}
        <div>
          <label className="block font-semibold mb-1">Amount</label>
          <input
            type="number"
            className="w-full border p-3 rounded"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* DONATION TYPE */}
        <div>
          <label className="block font-semibold mb-1">Donation Type</label>
          <select
            className="w-full border p-3 rounded"
            value={donationType}
            onChange={(e) => setDonationType(e.target.value)}
          >
            <option value="">Select</option>
            <option value="Zakat">Zakat</option>
            <option value="Sadaqah">Sadaqah</option>
            <option value="Imdaad">Imdaad</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* DATE GIVEN */}
        <div>
          <label className="block font-semibold mb-1">Date Given</label>
          <input
            type="date"
            className="w-full border p-3 rounded"
            value={dateGiven}
            onChange={(e) => setDateGiven(e.target.value)}
          />
        </div>

        {/* REMARKS */}
        <div>
          <label className="block font-semibold mb-1">Remarks</label>
          <textarea
            className="w-full border p-3 rounded h-28"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          ></textarea>
        </div>

        {/* FILE UPLOAD */}
        <div>
          <label className="block font-semibold mb-1">Upload New Receipt (optional)</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-3 rounded-lg w-full text-lg shadow hover:bg-green-700"
        >
          Update Donor
        </button>
      </form>
    </div>
  );
}
