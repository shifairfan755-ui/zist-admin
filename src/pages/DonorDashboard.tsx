import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DonorDashboard() {
  const [donors, setDonors] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    // Load donors
    const { data: donorList } = await supabase
      .from("donors")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: donationList } = await supabase
      .from("donor_donations")
      .select("*")
      .order("date_given", { ascending: false });

    setDonors(donorList || []);
    setDonations(donationList || []);
    setLoading(false);
  }

  if (loading) return <p className="p-6">Loading Dashboard...</p>;

  // ==========================
  // STATS
  // ==========================

  const totalDonationAmount = donations.reduce(
    (sum, d) => sum + Number(d.amount || 0),
    0
  );

  const donationCount = donations.length;
  const donorCount = donors.length;

  // ==============================
  // DONATIONS BY TYPE (Pie Chart)
  // ==============================

  const typeCounts: any = {};
  donations.forEach((d) => {
    typeCounts[d.donation_type] = (typeCounts[d.donation_type] || 0) + 1;
  });

  const donationTypeData = Object.keys(typeCounts).map((key) => ({
    name: key,
    value: typeCounts[key],
  }));

  const colors = ["#4ade80", "#60a5fa", "#facc15", "#fb7185", "#a78bfa"];

  // ==============================
  // DONATIONS BY MONTH (Bar Chart)
  // ==============================

  const monthlyTotals: any = {};

  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    monthlyTotals[key] = 0;
  }

  donations.forEach((d) => {
    const date = new Date(d.date_given);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (monthlyTotals[key] !== undefined) {
      monthlyTotals[key] += Number(d.amount || 0);
    }
  });

  const monthlyData = Object.keys(monthlyTotals)
    .map((key) => {
      const [year, month] = key.split("-");
      return {
        month: `${month}/${year}`,
        amount: monthlyTotals[key],
      };
    })
    .reverse();

  // ==============================
  // RECENT DONATIONS TABLE
  // ==============================
  const recentDonations = donations.slice(0, 5);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Donor Dashboard</h1>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatBox label="Total Donors" value={donorCount} />
        <StatBox
          label="Total Donation Amount"
          value={`₹${totalDonationAmount.toLocaleString()}`}
        />
        <StatBox label="Total Donations" value={donationCount} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-semibold mb-4">Donations by Type</h2>
          {donationTypeData.length === 0 ? (
            <p className="text-gray-500">No donations yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={donationTypeData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  label
                >
                  {donationTypeData.map((entry, index) => (
                    <Cell key={index} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* BAR CHART */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-semibold mb-4">Donations Last 12 Months</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#4ade80" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT DONATIONS */}
      <h2 className="text-xl font-bold mb-4">Recent Donations</h2>
      <div className="bg-white rounded-xl overflow-hidden shadow border">
        <table className="w-full border-collapse">
          <thead className="bg-green-100">
            <tr>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Amount</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {recentDonations.length === 0 ? (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={4}>
                  No donations yet
                </td>
              </tr>
            ) : (
              recentDonations.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="p-3 border">
                    {new Date(d.date_given).toLocaleDateString()}
                  </td>
                  <td className="p-3 border text-green-700 font-bold">
                    ₹{Number(d.amount).toLocaleString()}
                  </td>
                  <td className="p-3 border">{d.donation_type}</td>
                  <td className="p-3 border">{d.remarks || "--"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatBox({ label, value }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border text-center">
      <p className="text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
