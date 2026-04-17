import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { uploadStoryImages } from "../../lib/uploadStoryImages";

export default function AddStory() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e?: any) {
    if (e) e.preventDefault();

    if (!title || !description) {
      alert("Title and story content are required.");
      return;
    }

    setLoading(true);

    let imagePaths: string[] = [];

    if (images && images.length > 0) {
      imagePaths = await uploadStoryImages(Array.from(images));
    }

    const { error } = await supabase.from("success_stories").insert([
      {
        title,
        description,
        category,
        images: imagePaths,
        likes: 0,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Failed to save story");
    } else {
      navigate("/success-stories");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white rounded-3xl shadow-xl p-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Add Success Story
          </h1>
          <p className="text-gray-500 mt-2">
            Share an impact story that reflects the mission of ZIST.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Story Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter story title"
              className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Story Content
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the full story here..."
              className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Education, Livestock, Medical"
              className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Cover Image
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition">
              <p className="text-gray-500 text-sm mb-3">
                Upload a high-quality image for this story
              </p>
              <input
                type="file"
                multiple
                onChange={(e) => setImages(e.target.files)}
                className="mx-auto"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition transform hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
