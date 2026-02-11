import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SuccessStoriesAnalytics() {
  const [totalStories, setTotalStories] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [topStory, setTopStory] = useState<any>(null);
  const [topTags, setTopTags] = useState<{ tag: string; count: number }[]>([]);
  const [recentStories, setRecentStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);

    // 1) TOTAL STORIES
    const { count: storyCount } = await supabase
      .from("success_stories")
      .select("*", { count: "exact", head: true });

    setTotalStories(storyCount || 0);

    // 2) TOTAL LIKES
    const { count: likesCount } = await supabase
      .from("story_likes")
      .select("*", { count: "exact", head: true });

    setTotalLikes(likesCount || 0);

    // 3) MOST LIKED STORY
    const { data: likeAgg } = await supabase
      .rpc("story_like_ranking"); // custom RPC below

    if (likeAgg && likeAgg.length > 0) {
      setTopStory(likeAgg[0]);
    }

    // 4) TAG USAGE
    const { data: allStories } = await supabase
      .from("success_stories")
      .select("tags");

    const tagCountMap: Record<string, number> = {};

    allStories?.forEach((row) => {
      row.tags?.forEach((tag: string) => {
        tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
      });
    });

    const tagArray = Object.entries(tagCountMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setTopTags(tagArray);

    // 5) RECENT 5 STORIES
    const { data: recent } = await supabase
      .from("success_stories")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentStories(recent || []);

    setLoading(false);
  }

  if (loading) return <p className="p-4">Loading analytics...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

      {/* TOTAL STORIES */}
      <div className="p-5 bg-white shadow rounded-xl">
        <h2 className="text-xl font-bold mb-2">Total Stories</h2>
        <p className="text-4xl font-bold text-blue-600">{totalStories}</p>
      </div>

      {/* TOTAL LIKES */}
      <div className="p-5 bg-white shadow rounded-xl">
        <h2 className="text-xl font-bold mb-2">Total Likes</h2>
        <p className="text-4xl font-bold text-red-600">{totalLikes}</p>
      </div>

      {/* MOST LIKED STORY */}
      <div className="p-5 bg-white shadow rounded-xl md:col-span-2">
        <h2 className="text-xl font-bold mb-3">Most Liked Story</h2>

        {topStory ? (
          <div>
            <p className="font-semibold text-lg">{topStory.title}</p>
            <p className="text-gray-600">❤️ {topStory.like_count} likes</p>
          </div>
        ) : (
          <p>No likes yet.</p>
        )}
      </div>

      {/* TAG USAGE */}
      <div className="p-5 bg-white shadow rounded-xl">
        <h2 className="text-xl font-bold mb-3">Top Tags</h2>
        <div className="flex flex-wrap gap-2">
          {topTags.map((t, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
            >
              #{t.tag} ({t.count})
            </span>
          ))}
          {topTags.length === 0 && <p>No tags yet.</p>}
        </div>
      </div>

      {/* RECENT STORIES */}
      <div className="p-5 bg-white shadow rounded-xl">
        <h2 className="text-xl font-bold mb-3">Recent Stories</h2>
        <ul className="space-y-2">
          {recentStories.map((s) => (
            <li key={s.id} className="border-b pb-1">
              {s.title}
              <span className="text-xs text-gray-500 block">
                {new Date(s.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
