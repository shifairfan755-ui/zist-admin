import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ViewBeneficiary() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ben, setBen] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
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

    setBen(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  /* ---------------- DELETE ---------------- */
  const deleteBeneficiary = async () => {
    const yes = window.confirm("Delete beneficiary permanently?");
    if (!yes) return;

    try {
      // Delete photo from storage
      if (ben.photo_url) {
        const path = ben.photo_url.split("/object/public/beneficiary-photos/")[1];
        if (path) {
          await supabase.storage.from("beneficiary-photos").remove([path]);
        }
      }

      // Delete DB row
      const { error } = await supabase
        .from("beneficiaries")
        .delete()
        .eq("id", id);

      if (error) {
        alert("Delete failed");
        return;
      }

      alert("Beneficiary deleted");
      navigate("/beneficiaries");
    } catch (err) {
      alert("Something went wrong");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!ben) return <p className="p-6">Not found</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <Link to="/beneficiaries" className="text-blue-600">
        ← Back to Beneficiaries
      </Link>

      <h1 className="text-3xl font-bold text-blue-700 mt-3 mb-6">
        Beneficiary Profile — #{ben.ben_no}
      </h1>

      <div className="bg-white shadow-md border rounded-xl p-6">

        {/* Top section */}
        <div className="flex gap-6 border-b pb-4 mb-4">
          <div className="flex-1">
            <p className="text-xl font-bold">{ben.full_name}</p>
            <p className="text-gray-600">S/o {ben.parentage}</p>
            <p className="mt-2">{ben.address}</p>
          </div>

          {ben.photo_url && (
            <img
              src={ben.photo_url}
              className="w-32 h-40 object-cover border rounded"
              alt=""
            />
          )}
        </div>

        {/* Details Table */}
        <table className="w-full text-sm">
          <tbody>
            <Detail label="Full Name" value={ben.full_name} />
            <Detail label="Parentage" value={ben.parentage} />
            <Detail label="Phone" value={ben.phone} />
            <Detail label="Age" value={ben.age} />
            <Detail label="Address" value={ben.address} />
            <Detail label="District" value={ben.district} />
            <Detail label="Category" value={ben.category} />
            <Detail label="Status" value={ben.current_status} />
            <Detail label="Quantity" value={ben.quantity} />
            <Detail label="Amount" value={ben.amount} />
            <Detail label="Amount Sanctioned" value={ben.amount_sanctioned} />
            <Detail label="Remarks" value={ben.remarks} />
            <Detail label="Notes" value={ben.notes} />

            {/* Linked Application */}
            <Detail
              label="Source Application"
              value={
                ben.source_application_id ? (
                  <Link
                    to={`/view-application/${ben.source_application_id}`}
                    className="text-blue-600 underline"
                  >
                    View Application
                  </Link>
                ) : (
                  "---"
                )
              }
            />
          </tbody>
        </table>

      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-6">
        <Link
          to={`/edit-beneficiary/${ben.id}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Edit
        </Link>

        <button
          onClick={deleteBeneficiary}
          className="bg-red-600 text-white px-6 py-3 rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/* ---------------- COMPONENT ---------------- */

function Detail({ label, value }: any) {
  return (
    <tr>
      <td className="bg-gray-100 p-3 border font-semibold w-[40%]">
        {label}
      </td>
      <td className="bg-gray-50 p-3 border w-[60%]">
        {value || "---"}
      </td>
    </tr>
  );
}
