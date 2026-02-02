import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";

export default function Dashboard() {
  const [payments, setPayments] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [yearTotal, setYearTotal] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("payment_date", { ascending: false });

    if (!error && data) {
      setPayments(data);
      computeDashboard(data);
    }
  };

  const computeDashboard = (data) => {
    if (!data.length) return;

    const today = new Date().toISOString().slice(0, 10);
    const month = today.slice(0, 7);
    const year = today.slice(0, 4);

    setTodayTotal(
      data.filter((p) => p.payment_date === today).reduce((s, p) => s + p.amount, 0)
    );

    setMonthTotal(
      data.filter((p) => p.payment_date.startsWith(month)).reduce((s, p) => s + p.amount, 0)
    );

    setYearTotal(
      data.filter((p) => p.payment_date.startsWith(year)).reduce((s, p) => s + p.amount, 0)
    );

    const grouped = {};
    data.forEach((p) => {
      grouped[p.category] = (grouped[p.category] || 0) + p.amount;
    });

    setCategoryTotals(grouped);
    setRecent(data.slice(0, 10));
  };

  return (
    <div className="p-6 space-y-10">

      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold text-primary">Dashboard</h1>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Today's Spending" amount={todayTotal} gradient="gradient-blue" />
        <StatCard title="This Month" amount={monthTotal} gradient="gradient-green" />
        <StatCard title="This Year" amount={yearTotal} gradient="gradient-purple" />
        <StatCard title="Total Categories" amount={Object.keys(categoryTotals).length} gradient="gradient-orange" />
      </div>

      {/* CATEGORY DONUT CHART */}
      <div className="bg-white p-6 rounded-card shadow-card">
        <h2 className="text-xl font-semibold mb-6 text-textDark">Category Distribution</h2>

        <div className="flex justify-center">
          <div className="w-[300px] md:w-[380px] lg:w-[420px]">
            <Doughnut
              data={{
                labels: Object.keys(categoryTotals),
                datasets: [
                  {
                    data: Object.values(categoryTotals),
                    backgroundColor: [
                      "#0D47A1",
                      "#10B981",
                      "#F59E0B",
                      "#EF4444",
                      "#3B82F6",
                      "#8B5CF6",
                      "#F87171",
                      "#34D399",
                      "#60A5FA",
                    ],
                    borderWidth: 1,
                    cutout: "60%",
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom", labels: { boxWidth: 14 } },
                },
              }}
              height={300}
            />
          </div>
        </div>
      </div>

      {/* RECENT PAYMENTS */}
      <div className="bg-white p-6 rounded-card shadow-card">
        <h2 className="text-xl font-semibold mb-4 text-textDark">Recent Payments</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-grayDark">
              <th className="p-2 text-left">Payee</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2 text-right">Date</th>
            </tr>
          </thead>

          <tbody>
            {recent.map((p, index) => (
              <tr key={index} className="border-b hover:bg-gray-50 transition-smooth">
                <td className="p-2">{p.payee_name}</td>
                <td className="p-2">
                  <span className="px-3 py-1 text-xs bg-primaryLight/20 text-primaryDark rounded-full">
                    {p.category}
                  </span>
                </td>
                <td className="p-2 text-right font-bold text-success">
                  ₹{p.amount.toLocaleString()}
                </td>
                <td className="p-2 text-right">{p.payment_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

/* PREMIUM KPI CARD */
function StatCard({ title, amount, gradient }) {
  return (
    <div className={`stat-card rounded-card p-6 text-white shadow-md ${gradient}`}>
      <h3 className="text-sm opacity-90">{title}</h3>
      <p className="text-3xl font-bold mt-1">₹{amount.toLocaleString()}</p>
    </div>
  );
}
