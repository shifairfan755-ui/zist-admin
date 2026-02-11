import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function EditBeneficiary() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [oldPhotoPath, setOldPhotoPath] = useState<string | null>(null);

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
    photo_url: "",
  });

  /** Load beneficiary data */
  const loadBeneficiary = async () => {
    const { data, error } = await supabase
      .from("beneficiaries")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      alert("Beneficiary not found");
      navigate("/beneficiaries");
      return;
    }

    setForm({
      ben_no: data.ben_no || "",
      full_name: data.full_name || "",
      parentage: data.parentage || "",
      phone: data.phone || "",
      address: data.address || "",
      category: data.category || "",
      current_status: data.current_status || "",
      quantity: data.quantity || "",
      amount: data.amount || "",
      remarks: data.remarks || "",
      notes: data.notes || "",
      age: data.age || "",
      district: data.district || "",
      amount_sanctioned: data.amount_sanctioned || "",
      photo_url: data.photo_url || "",
    });

    if (data.photo_url) {
      const path = data.photo_url.split(
        "/object/public/beneficiary-photos/"
      )[1];
      setOldPhotoPath(path);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadBeneficiary();
  }, [id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /** Save Changes */
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    let photo_url = form.photo_url;

    try {
      /** Photo replacement logic */
      if (photoFile) {
        if (oldPhotoPath) {
          await supabase.storage
            .from("beneficiary-photos")
            .remove([oldPhotoPath]);
        }

        const ext = photoFile.name.split(".").pop();
        const newPath = `ben_${form.ben_no}_${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("beneficiary-photos")
          .upload(newPath, photoFile);

        if (uploadError) {
          alert("Photo upload failed!");
          setLoading(false);
          return;
        }

        const { data: publicURL } = supabase.storage
          .from("beneficiary-photos")
          .getPublicUrl(newPath);

        photo_url = publicURL.publicUrl;
      }

      /**  FIX: convert empty "" → null | convert numbers */
      const payload = {
        full_name: form.full_name,
        parentage: form.parentage,
        phone: form.phone,
        address: form.address,
        category: form.category,
        current_status: form.current_status,
        quantity: form.quantity ? Number(form.quantity) : null,
        amount: form.amount ? Number(form.amount) : null,
        age: form.age ? Number(form.age) : null,
        amount_sanctioned: form.amount_sanctioned
          ? Number(form.amount_sanctioned)
          : null,
        remarks: form.remarks,
        notes: form.notes,
        district: form.district,
        photo_url,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from("beneficiaries")
        .update(payload)
        .eq("id", id);

      if (error) {
        console.log(error);
        alert("Failed to update beneficiary");
        setLoading(false);
        return;
      }

      alert("Beneficiary updated successfully!");
      navigate("/beneficiaries");
    } catch (err) {
      console.log(err);
      alert("Something went wrong!");
    }

    setLoading(false);
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        Edit Beneficiary — #{form.ben_no}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Full Name + Parentage */}
        <div className="grid grid-cols-2 gap-4">
          <input
            name="full_name"
            placeholder="Full Name"
            value={form.full_name}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="parentage"
            placeholder="Parentage"
            value={form.parentage}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* Phone + Age */}
        <div className="grid grid-cols-2 gap-4">
          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="age"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* Address + District */}
        <div className="grid grid-cols-2 gap-4">
          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="district"
            placeholder="District"
            value={form.district}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* Category + Status */}
        <div className="grid grid-cols-2 gap-4">
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Category</option>
            <option value="Sheep Unit">Sheep Unit</option>
            <option value="Cow">Cow</option>
            <option value="Medical">Medical</option>
            <option value="Education">Education</option>
            <option value="Livelihood Generation">Livelihood Generation</option>
            <option value="Monthly Assistance">Monthly Assistance</option>
            <option value="Food Kit">Food Kit</option>
            <option value="Other">Other</option>
          </select>

          <select
            name="current_status"
            value={form.current_status}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="New">New</option>
            <option value="15 sheeps">15 Sheeps</option>
            <option value="Beneficiary Created">Beneficiary Created</option>
            <option value="Verified">Verified</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Quantity + Amount */}
        <div className="grid grid-cols-2 gap-4">
          <input
            name="quantity"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        {/* Amount Sanctioned */}
        <input
          name="amount_sanctioned"
          placeholder="Amount Sanctioned"
          value={form.amount_sanctioned}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />

        {/* Remarks + Notes */}
        <textarea
          name="remarks"
          placeholder="Remarks"
          value={form.remarks}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />

        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />

        {/* Photo */}
        <p className="font-semibold">Current Photo:</p>
        {form.photo_url && (
          <img
            src={form.photo_url}
            className="w-32 h-40 object-cover border rounded mb-3"
          />
        )}

        <input
          type="file"
          onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
          className="border p-2 rounded w-full"
        />

        <button className="bg-blue-600 text-white p-3 rounded w-full">
          Save Changes
        </button>
      </form>
    </div>
  );
}
