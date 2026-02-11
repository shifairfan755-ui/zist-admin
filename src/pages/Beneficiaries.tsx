import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import useUserRole from "../lib/useUserRole";

export default function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const { role } = useUserRole();

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  async function loadBeneficiaries() {
    const { data } = await supabase.from("beneficiaries").select("*");
    setBeneficiaries(data || []);
  }

  return (
    <div className="p-6">

      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Beneficiaries</h1>

        {/* Viewer cannot add beneficiaries */}
        {role !== "Viewer" && (
          <Link
            to="/add-beneficiary"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            + Add Beneficiary
          </Link>
        )}
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 border">
            <th className="p-2">Ben No</th>
            <th className="p-2">Name</th>
            <th className="p-2">Category</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {beneficiaries.map((b: any) => (
            <tr key={b.id} className="border">
              <td className="p-2">{b.ben_no}</td>
              <td className="p-2">{b.full_name}</td>
              <td className="p-2">{b.category}</td>
              <td className="p-2">{b.phone}</td>

              <td className="p-2">
                <Link className="text-blue-600" to={`/view-beneficiary/${b.id}`}>
                  View
                </Link>

                {role !== "Viewer" && (
                  <>
                    <Link
                      className="ml-3 text-green-600"
                      to={`/edit-beneficiary/${b.id}`}
                    >
                      Edit
                    </Link>

                    <button className="ml-3 text-red-600">
                      Delete
                    </button>
                  </>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
