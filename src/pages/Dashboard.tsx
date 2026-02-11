supabase.from("zist_users").select("*").limit(1)
  .then(res => console.log("TEST SELECT:", res));

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import useUserRole from "../lib/useUserRole";
import CategoryChart from "../components/CategoryChart";

export default function Dashboard() {
  const { role, loading: roleLoading } = useUserRole();

  const [stats, setStats] = useState({
    today: 0,
    month: 0,
    year: 0,
    categories: 0,
  });

  const [latestStory, setLatestStory] = useState<any>(null);
  const [categoryData, setCategoryData] = useState([]);
console.log("ENV TEST:", import.meta.env);
console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("SUPABASE KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const todayStr = new Date().toISOString().split("T")[0];

    /* TODAY */
    const { data: todayData } = await supabase
      .from("payments")
      .select("amount, created_at")
      .gte("created_at", todayStr + "T00:00:00.000Z")
      .lte("created_at", todayStr + "T23:59:59.999Z");

    const todayTotal =
      todayData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    /* MONTH */
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: monthData } = await supabase
      .from("payments")
      .select("amount, created_at")
      .gte("created_at", monthStart);

    const monthTotal =
      monthData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    /* YEAR */
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

    const { data: yearData } = await supabase
      .from("payments")
      .select("amount, created_at")
      .gte("created_at", yearStart);

    const yearTotal =
      yearData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    /* CATEGORIES */
    const { data: categoryRows } = await supabase
      .from("payments")
      .select("category");

    const uniqueCategories = new Set(categoryRows?.map((x) => x.category));
    const categoryCount = uniqueCategories.size;

    setStats({
      today: todayTotal,
      month: monthTotal,
      year: yearTotal,
      categories: categoryCount,
    });

    /* LATEST STORY */
    const { data: story } = await supabase
      .from("success_stories")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    setLatestStory(story?.[0] || null);

    /* CATEGORY CHART */
    const counts: any = {};
    categoryRows?.forEach((row) => {
      counts[row.category] = (counts[row.category] || 0) + 1;
    });

    const formatted = Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
    }));

    setCategoryData(formatted);
  }

  return (
    <div className="w-full px-6 py-6">

      {/* ROLE */}
      <div className="flex justify-end text-gray-600 text-sm mb-4">
        {roleLoading ? "Loading role…" : `Role: ${role}`}
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        <div className="p-6 rounded-2xl text-white shadow bg-gradient-to-r from-blue-500 to-blue-700">
          <p className="text-sm opacity-90">Today's Spending</p>
          <p className="text-3xl font-bold">₹{stats.today}</p>
        </div>

        <div className="p-6 rounded-2xl text-white shadow bg-gradient-to-r from-green-500 to-green-700">
          <p className="text-sm opacity-90">This Month</p>
          <p className="text-3xl font-bold">₹{stats.month}</p>
        </div>

        <div className="p-6 rounded-2xl text-white shadow bg-gradient-to-r from-purple-500 to-purple-700">
          <p className="text-sm opacity-90">This Year</p>
          <p className="text-3xl font-bold">₹{stats.year}</p>
        </div>

        <div className="p-6 rounded-2xl text-white shadow bg-gradient-to-r from-orange-500 to-orange-700">
          <p className="text-sm opacity-90">Total Categories</p>
          <p className="text-3xl font-bold">₹{stats.categories}</p>
        </div>
      </div>

      {/* CATEGORY DISTRIBUTION */}
      <div className="bg-white shadow rounded-2xl p-6 mb-10">
        <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>

        <div className="flex justify-center">
          <div className="w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] min-h-[320px]">
            <CategoryChart data={categoryData} />
          </div>
        </div>
      </div>

      {/* LATEST STORY */}
      <div className="bg-white shadow rounded-2xl p-6 mb-20">
        <h3 className="text-lg font-semibold mb-3">Latest Success Story</h3>

        {latestStory ? (
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="font-medium">{latestStory.title}</p>
            <p className="text-sm text-gray-600">
              {new Date(latestStory.created_at).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">No stories available.</p>
        )}
      </div>

    </div>
  );
}