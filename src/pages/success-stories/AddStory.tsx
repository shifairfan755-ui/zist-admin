import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { uploadStoryImages } from "../../lib/uploadStoryImages";

export default function AddStory() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState<FileList | null>(null);

  async function handleSubmit(e: any) {
    e.preventDefault();

    let imagePaths: string[] = [];

    if (images) {
      imagePaths = await uploadStoryImages(Array.from(images));
    }

    const { error } = await supabase.from("success_stories").insert([
      {
        title,
        description,
        tags,
        images: imagePaths, // store ONLY internal paths
        likes: 0,
      },
    ]);

    if (error) alert("Failed to save story");
    else navigate("/success-stories");
  }

  return (
    <div className="bg-white p-8 shadow rounded-2xl max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Story</h1>

      <form onSubmit={handleSubmit}>
        <input
          className="w-full border p-3 rounded mb-4"
          placeholder="Story Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          className="w-full border p-3 rounded mb-4 h-32"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* TAGS */}
        <div className="flex gap-2 mb-4">
          <input
            className="border p-2 rounded w-full"
            placeholder="Add tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              if (tagInput.trim()) {
                setTags([...tags, tagInput.trim()]);
                setTagInput("");
              }
            }}
            className="px-4 bg-blue-600 text-white rounded"
          >
            Add
          </button>
        </div>

        {/* TAG LIST */}
        <div className="flex gap-2 flex-wrap mb-4">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>

        <input
          type="file"
          multiple
          onChange={(e) => setImages(e.target.files)}
          className="mb-6"
        />

        <button className="px-6 py-3 bg-green-600 text-white rounded">
          Save Story
        </button>
      </form>
    </div>
  );
}
