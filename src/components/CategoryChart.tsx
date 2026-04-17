import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  const [stats, setStats] = useState({
    today: 0,
    month: 0,
    year: 0,
    categories: 0,
  });

  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("payments")
      .select("*");

    if (error || !data) {
      setLoading(false);
      return;
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

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

    data.forEach((item: any) => {
      const amount = Number(item.amount || 0);

      if (!item.payment_date) return;

      const date = new Date(item.payment_date);
      const monthName = date.toLocaleString("default", {
        month: "short",
      });

      if (item.payment_date === todayStr) {
        todayTotal += amount;
      }

      if (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      ) {
        monthTotal += amount;
      }

      if (date.getFullYear() === currentYear) {
        yearTotal += amount;
      }

      monthMap[monthName] += amount;

      const cat = item.category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + amount;
    });

    const monthlyFormatted = Object.keys(monthMap).map((key) => ({
      month: key,
      amount: monthMap[key],
    }));

    const categoryFormatted = Object.keys(categoryMap).map(
      (key) => ({
        name: key,
        value: categoryMap[key],
      })
    );

    setStats({
      today: todayTotal,
      month: monthTotal,
      year: yearTotal,
      categories: categoryFormatted.length,
    });

    setMonthlyData(monthlyFormatted);
    setCategoryData(categoryFormatted);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-xl font-semibold">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-lg">
          <p className="text-sm opacity-80">Today</p>
          <h2 className="text-4xl font-bold mt-2">
            ₹{stats.today.toLocaleString()}
          </h2>
        </div>

        <div className="bg-green-600 text-white rounded-2xl p-6 shadow-lg">
          <p className="text-sm opacity-80">This Month</p>
          <h2 className="text-4xl font-bold mt-2">
            ₹{stats.month.toLocaleString()}
          </h2>
        </div>

        <div className="bg-purple-600 text-white rounded-2xl p-6 shadow-lg">
          <p className="text-sm opacity-80">This Year</p>
          <h2 className="text-4xl font-bold mt-2">
            ₹{stats.year.toLocaleString()}
          </h2>
        </div>

        <div className="bg-orange-500 text-white rounded-2xl p-6 shadow-lg">
          <p className="text-sm opacity-80">Categories</p>
          <h2 className="text-4xl font-bold mt-2">
            {stats.categories}
          </h2>
        </div>
      </div>

      {/* Monthly Payment Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 overflow-hidden">
        <h2 className="text-2xl font-bold mb-6">
          Monthly Payment Summary
        </h2>

        <div className="w-full h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyData}
              margin={{
                top: 20,
                right: 30,
                left: 50,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis
                width={90}
                tickFormatter={(value) =>
                  Number(value).toLocaleString()
                }
              />

              <Tooltip
                formatter={(value: any) =>
                  `₹${Number(value).toLocaleString()}`
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

      {/* Category Distribution */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">
          Category Distribution
        </h2>

        <div className="w-full h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                outerRadius={140}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      COLORS[index % COLORS.length]
                    }
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value: any) =>
                  `₹${Number(value).toLocaleString()}`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}