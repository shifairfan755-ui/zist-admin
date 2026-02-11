import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function NewApplication() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    applicant_name: "",
    parentage: "",
    phone: "",
    address: "",
    requested_for: "",
    amount_requested: "",
    recommendation: "",
    notes: "",
    application_date: "",
  });

  const [documentFile, setDocumentFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    let document_url = null;

    try {
      // -------------------------------------------
      // 1) UPLOAD DOCUMENT FILE (IF PROVIDED)
      // -------------------------------------------
      if (documentFile) {
        const fileExt = documentFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `apps/${fileName}`; // folder inside bucket

        const { error: uploadError } = await supabase.storage
          .from("application_files")       // ✅ correct bucket name
          .upload(filePath, documentFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.log(uploadError);
          alert("Document Upload Failed");
          setLoading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("application_files")
          .getPublicUrl(filePath);

        document_url = publicUrlData.publicUrl;
      }

      // -------------------------------------------
      // 2) INSERT APPLICATION INTO DATABASE
      // -------------------------------------------
      const { error } = await supabase.from("applications").insert([
        {
          applicant_name: form.applicant_name,
          parentage: form.parentage,
          phone: form.phone,
          address: form.address,
          requested_for: form.requested_for,
          amount_requested: form.amount_requested,
          recommendation: form.recommendation,
          notes: form.notes,
          application_date: form.application_date || new Date(),
          document_url: document_url,
          status: "Pending",
        },
      ]);

      if (error) {
        console.log(error);
        alert("Error saving application");
        setLoading(false);
        return;
      }

      alert("Application saved successfully!");
      navigate("/applications");

    } catch (err) {
      console.error(err);
      alert("Unexpected error");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        New Application
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-4">
          <input
            name="applicant_name"
            placeholder="Applicant Name"
            value={form.applicant_name}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          <input
            name="parentage"
            placeholder="Parentage"
            value={form.parentage}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-4">
          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
        </div>

        {/* Requested For + Amount */}
        <div className="grid grid-cols-2 gap-4">
          <select
            name="requested_for"
            value={form.requested_for}
            onChange={handleChange}
            className="border rounded p-2 w-full"
            required
          >
            <option value="">Requested For</option>
            <option value="Sheep Unit">Sheep Unit</option>
            <option value="Cow">Cow</option>
            <option value="Medical">Medical</option>
            <option value="Education">Education</option>
            <option value="Monthly Assistance">Monthly Assistance</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="number"
            name="amount_requested"
            placeholder="Amount Requested"
            value={form.amount_requested}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
        </div>

        {/* Document Upload */}
        <input
          type="file"
          onChange={(e) => setDocumentFile(e.target.files?.[0])}
          className="border rounded p-2 w-full"
        />

        {/* Recommendation */}
        <textarea
          name="recommendation"
          placeholder="Recommendation"
          value={form.recommendation}
          onChange={handleChange}
          className="border rounded p-2 w-full"
        />

        {/* Notes */}
        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          className="border rounded p-2 w-full"
        />

        {/* Date */}
        <input
          type="date"
          name="application_date"
          value={form.application_date}
          onChange={handleChange}
          className="border rounded p-2 w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full p-3 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Saving..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
