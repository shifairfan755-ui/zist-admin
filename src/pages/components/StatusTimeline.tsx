import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function StatusTimeline({ id }) {
  const [status, setStatus] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("status, created_at")
        .eq("id", id)
        .single();

      if (!error && data) {
        setStatus(data.status);
        setCreatedAt(data.created_at);
      }
    };

    fetchStatus();
  }, [id]);

  const steps = [
    "Pending",
    "Approved For Verification",
    "Verification Done",
    "Report Submitted",
    "Final Call",
    "Rejected",
  ];

  const colors = {
    Pending: "bg-yellow-500",
    "Approved For Verification": "bg-blue-500",
    "Verification Done": "bg-indigo-600",
    "Report Submitted": "bg-purple-600",
    "Final Call": "bg-green-600",
    Rejected: "bg-red-600",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Status Timeline</h2>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = status === step;

          return (
            <div key={index} className="flex items-center space-x-4">
              <div
                className={`w-4 h-4 rounded-full ${
                  isActive ? colors[step] : "bg-gray-300"
                }`}
              ></div>

              <span
                className={`font-medium ${
                  isActive ? "text-black" : "text-gray-500"
                }`}
              >
                {step}
              </span>

              {isActive && createdAt && (
                <span className="text-sm text-gray-600">
                  ({new Date(createdAt).toLocaleString()})
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
