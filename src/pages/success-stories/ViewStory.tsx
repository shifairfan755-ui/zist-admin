import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

function getPublicUrl(path: string) {
  return supabase.storage.from("story-images").getPublicUrl(path).data.publicUrl;
}

export default function ViewStory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState<any>(null);
  const [likes, setLikes] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    loadStory();
  }, []);

  async function loadStory() {
    const { data } = await supabase
      .from("success_stories")
      .select("*")
      .eq("id", id)
      .single();

    setStory(data);
    setLikes(data.likes || 0);
    setLoading(false);
  }

  async function handleLike() {
    const newLikes = likes + 1;

    const { error } = await supabase
      .from("success_stories")
      .update({ likes: newLikes })
      .eq("id", story.id);

    if (!error) setLikes(newLikes);
  }

  async function handleDelete() {
    if (!confirm("Are you sure?")) return;
    await supabase.from("success_stories").delete().eq("id", id);
    navigate("/success-stories");
  }

  if (loading) return <div className="p-10 text-center">Loading…</div>;

  return (
    <div className="flex justify-center mt-10 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-4xl">

        {/* TITLE */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{story.title}</h1>

          <div className="flex gap-4">
            <Link
              to={`/success-stories/edit/${story.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Edit
            </Link>

            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Delete
            </button>
          </div>
        </div>

        <p className="text-gray-500 mt-1">
          {new Date(story.created_at).toLocaleDateString()}
        </p>

        {/* TAGS */}
        <div className="mt-3 flex gap-2">
          {story.tags?.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* IMAGE SLIDER */}
        {story.images?.length > 0 && (
          <div className="mt-6 flex flex-col items-center">
            <img
              src={getPublicUrl(story.images[currentImage])}
              className="rounded-xl shadow-md max-h-[380px] object-cover"
              style={{ width: "100%", maxWidth: "700px" }}
            />

            <div className="flex gap-3 mt-4 overflow-x-auto">
              {story.images.map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={getPublicUrl(img)}
                  onClick={() => setCurrentImage(idx)}
                  className={`h-20 w-20 object-cover rounded-xl cursor-pointer border-2 ${
                    currentImage === idx ? "border-blue-600" : "border-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* DESCRIPTION */}
        <p className="mt-6 text-gray-700 text-lg leading-relaxed whitespace-pre-line">
          {story.description}
        </p>

        {/* LIKE */}
        <button
          onClick={handleLike}
          className="mt-6 px-4 py-2 bg-pink-600 text-white rounded"
        >
          ❤️ Like ({likes})
        </button>
      </div>
    </div>
  );
}
