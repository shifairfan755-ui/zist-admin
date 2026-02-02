import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// Strong color status badges
const badgeColors: any = {
  Pending: "bg-yellow-600 text-white",
  "Approved For Verification": "bg-blue-600 text-white",
  "Verification Done": "bg-indigo-600 text-white",
  "Final Discussion": "bg-purple-600 text-white",
  Approved: "bg-green-600 text-white",
  Granted: "bg-emerald-700 text-white",
  "Rejected Without Verification": "bg-red-700 text-white",
  Rejected: "bg-red-500 text-white",
};

export default function EditApplication() {
  const { id } = useParams();
  const [app, setApp] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const statusOptions = [
    "Pending",
    "Approved For Verification",
    "Verification Done",
    "Final Discussion",
    "Approved",
    "Granted",
    "Rejected Without Verification",
    "Rejected",
  ];

  // Fetch Application
  const fetchApplication = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) setApp(data);
  };

  // Fetch Photos
  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from("application_photos")
      .select("*")
      .eq("application_id", id);

    if (!error) setPhotos(data || []);
  };

  useEffect(() => {
    (async () => {
      await fetchApplication();
      await fetchPhotos();
      setLoading(false);
    })();
  }, [id]);

  // Save Updates
  const handleSave = async () => {
    try {
      setSaving(true);

      // 1️⃣ Update main application fields
      const { error: updateErr } = await supabase
        .from("applications")
        .update({
          applicant_name: app.applicant_name,
          parentage: app.parentage,
          address: app.address,
          phone: app.phone,
          requested_for: app.requested_for,
          application_type: app.application_type,
          amount_requested: app.amount_requested,
          recommendation: app.recommendation,
          application_date: app.application_date,
          remarks: app.remarks,
          notes: app.notes,
          status: app.status,
        })
        .eq("id", id);

      if (updateErr) throw updateErr;

      // 2️⃣ Upload new document (replace)
      if (documentFile) {
        const ext = documentFile.name.split(".").pop();
        const fileName = `APP-${id}-${Date.now()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("application_files")
          .upload(fileName, documentFile, { upsert: true });

        if (upErr) throw upErr;

        const { data: pub } = supabase.storage
          .from("application_files")
          .getPublicUrl(fileName);

        await supabase
          .from("applications")
          .update({ file_url: pub.publicUrl })
          .eq("id", id);
      }

      // 3️⃣ Upload additional photos
      for (const photo of newPhotos) {
        const ext = photo.name.split(".").pop();
        const fileName = `APP-PHOTO-${id}-${Date.now()}-${Math.random()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("application_photos")
          .upload(fileName, photo);

        if (upErr) throw upErr;

        const { data: pub } = supabase.storage
          .from("application_photos")
          .getPublicUrl(fileName);

        await supabase.from("application_photos").insert([
          {
            application_id: id,
            photo_url: pub.publicUrl,
          },
        ]);
      }

      alert("Application updated successfully!");
      window.location.href = `/view-application/${id}`;
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <p className="p-6">Loading...</p>;

  if (!app)
    return <p className="p-6 text-red-600">Application not found.</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Back */}
      <Link to="/applications" className="text-blue-600">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold text-blue-700 mt-4 mb-6">
        Edit Application — {app.application_no}
      </h1>

      {/* Main Card */}
      <div className="bg-white p-6 rounded-2xl shadow border space-y-4">

        {/* Status Badge */}
        <div>
          <span className={`px-4 py-2 rounded-full text-md ${badgeColors[app.status]}`}>
            {app.status}
          </span>
        </div>

        {/* Editable Fields */}
        <div className="grid md:grid-cols-2 gap-4">

          <Input label="Applicant Name" field="applicant_name" app={app} setApp={setApp} />
          <Input label="Parentage" field="parentage" app={app} setApp={setApp} />
          <Input label="Phone" field="phone" app={app} setApp={setApp} />
          <Input label="Address" field="address" app={app} setApp={setApp} />
          <Input label="Requested For" field="requested_for" app={app} setApp={setApp} />
          <Input label="Application Type" field="application_type" app={app} setApp={setApp} />
          <Input label="Amount Requested" field="amount_requested" app={app} setApp={setApp} />
          <Input label="Recommendation" field="recommendation" app={app} setApp={setApp} />
          <Input label="Application Date" field="application_date" type="date" app={app} setApp={setApp} />
          <Input label="Remarks" field="remarks" app={app} setApp={setApp} />
          <Input label="Notes" field="notes" app={app} setApp={setApp} />

          {/* Status Dropdown */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Status</label>
            <select
              className="border p-2 rounded w-full"
              value={app.status}
              onChange={(e) => setApp({ ...app, status: e.target.value })}
            >
              {statusOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Existing Photos Gallery */}
        <h2 className="text-xl font-bold text-gray-700 mt-6">Existing Photos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((p) => (
            <img
              key={p.id}
              src={p.photo_url}
              className="w-full h-32 object-cover rounded-xl border shadow"
            />
          ))}
        </div>

        {/* Upload New Photos */}
        <div>
          <p className="font-semibold mt-4">Upload Additional Photos</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e: any) => setNewPhotos(Array.from(e.target.files))}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Replace Document */}
        <div>
          <p className="font-semibold mt-4">Replace Document</p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e: any) => setDocumentFile(e.target.files[0])}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Save Button */}
        <button
          disabled={saving}
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 mt-6"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>
    </div>
  );
}

// Reusable Input Component
function Input({ label, field, app, setApp, type = "text" }: any) {
  return (
    <div>
      <label className="block text-sm text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={app[field] || ""}
        onChange={(e) => setApp({ ...app, [field]: e.target.value })}
        className="border p-2 rounded w-full"
      />
    </div>
  );
}
