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

  function getImageUrl(path: string) {
    if (!path) return "";
    return supabase.storage
      .from("story-images")
      .getPublicUrl(path).data.publicUrl;
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this story?")) return;
    await supabase.from("success_stories").delete().eq("id", id);
    loadStories();
  }

  if (loading)
    return <div className="p-10 text-gray-500">Loading stories...</div>;

  const featured = stories[0];
  const rest = stories.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">

      {/* ===== PAGE HEADER ===== */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold text-gray-800 tracking-tight">
          Success Stories
        </h1>

        <Link
          to="/success-stories/add"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
        >
          + Add Story
        </Link>
      </div>

      {/* ===== FEATURED STORY ===== */}
      {featured && (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

          {featured.images?.[0] && (
            <img
              src={getImageUrl(featured.images[0])}
              alt={featured.title}
              className="w-full h-[420px] object-cover"
            />
          )}

          <div className="p-10 space-y-5">
            <h2 className="text-3xl font-semibold text-gray-800">
              {featured.title}
            </h2>

            <p className="text-gray-500 text-sm">
              {new Date(featured.created_at).toLocaleDateString()}
            </p>

            <p className="text-gray-700 text-lg leading-relaxed line-clamp-3">
              {featured.description}
            </p>

            <div className="flex justify-between items-center pt-4">

              <span className="text-pink-600 font-medium">
                ❤️ {featured.likes || 0}
              </span>

              <div className="flex gap-3">

                <Link
                  to={`/success-stories/view/${featured.id}`}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  View
                </Link>

                <Link
                  to={`/success-stories/edit/${featured.id}`}
                  className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                >
                  Edit
                </Link>

                <button
                  onClick={() => handleDelete(featured.id)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Delete
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== STORY GRID ===== */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rest.map((story) => (
          <div
            key={story.id}
            className="bg-white rounded-3xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100"
          >

            {story.images?.[0] && (
              <img
                src={getImageUrl(story.images[0])}
                alt={story.title}
                className="w-full h-56 object-cover"
              />
            )}

            <div className="p-6 space-y-3">

              <h3 className="text-xl font-semibold text-gray-800">
                {story.title}
              </h3>

              <p className="text-gray-500 text-sm">
                {new Date(story.created_at).toLocaleDateString()}
              </p>

              <p className="text-gray-600 text-sm line-clamp-2">
                {story.description}
              </p>

              <div className="flex justify-between items-center pt-4">

                <span className="text-pink-600 text-sm font-medium">
                  ❤️ {story.likes || 0}
                </span>

                <div className="flex gap-2">

                  <Link
                    to={`/success-stories/view/${story.id}`}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm"
                  >
                    View
                  </Link>

                  <Link
                    to={`/success-stories/edit/${story.id}`}
                    className="px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg text-sm"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(story.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                  >
                    Delete
                  </button>

                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
