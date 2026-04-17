import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#14B8A6",
  "#F97316",
  "#6366F1",
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    today: 0,
    month: 0,
    year: 0,
    categories: 0,
  });

  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [latestStory, setLatestStory] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);

    const { data: payments } = await supabase
      .from("payments")
      .select("*")
      .order("payment_date", { ascending: false });

    const { data: stories } = await supabase
      .from("success_stories")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    const today = new Date();
    const monthNow = today.getMonth();
    const yearNow = today.getFullYear();
    const todayString = today.toISOString().split("T")[0];

    let todayTotal = 0;
    let monthTotal = 0;
    let yearTotal = 0;

    const monthMap: any = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sep: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
    };

    const categoryMap: any = {};

    (payments || []).forEach((item: any) => {
      const amount = Number(item.amount || 0);

      if (!item.payment_date) return;

      const d = new Date(item.payment_date);
      const month = d.toLocaleString("default", {
        month: "short",
      });

      if (item.payment_date === todayString) {
        todayTotal += amount;
      }

      if (
        d.getMonth() === monthNow &&
        d.getFullYear() === yearNow
      ) {
        monthTotal += amount;
      }

      if (d.getFullYear() === yearNow) {
        yearTotal += amount;
      }

      monthMap[month] += amount;

      const cat = item.category || "Other";
      categoryMap[cat] =
        (categoryMap[cat] || 0) + amount;
    });

    setStats({
      today: todayTotal,
      month: monthTotal,
      year: yearTotal,
      categories: Object.keys(categoryMap).length,
    });

    setMonthlyData(
      Object.keys(monthMap).map((key) => ({
        month: key,
        amount: monthMap[key],
      }))
    );

    setCategoryData(
      Object.keys(categoryMap).map((key) => ({
        name: key,
        value: categoryMap[key],
      }))
    );

    setRecentPayments((payments || []).slice(0, 5));
    setLatestStory(stories?.[0] || null);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xl font-semibold">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">
          Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          ZIST Admin Panel Overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <Card
          title="Today"
          value={`₹${stats.today.toLocaleString()}`}
          color="from-blue-500 to-blue-700"
        />
        <Card
          title="This Month"
          value={`₹${stats.month.toLocaleString()}`}
          color="from-green-500 to-green-700"
        />
        <Card
          title="This Year"
          value={`₹${stats.year.toLocaleString()}`}
          color="from-purple-500 to-purple-700"
        />
        <Card
          title="Categories"
          value={stats.categories}
          color="from-orange-500 to-orange-700"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Monthly */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">
            Monthly Payment Summary
          </h2>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 20,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(v) =>
                    `${Math.round(v / 1000)}k`
                  }
                />
                <Tooltip
                  formatter={(v: any) =>
                    `₹${Number(v).toLocaleString()}`
                  }
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">
            Category Distribution
          </h2>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {categoryData.map((_: any, index: number) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[index % COLORS.length]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(v: any) =>
                    `₹${Number(v).toLocaleString()}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Payments */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">
            Recent Payments
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="text-left py-3">
                    Date
                  </th>
                  <th className="text-left py-3">
                    Name
                  </th>
                  <th className="text-left py-3">
                    Category
                  </th>
                  <th className="text-right py-3">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentPayments.map((item: any) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-0"
                  >
                    <td className="py-3">
                      {item.payment_date}
                    </td>
                    <td className="py-3">
                      {item.payee_name}
                    </td>
                    <td className="py-3">
                      {item.category}
                    </td>
                    <td className="py-3 text-right font-medium text-green-600">
                      ₹
                      {Number(
                        item.amount
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Story */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">
            Latest Success Story
          </h2>

          {latestStory ? (
            <div className="space-y-3">
              <div className="text-lg font-semibold text-slate-800">
                {latestStory.title}
              </div>

              <div className="text-sm text-slate-500">
                {new Date(
                  latestStory.created_at
                ).toLocaleDateString()}
              </div>

              <p className="text-sm text-slate-600 line-clamp-5">
                {latestStory.description ||
                  latestStory.content}
              </p>
            </div>
          ) : (
            <p className="text-slate-500">
              No success story found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: any;
  color: string;
}) {
  return (
    <div
      className={`rounded-2xl shadow text-white p-6 bg-gradient-to-r ${color}`}
    >
      <p className="text-sm opacity-90">
        {title}
      </p>
      <h2 className="text-3xl font-bold mt-2">
        {value}
      </h2>
    </div>
  );
}