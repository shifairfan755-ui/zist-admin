import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function EditApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("applications")
        .select("*")
        .eq("id", id)
        .single();

      setApp(data);
      setLoading(false);
    };

    load();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);

    await supabase
      .from("applications")
      .update(app)
      .eq("id", id);

    setSaving(false);
    navigate(`/applications/view/${id}`);
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!app) return <p className="p-6 text-red-600">Application not found</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <Link to="/applications" className="text-blue-600">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold text-blue-700 mt-4 mb-6">
        Edit Application — {app.application_no}
      </h1>

      <div className="bg-white p-6 rounded-xl shadow border space-y-4">

        <input
          className="border p-3 rounded w-full"
          value={app.applicant_name}
          onChange={(e) =>
            setApp({ ...app, applicant_name: e.target.value })
          }
        />

        <input
          className="border p-3 rounded w-full"
          value={app.phone}
          onChange={(e) =>
            setApp({ ...app, phone: e.target.value })
          }
        />

        <input
          className="border p-3 rounded w-full"
          value={app.address}
          onChange={(e) =>
            setApp({ ...app, address: e.target.value })
          }
        />

        <button
          disabled={saving}
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>
    </div>
  );
}
