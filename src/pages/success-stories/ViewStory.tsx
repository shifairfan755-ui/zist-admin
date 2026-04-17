import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

function getPublicUrl(path: string) {
  return supabase.storage
    .from("story-images")
    .getPublicUrl(path).data.publicUrl;
}

export default function ViewStory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState<any>(null);
  const [likes, setLikes] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStory();
  }, []);

  async function loadStory() {
    const { data } = await supabase
      .from("success_stories")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setStory(data);
      setLikes(data.likes || 0);
    }

    setLoading(false);
  }

  async function handleLike() {
    const newLikes = likes + 1;

    await supabase
      .from("success_stories")
      .update({ likes: newLikes })
      .eq("id", story.id);

    setLikes(newLikes);
  }

  async function handleDelete() {
    if (!confirm("Delete this story?")) return;

    await supabase
      .from("success_stories")
      .delete()
      .eq("id", id);

    navigate("/success-stories");
  }

  if (loading)
    return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">

      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 hover:underline mb-6"
      >
        ← Back to Stories
      </button>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* HERO IMAGE */}
        {story.images?.length > 0 && (
          <div className="relative">
            <img
              src={getPublicUrl(story.images[0])}
              alt={story.title}
              className="w-full h-[420px] object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}

        <div className="p-12">

          {/* HEADER */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                {story.title}
              </h1>

              <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                <span>
                  📅 {new Date(story.created_at).toLocaleDateString()}
                </span>

                {story.category && (
                  <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full">
                    #{story.category}
                  </span>
                )}

                <span className="text-pink-600 font-medium">
                  ❤️ {likes} Likes
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/success-stories/edit/${story.id}`)}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                Edit
              </button>

              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-200 my-8"></div>

          {/* STORY CONTENT */}
          <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
            {story.description}
          </div>

          {/* LIKE BUTTON */}
          <div className="mt-10">
            <button
              onClick={handleLike}
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full shadow-lg transition transform hover:scale-105"
            >
              ❤️ Like ({likes})
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
