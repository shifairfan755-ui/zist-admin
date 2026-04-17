import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Donors() {
  const [donors, setDonors] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadDonors();
  }, []);

  async function loadDonors() {
    const { data: donorList, error } = await supabase
      .from("donors")
      .select("id, donor_name, phone, address, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const donorDataWithStats = await Promise.all(
      (donorList || []).map(async (donor) => {
        const { data: donations } = await supabase
          .from("donor_donations")
          .select("amount, date_given")
          .eq("donor_id", donor.id)
          .order("date_given", { ascending: false });

        const totalAmount =
          donations?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0;

        const lastDonation = donations?.[0]?.date_given || null;

        return {
          ...donor,
          totalAmount,
          lastDonation,
          donationCount: donations?.length || 0,
        };
      })
    );

    setDonors(donorDataWithStats);
  }

  const filtered = donors.filter((d) =>
    (
      (d.donor_name || "") +
      (d.phone || "") +
      (d.address || "") +
      (d.totalAmount || "")
    )
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-700">Donors</h1>

        {/* ✅ FIXED ROUTE */}
        <Link
          to="/donors/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
        >
          + Add Donor
        </Link>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search donors..."
        className="border px-4 py-2 rounded-lg w-1/3 mb-4 shadow-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-green-100">
            <tr>
              <th className="p-3 border text-left">Name</th>
              <th className="p-3 border text-left">Phone</th>
              <th className="p-3 border text-left">Total Donated</th>
              <th className="p-3 border text-left">Donations</th>
              <th className="p-3 border text-left">Last Donation</th>
              <th className="p-3 border text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No donors found
                </td>
              </tr>
            ) : (
              filtered.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{d.donor_name}</td>
                  <td className="p-3 border">{d.phone || "--"}</td>

                  <td className="p-3 border font-semibold text-green-700">
                    ₹{(d.totalAmount || 0).toLocaleString()}
                  </td>

                  <td className="p-3 border text-center">
                    {d.donationCount}
                  </td>

                  <td className="p-3 border">
                    {d.lastDonation
                      ? new Date(d.lastDonation).toLocaleDateString()
                      : "--"}
                  </td>

                  <td className="p-3 border">
                    {/* ✅ FIXED ROUTE */}
                    <Link
                      to={`/donors/view/${d.id}`}
                      className="text-blue-600 underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
