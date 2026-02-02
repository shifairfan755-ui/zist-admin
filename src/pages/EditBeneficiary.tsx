import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function EditBeneficiary() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);

  // Fetch Beneficiary
  const fetchBeneficiary = async () => {
    const { data, error } = await supabase
      .from("beneficiaries")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) {
      setForm(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBeneficiary();
  }, [id]);

  if (loading || !form)
    return <p className="p-6 text-lg font-semibold">Loading…</p>;

  // Handle Input Change
  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  // Upload Photo
  const uploadPhoto = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `${id}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("beneficiary-photos")
      .upload(fileName, file);

    if (uploadError) {
      alert("Error uploading photo");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("beneficiary-photos")
      .getPublicUrl(fileName);

    setNewPhoto(urlData.publicUrl);

    setUploading(false);
  };

  // Save Changes
  const saveBeneficiary = async () => {
    const updatedData = {
      ...form,
      photo_url: newPhoto ? newPhoto : form.photo_url,
    };

    const { error } = await supabase
      .from("beneficiaries")
      .update(updatedData)
      .eq("id", id);

    if (error) {
      alert("Error saving changes");
    } else {
      alert("Beneficiary updated successfully");
      navigate(`/beneficiary/${id}`);
    }
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl border w-full max-w-4xl">

        <h1 className="text-3xl font-bold text-purple-700 mb-6">
          Edit Beneficiary
        </h1>

        {/* PHOTO SECTION */}
        <div className="flex items-center gap-6 mb-6">
          <img
            src={newPhoto ? newPhoto : form.photo_url}
            className="w-32 h-32 rounded-xl object-cover border-4 border-purple-300 shadow"
          />

          <div>
            <label className="block font-semibold text-purple-700">
              Change Photo
            </label>
            <input type="file" onChange={uploadPhoto} />
            {uploading && <p className="text-sm text-gray-500">Uploading…</p>}
          </div>
        </div>

        {/* FORM FIELDS */}
        <div className="grid grid-cols-2 gap-4">
          {[
            "ben_no",
            "full_name",
            "parentage",
            "phone",
            "address",
            "district",
            "age",
            "category",
            "current_status",
            "quantity_given",
            "amount",
            "remarks",
            "notes",
          ].map((field) => (
            <div key={field}>
              <label className="font-semibold text-purple-700 capitalize">
                {field.replace(/_/g, " ")}
              </label>
              <input
                type="text"
                value={form[field] || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          ))}
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end mt-6">
          <button
            onClick={saveBeneficiary}
            className="px-6 py-3 bg-purple-600 text-white font-bold rounded shadow"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
