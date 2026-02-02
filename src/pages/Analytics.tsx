import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Line,
  Doughnut,
} from "react-chartjs-2";
import "chart.js/auto";
import * as XLSX from "xlsx";

// Category color mapping
const categoryColors: any = {
  "Livestock": "#3B82F6",
  "Medical": "#EF4444",
  "Education": "#F59E0B",
  "Soft Loan": "#10B981",
  "Monthly Assistance": "#8B5CF6",
  "Livelihood Generation": "#EAB308",
  "Office Expense": "#6B7280",
  "Salary": "#0EA5E9",
  "Other": "#A1A1AA",
};

export default function Analytics() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [payments, setPayments] = useState([]);

  const [monthlyTotals, setMonthlyTotals] = useState<number[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<any>({});
  const [topBeneficiaries, setTopBeneficiaries] = useState<any[]>([]);
  const [topExpenses, setTopExpenses] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [year]);

  const loadAnalytics = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .gte("payment_date", `${year}-01-01`)
      .lte("payment_date", `${year}-12-31`)
      .order("payment_date", { ascending: true });

    if (error) return;

    setPayments(data);
    computeMonthlyTotals(data);
    computeCategoryTotals(data);
    computeTopBeneficiaries(data);
    computeTopExpenses(data);
  };

  // 1️⃣ Monthly Totals for Line Chart
  const computeMonthlyTotals = (data: any[]) => {
    const monthly = Array(12).fill(0);

    data.forEach((p) => {
      const monthIndex = new Date(p.payment_date).getMonth();
      monthly[monthIndex] += p.amount;
    });

    setMonthlyTotals(monthly);
  };

  // 2️⃣ Category Pie Chart Data
  const computeCategoryTotals = (data: any[]) => {
    const totals: any = {};

    data.forEach((p) => {
      totals[p.category] = (totals[p.category] || 0) + p.amount;
    });

    setCategoryTotals(totals);
  };

  // 3️⃣ Top Beneficiaries
  const computeTopBeneficiaries = (data: any[]) => {
    const map: any = {};

    data.forEach((p) => {
      if (!p.beneficiary_id) return;

      map[p.beneficiary_id] = map[p.beneficiary_id] || {
        beneficiary_id: p.beneficiary_id,
        total: 0,
        count: 0,
        last_date: p.payment_date,
      };

      map[p.beneficiary_id].total += p.amount;
      map[p.beneficiary_id].count += 1;
      map[p.beneficiary_id].last_date = p.payment_date;
    });

    setTopBeneficiaries(Object.values(map).sort((a: any, b: any) => b.total - a.total).slice(0, 5));
  };

  // 4️⃣ Top Expenses / Vendors
  const computeTopExpenses = (data: any[]) => {
    const map: any = {};

    data.forEach((p) => {
      if (p.category === "Salary") return;
      if (p.category === "Livestock") return;

      map[p.category] = (map[p.category] || 0) + p.amount;
    });

    setTopExpenses(
      Object.entries(map)
        .map(([category, total]) => ({ category, total }))
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, 5)
    );
  };

  // 5️⃣ Export to Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(payments);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Analytics");
    XLSX.writeFile(wb, `analytics-${year}.xlsx`);
  };

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold text-blue-700">Analytics</h1>

      {/* Year Filter */}
      <div className="flex gap-4 items-center">
        <label className="font-semibold">Select Year</label>
        <select
          className="border p-2 rounded-lg"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <button
          className="px-6 py-2 bg-green-600 text-white rounded-lg shadow"
          onClick={exportExcel}
        >
          Export Excel
        </button>
      </div>

      {/* Monthly Trend Line Chart */}
      <div className="bg-white shadow p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Monthly Spending Trend</h2>

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
                tension: 0.4,
                borderWidth: 3,
                fill: true,
                backgroundColor: "rgba(37,99,235,0.2)",
              },
            ],
          }}
          height={90}
        />
      </div>

      {/* Category Distribution */}
      <div className="bg-white shadow p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Category Wise Distribution</h2>

        <Doughnut
          data={{
            labels: Object.keys(categoryTotals),
            datasets: [
              {
                data: Object.values(categoryTotals),
                backgroundColor: Object.keys(categoryTotals).map(
                  (cat) => categoryColors[cat] || "#ccc"
                ),
                borderWidth: 1,
              },
            ],
          }}
        />
      </div>

      {/* Top Beneficiaries */}
      <div className="bg-white shadow p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Top Beneficiaries</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-2">Beneficiary ID</th>
              <th className="p-2 text-right">Total Amount</th>
              <th className="p-2 text-center">Payments</th>
              <th className="p-2 text-center">Last Payment</th>
            </tr>
          </thead>

          <tbody>
            {topBeneficiaries.map((b: any) => (
              <tr key={b.beneficiary_id} className="border-b hover:bg-gray-50">
                <td className="p-2">{b.beneficiary_id}</td>
                <td className="p-2 text-right">₹{b.total.toLocaleString()}</td>
                <td className="p-2 text-center">{b.count}</td>
                <td className="p-2 text-center">{b.last_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Expense Categories */}
      <div className="bg-white shadow p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Top Expense Categories</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-2">Category</th>
              <th className="p-2 text-right">Total Amount</th>
            </tr>
          </thead>

          <tbody>
            {topExpenses.map((e: any) => (
              <tr key={e.category} className="border-b hover:bg-gray-50">
                <td className="p-2">{e.category}</td>
                <td className="p-2 text-right">₹{e.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
