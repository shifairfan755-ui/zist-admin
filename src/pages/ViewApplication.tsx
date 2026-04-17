import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ViewApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const deleteApplication = async () => {
    if (!confirm("Delete this application?")) return;

    await supabase.from("applications").delete().eq("id", id);
    navigate("/applications");
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!app) return <p className="p-6 text-red-600">Application Not Found</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <Link to="/applications" className="text-blue-600">
        ← Back to Applications
      </Link>

      <h1 className="text-3xl font-bold mt-4 mb-6">
        Application — {app.application_no}
      </h1>

      <div className="bg-white p-6 border rounded-xl space-y-3">
        <p><b>Name:</b> {app.applicant_name}</p>
        <p><b>Parentage:</b> {app.parentage}</p>
        <p><b>Phone:</b> {app.phone}</p>
        <p><b>Address:</b> {app.address}</p>
        <p><b>Requested For:</b> {app.requested_for}</p>
        <p><b>Amount:</b> ₹{app.amount_requested}</p>
        <p><b>Status:</b> {app.status}</p>
      </div>

      <div className="flex gap-4 mt-6">
        <Link
          to={`/applications/edit/${app.id}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Edit Application
        </Link>

        <button
          onClick={deleteApplication}
          className="bg-red-600 text-white px-6 py-3 rounded-lg"
        >
          Delete
        </button>
      </div>

    </div>
  );
}
