import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function EditStory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [imagesToAdd, setImagesToAdd] = useState<FileList | null>(null);

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
    setLoading(false);
  }

  async function uploadImages() {
    if (!imagesToAdd) return [];

    const urls: string[] = [];

    for (const file of Array.from(imagesToAdd)) {
      const fileName = `${Date.now()}-${file.name}`;

      const { data } = await supabase.storage
        .from("success-stories")
        .upload(fileName, file);

      const publicUrl = supabase.storage
        .from("success-stories")
        .getPublicUrl(fileName).data.publicUrl;

      urls.push(publicUrl);
    }
    return urls;
  }

  async function save() {
    const uploaded = await uploadImages();

    const updatedImages = [...story.images, ...uploaded];

    await supabase
      .from("success_stories")
      .update({
        title: story.title,
        description: story.description,
        tags: story.tags,
        images: updatedImages,
      })
      .eq("id", id);

    navigate(`/success-stories/view/${id}`);
  }

  async function removeImage(url: string) {
    const updated = story.images.filter((img: string) => img !== url);

    setStory({ ...story, images: updated });
  }

  if (loading) return <div className="p-10">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow rounded-xl">
      <h1 className="text-2xl font-bold mb-6">Edit Story</h1>

      {/* Title */}
      <input
        className="w-full border p-3 rounded mb-4"
        value={story.title}
        onChange={(e) => setStory({ ...story, title: e.target.value })}
      />

      {/* Description */}
      <textarea
        className="w-full border p-3 rounded mb-4 h-32"
        value={story.description}
        onChange={(e) => setStory({ ...story, description: e.target.value })}
      />

      {/* Tags */}
      <div className="flex gap-2 flex-wrap mb-4">
        {story.tags.map((tag: string, i: number) => (
          <span
            key={i}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Add Images */}
      <input
        type="file"
        multiple
        onChange={(e) => setImagesToAdd(e.target.files)}
        className="mb-4"
      />

      {/* Existing Images */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {story.images.map((img: string, i: number) => (
          <div key={i} className="relative">
            <img src={img} className="h-28 w-full rounded object-cover" />
            <button
              onClick={() => removeImage(img)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded px-2"
            >
              X
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={save}
        className="px-6 py-3 bg-green-600 text-white rounded"
      >
        Save Changes
      </button>
    </div>
  );
}
