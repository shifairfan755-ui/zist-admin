import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { uploadStoryImages } from "../../lib/uploadStoryImages";

export default function AddStory() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [category, setCategory] =
    useState("");
  const [images, setImages] =
    useState<FileList | null>(null);

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    e?: any
  ) {
    if (e) e.preventDefault();

    if (!title || !description) {
      alert(
        "Title and story content are required."
      );
      return;
    }

    setLoading(true);

    let imagePaths: string[] = [];

    try {
      if (
        images &&
        images.length > 0
      ) {
        imagePaths =
          await uploadStoryImages(
            Array.from(images)
          );
      }

      const { error } =
        await supabase
          .from(
            "success_stories"
          )
          .insert([
            {
              title,
              description,
              category,
              images:
                imagePaths,
              likes: 0,
            },
          ]);

      if (error) {
        console.error(
          error
        );
        alert(
          "Failed to save story"
        );
        setLoading(
          false
        );
        return;
      }

      navigate(
        "/success-stories"
      );
    } catch (err) {
      console.error(err);
      alert(
        "Something went wrong"
      );
    }

    setLoading(false);
  }

  const categories = [
    "Education",
    "Medical",
    "Livelihood",
    "Livestock",
    "Soft Loan",
    "Monthly Support",
    "Women Empowerment",
    "Youth Support",
    "Emergency Help",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() =>
              navigate(-1)
            }
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            ← Back
          </button>

          <div className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl text-white p-6 md:p-8 shadow-xl">
            <h1 className="text-2xl md:text-4xl font-bold">
              Add Success Story
            </h1>

            <p className="text-blue-100 mt-2 text-sm md:text-base max-w-2xl">
              Showcase real impact,
              beneficiary transformation,
              and the mission of ZIST.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Top strip */}
          <div className="px-6 md:px-8 py-5 border-b bg-slate-50">
            <h2 className="text-lg md:text-xl font-semibold text-slate-800">
              Story Information
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Fill all important details
              before publishing.
            </p>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="p-4 md:p-8 space-y-6"
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Story Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                placeholder="Enter story title"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category + Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category
                </label>

                <select
                  value={
                    category
                  }
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {
                          item
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Upload Images
                </label>

                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setImages(
                      e.target
                        .files
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 file:mr-3 file:border-0 file:bg-blue-50 file:text-blue-700 file:px-4 file:py-2 file:rounded-xl"
                />

                {images &&
                  images.length >
                    0 && (
                    <p className="text-xs text-slate-500 mt-2">
                      {
                        images.length
                      }{" "}
                      file(s)
                      selected
                    </p>
                  )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Story Content
              </label>

              <textarea
                rows={8}
                value={
                  description
                }
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Write full beneficiary story, transformation, support received, and results..."
                className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none resize-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Preview Card */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-3">
                Quick Preview
              </h3>

              <p className="font-bold text-lg text-slate-900">
                {title ||
                  "Story Title"}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                {category ||
                  "Category"}
              </p>

              <p className="text-sm text-slate-600 mt-3 line-clamp-3">
                {description ||
                  "Your story preview will appear here..."}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  navigate(-1)
                }
                className="w-full md:w-auto px-6 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  loading
                }
                className="w-full md:w-auto px-8 py-3 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {loading
                  ? "Saving..."
                  : "Save Story"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}