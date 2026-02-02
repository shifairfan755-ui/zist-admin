import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ProfileHeader({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      let { data, error } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setData(data);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) return <p>Loading profile...</p>;
  if (!data) return <p>Beneficiary not found.</p>;

  const statusColors = {
    Pending: "bg-yellow-500",
    "Approved For Verification": "bg-blue-500",
    "Verification Done": "bg-indigo-600",
    "Report Submitted": "bg-purple-600",
    "Final Call": "bg-green-600",
    Rejected: "bg-red-600",
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold capitalize">{data.name}</h1>
          <p className="text-gray-600">{data.phone}</p>
          <p className="mt-2 text-gray-700"><b>Category:</b> {data.category}</p>
          <p className="text-gray-700"><b>Address:</b> {data.address}</p>

          <div className="mt-2">
            <span
              className={`px-3 py-1 text-white text-sm rounded ${statusColors[data.status] || "bg-gray-500"}`}
            >
              {data.status}
            </span>
          </div>
        </div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => alert("Edit beneficiary to be added next step")}
        >
          Edit
        </button>
      </div>
    </div>
  );
}
