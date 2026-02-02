import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Line, Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import * as XLSX from "xlsx";

export default function BeneficiaryAnalytics() {
  const { id: routeBeneficiaryId } = useParams();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [beneficiary, setBeneficiary] = useState<any>(null);
  const [payments, setPayments] = useState([]);

  const [categoryTotals, setCategoryTotals] = useState<any>({});
  const [monthlyTotals, setMonthlyTotals] = useState<any[]>([]);

  // Load initial if opened via beneficiary page
  useEffect(() => {
    if (routeBeneficiaryId) {
      loadBeneficiary(routeBeneficiaryId);
    }
  }, [routeBeneficiaryId]);

  // Autocomplete search
  const searchBeneficiaries = async (text: string) => {
    setSearch(text);
    if (!text.trim()) return setSuggestions([]);

    const { data } = await supabase
      .from("beneficiaries")
      .select("id, ben_no, name")
      .or(`name.ilike.%${text}%,ben_no.ilike.%${text}%`)
      .limit(10);

    setSuggestions(data || []);
  };

  // Load selected beneficiary
  const loadBeneficiary = async (id: string) => {
    const { data: ben } = await supabase
      .from("beneficiaries")
      .select("*")
      .eq("id", id)
      .single();

    setBeneficiary(ben);

    const { data: pay } = await supabase
      .from("payments")
      .select("*")
      .eq("beneficiary_id", id)
      .order("payment_date", { ascending: true });

    setPayments(pay || []);
    computeAnalytics(pay || []);
    setSuggestions([]);
    setSearch(`${ben.ben_no} - ${ben.name}`);
  };

  // Compute analytics
  const computeAnalytics = (pay: any[]) => {
    // Category totals
    const categories: any = {};
    pay.forEach((p) => {
      categories[p.category] = (categories[p.category] || 0) + p.amount;
    });
    setCategoryTotals(categories);

    // Monthly totals
    const monthly = Array(12).fill(0);
    pay.forEach((p) => {
      const m = new Date(p.payment_date).getMonth();
      monthly[m] += p.amount;
    });
    setMonthlyTotals(monthly);
  };

  // Export to Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(payments);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BeneficiaryPayments");
    XLSX.writeFile(wb, `beneficiary-${beneficiary.ben_no}.xlsx`);
  };

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold text-blue-700">Beneficiary Analytics</h1>

      {/* Search Box */}
      <div className="relative max-w-xl">
        <input
          className="border p-3 rounded-lg w-full"
          placeholder="Search beneficiary (name or BEN_NO)..."
          value={search}
          onChange={(e) => searchBeneficiaries(e.target.value)}
        />

        {suggestions.length > 0 && (
          <div className="absolute bg-white border rounded-lg shadow w-full mt-1 z-10">
            {suggestions.map((s: any) => (
              <div
                key={s.id}
                className="p-2 hover:bg-blue-50 cursor-pointer"
                onClick={() => loadBeneficiary(s.id)}
              >
                {s.ben_no} — {s.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* If no beneficiary selected */}
      {!beneficiary && (
        <p className="text-gray-500">Search and select a beneficiary to view analytics.</p>
      )}

      {/* ANALYTICS VIEW */}
      {beneficiary && (
        <>
          {/* Beneficiary Info */}
          <div className="bg-white shadow p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">{beneficiary.name}</h2>
            <p className="text-gray-600">BEN_NO: {beneficiary.ben_no}</p>
            <p className="text-gray-600">Phone: {beneficiary.phone || "N/A"}</p>

            <button
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg"
              onClick={exportExcel}
            >
              Export Payment History
            </button>
          </div>

          {/* Category Pie Chart */}
          <div className="bg-white shadow p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
            <Doughnut
              data={{
                labels: Object.keys(categoryTotals),
                datasets: [
                  {
                    data: Object.values(categoryTotals),
                    backgroundColor: [
                      "#3B82F6",
                      "#EF4444",
                      "#F59E0B",
                      "#10B981",
                      "#8B5CF6",
                      "#EAB308",
                      "#6B7280",
                      "#0EA5E9",
                      "#A1A1AA",
                    ],
                  },
                ],
              }}
            />
          </div>

          {/* Monthly Line Chart */}
          <div className="bg-white shadow p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Monthly Support Trend</h2>
            <Line
              data={{
                labels: [
                  "Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"
                ],
                datasets: [
                  {
                    label: "Amount (₹)",
                    data: monthlyTotals,
                    borderColor: "#2563EB",
                    backgroundColor: "rgba(37,99,235,0.2)",
                    borderWidth: 3,
                    tension: 0.4,
                  },
                ],
              }}
              height={80}
            />
          </div>

          {/* Payment History Table */}
          <div className="bg-white shadow p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Payment History</h2>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((p: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{p.payment_date}</td>
                    <td className="p-2">{p.category}</td>
                    <td className="p-2 text-right">₹{p.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
