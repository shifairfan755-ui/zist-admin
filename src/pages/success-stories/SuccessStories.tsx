import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function SuccessStories() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  async function loadStories() {
    const { data } = await supabase
      .from("success_stories")
      .select("*")
      .order("created_at", { ascending: false });

    setStories(data || []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this story?")) return;

    await supabase.from("success_stories").delete().eq("id", id);
    loadStories();
  }

  if (loading) return <div className="p-10">Loading…</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Success Stories</h1>

        <Link
          to="/success-stories/add"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Story
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div
            key={story.id}
            className="bg-white shadow rounded-2xl p-4 hover:shadow-lg transition"
          >
            {/* Thumbnail */}
            <img
              src={story.images?.[0]}
              className="w-full h-48 rounded-xl object-cover"
            />

            <h2 className="mt-4 font-bold text-xl">{story.title}</h2>

            {/* Tags */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {story.tags?.map((tag: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <p className="text-gray-500 text-sm mt-2">
              {new Date(story.created_at).toLocaleDateString()}
            </p>

            <p className="text-gray-700 mt-2 line-clamp-2">{story.description}</p>

            {/* Actions */}
            <div className="flex justify-between mt-4">
              <Link
                to={`/success-stories/view/${story.id}`}
                className="text-blue-600 hover:underline"
              >
                View
              </Link>

              <Link
                to={`/success-stories/edit/${story.id}`}
                className="text-green-600 hover:underline"
              >
                Edit
              </Link>

              <button
                onClick={() => handleDelete(story.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>

            {/* Likes */}
            <p className="mt-2 text-sm text-pink-600 font-medium">
              ❤️ {story.likes || 0} likes
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
