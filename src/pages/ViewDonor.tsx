import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";

export default function ViewDonor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donor, setDonor] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonor();
    loadDonations();
  }, [id]);

  async function loadDonor() {
    const { data, error } = await supabase
      .from("donors")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast.error("Donor not found");
      navigate("/donors");
      return;
    }

    setDonor(data);
  }

  async function loadDonations() {
    const { data: donationList } = await supabase
      .from("donor_donations")
      .select("id, amount, donation_type, date_given, remarks")
      .eq("donor_id", id)
      .order("date_given", { ascending: false });

    setDonations(donationList || []);

    // Load receipts for all donations
    const allReceipts: any[] = [];

    for (const donation of donationList || []) {
      const { data: rec } = await supabase
        .from("donor_receipts")
        .select("*")
        .eq("donation_id", donation.id);

      if (rec && rec.length > 0) {
        allReceipts.push({ donation_id: donation.id, files: rec });
      }
    }

    setReceipts(allReceipts);
    setLoading(false);
  }

  // Delete Donor
  async function deleteDonor() {
    const yes = confirm("Are you sure you want to delete this donor?");
    if (!yes) return;

    const { error } = await supabase
      .from("donors")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Delete failed");
      return;
    }

    toast.success("Donor deleted");
    navigate("/donors");
  }

  if (loading) return <p className="p-6">Loading...</p>;

  if (!donor) return <p className="p-6 text-red-600">Donor not found</p>;

  // Summary
  const totalAmount = donations.reduce(
    (sum, d) => sum + Number(d.amount || 0),
    0
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link to="/donors" className="text-blue-600">
        ← Back to Donors
      </Link>

      <h1 className="text-3xl font-bold text-green-700 mt-4 mb-6">
        Donor Profile
      </h1>

      {/* Donor Profile Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border mb-8">
        <h2 className="text-2xl font-bold">{donor.donor_name}</h2>
        <p className="text-gray-600 mt-1">
          Phone: {donor.phone || "--"}
        </p>
        <p className="text-gray-600">
          Address: {donor.address || "--"}
        </p>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <SummaryBox label="Total Donations" value={`₹${totalAmount.toLocaleString()}`} />
          <SummaryBox label="Number of Donations" value={donations.length} />
          <SummaryBox label="Last Donation" value={donations[0]?.date_given ? new Date(donations[0].date_given).toLocaleDateString() : "--"} />
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex gap-4">
          <Link
            to={`/add-donation/${donor.id}`}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-green-700"
          >
            + Add Donation
          </Link>

          <Link
            to={`/edit-donor/${donor.id}`}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700"
          >
            Edit Donor
          </Link>

          <Link
            to={`/donor/${donor.id}/pdf`}
            className="bg-purple-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-purple-700"
          >
            Export PDF
          </Link>

          <button
            onClick={deleteDonor}
            className="bg-red-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-red-700"
          >
            Delete Donor
          </button>
        </div>
      </div>

      {/* Donation History */}
      <h2 className="text-xl font-bold mb-3">Donation History</h2>

      <div className="bg-white rounded-xl border shadow overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-green-100">
            <tr>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Amount</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Remarks</th>
              <th className="p-3 border">Receipt</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {donations.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No donations recorded
                </td>
              </tr>
            ) : (
              donations.map((d) => {
                const rec = receipts.find((r) => r.donation_id === d.id);

                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="p-3 border">
                      {new Date(d.date_given).toLocaleDateString()}
                    </td>

                    <td className="p-3 border text-green-700 font-bold">
                      ₹{Number(d.amount).toLocaleString()}
                    </td>

                    <td className="p-3 border">{d.donation_type}</td>
                    <td className="p-3 border">{d.remarks || "--"}</td>

                    <td className="p-3 border">
                      {rec && rec.files.length > 0 ? (
                        <a
                          href={rec.files[0].file_url}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          View Receipt
                        </a>
                      ) : (
                        "--"
                      )}
                    </td>

                    <td className="p-3 border">
                      <Link
                        to={`/edit-donation/${d.id}`}
                        className="text-blue-600 underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryBox({ label, value }: any) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 border shadow-sm">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
