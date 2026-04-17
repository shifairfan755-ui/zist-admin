import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AddBeneficiary() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    ben_no: "",
    full_name: "",
    parentage: "",
    phone: "",
    address: "",
    category: "",
    current_status: "",
    quantity: "",
    amount: "",
    remarks: "",
    notes: "",
    age: "",
    district: "",
    amount_sanctioned: "",
    start_date: "",
    reference_no: "",
  });

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const generateBenNo = () =>
    Math.floor(1000 + Math.random() * 9000).toString();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photo_url = null;
      let document_url = null;

      const finalBenNo = form.ben_no || generateBenNo();

      /* ---------------- PHOTO UPLOAD ---------------- */
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const filePath = `photo_${finalBenNo}_${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("beneficiary-photos")
          .upload(filePath, photoFile);

        if (uploadError) {
          alert("Photo upload failed");
          console.error(uploadError);
          setLoading(false);
          return;
        }

        const { data } = supabase.storage
          .from("beneficiary-photos")
          .getPublicUrl(filePath);

        photo_url = data.publicUrl;
      }

      /* ---------------- DOCUMENT UPLOAD ---------------- */
      if (docFile) {
        const ext = docFile.name.split(".").pop();
        const filePath = `doc_${finalBenNo}_${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("beneficiary-docs")
          .upload(filePath, docFile);

        if (uploadError) {
          alert("Document upload failed");
          console.error(uploadError);
          setLoading(false);
          return;
        }

        const { data } = supabase.storage
          .from("beneficiary-docs")
          .getPublicUrl(filePath);

        document_url = data.publicUrl;
      }

      /* ---------------- INSERT DB ---------------- */
     const cleanNumber = (val: any) =>
  val === "" ? null : Number(val);

const { error } = await supabase.from("beneficiaries").insert({
  ben_no: finalBenNo,
  full_name: form.full_name,
  parentage: form.parentage,
  phone: form.phone,
  address: form.address,
  category: form.category,
  current_status: form.current_status,
  quantity: form.quantity || null,   // if text column
  age: cleanNumber(form.age),
  amount: cleanNumber(form.amount),
  amount_sanctioned: cleanNumber(form.amount_sanctioned),
  start_date: form.start_date || null,
  reference_no: form.reference_no || null,
  remarks: form.remarks,
  notes: form.notes,
  district: form.district,
  photo_url,
  document_url,
  created_at: new Date(),
});


      if (error) {
        alert(error.message);
        console.error("Insert error:", error);
        setLoading(false);
        return;
      }

      alert("Beneficiary added successfully!");
      navigate("/beneficiaries");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">
        Add Beneficiary
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            name="ben_no"
            placeholder="Beneficiary No (optional)"
            value={form.ben_no}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          />

          <input
            name="full_name"
            placeholder="Full Name"
            value={form.full_name}
            onChange={handleChange}
            required
            className="p-3 border rounded-lg"
          />

          <input
            name="parentage"
            placeholder="Parentage"
            value={form.parentage}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          />

          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          />

          {/* CATEGORY DROPDOWN */}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="p-3 border rounded-lg"
          >
            <option value="">Select Category</option>
            <option>Sheep Unit</option>
            <option>Cow</option>
            <option>Medical</option>
            <option>Education</option>
            <option>Monthly Assistance</option>
            <option>Monthly Handholding</option>
            <option>Livelihood Generation</option>
            <option>Soft Loan</option>
            <option>Other</option>
          </select>

          <input
            name="district"
            placeholder="District"
            value={form.district}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          />

          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          />

          <input
            name="reference_no"
            placeholder="Cheque / Reference No"
            value={form.reference_no}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          />

          <input
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          />

          <input
            name="amount_sanctioned"
            placeholder="Amount Sanctioned"
            value={form.amount_sanctioned}
            onChange={handleChange}
            className="p-3 border rounded-lg"
          />

        </div>

        <textarea
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className="p-3 border rounded-lg w-full"
        />

        <textarea
          name="remarks"
          placeholder="Remarks"
          value={form.remarks}
          onChange={handleChange}
          className="p-3 border rounded-lg w-full"
        />

        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          className="p-3 border rounded-lg w-full"
        />

        {/* FILE UPLOADS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block mb-2 font-medium">
              Upload Photo
            </label>
            <input
              type="file"
              onChange={(e) =>
                setPhotoFile(e.target.files?.[0] || null)
              }
              className="p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Upload Supporting Document
            </label>
            <input
              type="file"
              onChange={(e) =>
                setDocFile(e.target.files?.[0] || null)
              }
              className="p-2 border rounded-lg"
            />
          </div>

        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Saving..." : "Add Beneficiary"}
        </button>

      </form>
    </div>
  );
}
