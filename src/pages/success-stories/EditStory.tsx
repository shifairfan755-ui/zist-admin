import {
  useState,
  useEffect,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../../lib/supabaseClient";

export default function EditStory() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [story, setStory] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    imagesToAdd,
    setImagesToAdd,
  ] =
    useState<FileList | null>(
      null
    );

  useEffect(() => {
    loadStory();
  }, []);

  async function loadStory() {
    const { data, error } =
      await supabase
        .from(
          "success_stories"
        )
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
      alert(
        "Story not found"
      );
      navigate(
        "/success-stories"
      );
      return;
    }

    setStory({
      ...data,
      images:
        data.images ||
        [],
      category:
        data.category ||
        "",
    });

    setLoading(false);
  }

  async function uploadImages() {
    if (
      !imagesToAdd ||
      imagesToAdd.length ===
        0
    )
      return [];

    const urls: string[] =
      [];

    for (const file of Array.from(
      imagesToAdd
    )) {
      const fileName = `${Date.now()}-${
        file.name
      }`;

      const {
        error,
      } =
        await supabase.storage
          .from(
            "story-images"
          )
          .upload(
            fileName,
            file
          );

      if (error)
        continue;

      const publicUrl =
        supabase.storage
          .from(
            "story-images"
          )
          .getPublicUrl(
            fileName
          ).data
          .publicUrl;

      urls.push(
        publicUrl
      );
    }

    return urls;
  }

  async function save() {
    if (
      !story.title ||
      !story.description
    ) {
      alert(
        "Title and content are required."
      );
      return;
    }

    setSaving(true);

    const uploaded =
      await uploadImages();

    const updatedImages =
      [
        ...story.images,
        ...uploaded,
      ];

    const { error } =
      await supabase
        .from(
          "success_stories"
        )
        .update({
          title:
            story.title,
          description:
            story.description,
          category:
            story.category,
          images:
            updatedImages,
        })
        .eq("id", id);

    setSaving(false);

    if (error) {
      alert(
        "Failed to update story"
      );
      return;
    }

    navigate(
      `/success-stories/view/${id}`
    );
  }

  function removeImage(
    url: string
  ) {
    const updated =
      story.images.filter(
        (
          img: string
        ) =>
          img !==
          url
      );

    setStory({
      ...story,
      images:
        updated,
    });
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

  if (loading) {
    return (
      <div className="p-8 text-center font-semibold">
        Loading...
      </div>
    );
  }

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

          <div className="mt-4 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl text-white p-6 md:p-8 shadow-xl">
            <h1 className="text-2xl md:text-4xl font-bold">
              Edit Success
              Story
            </h1>

            <p className="text-emerald-100 mt-2 text-sm md:text-base">
              Update story
              details, images
              and category.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Top */}
          <div className="px-6 md:px-8 py-5 border-b bg-slate-50">
            <h2 className="text-lg md:text-xl font-semibold text-slate-800">
              Story Details
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Edit and keep
              impact stories
              fresh.
            </p>
          </div>

          <div className="p-4 md:p-8 space-y-6">

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Story Title
              </label>

              <input
                value={
                  story.title
                }
                onChange={(
                  e
                ) =>
                  setStory(
                    {
                      ...story,
                      title:
                        e
                          .target
                          .value,
                    }
                  )
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category
              </label>

              <select
                value={
                  story.category
                }
                onChange={(
                  e
                ) =>
                  setStory(
                    {
                      ...story,
                      category:
                        e
                          .target
                          .value,
                    }
                  )
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">
                  Select
                  Category
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

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Story Content
              </label>

              <textarea
                rows={8}
                value={
                  story.description
                }
                onChange={(
                  e
                ) =>
                  setStory(
                    {
                      ...story,
                      description:
                        e
                          .target
                          .value,
                    }
                  )
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none resize-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Add More
                Images
              </label>

              <input
                type="file"
                multiple
                onChange={(
                  e
                ) =>
                  setImagesToAdd(
                    e.target
                      .files
                  )
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 file:mr-3 file:border-0 file:bg-emerald-50 file:text-emerald-700 file:px-4 file:py-2 file:rounded-xl"
              />
            </div>

            {/* Existing Images */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Existing
                Images
              </label>

              {story.images
                .length ===
              0 ? (
                <div className="text-sm text-slate-500 bg-slate-50 rounded-2xl p-4">
                  No images
                  uploaded.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {story.images.map(
                    (
                      img: string,
                      i: number
                    ) => (
                      <div
                        key={
                          i
                        }
                        className="relative group"
                      >
                        <img
                          src={
                            img
                          }
                          className="h-32 w-full object-cover rounded-2xl border"
                        />

                        <button
                          onClick={() =>
                            removeImage(
                              img
                            )
                          }
                          type="button"
                          className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800">
                Preview
              </h3>

              <p className="font-bold text-lg mt-2">
                {
                  story.title
                }
              </p>

              <p className="text-sm text-slate-500 mt-1">
                {
                  story.category
                }
              </p>

              <p className="text-sm text-slate-600 mt-3 line-clamp-3">
                {
                  story.description
                }
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse md:flex-row justify-end gap-3">
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
                onClick={save}
                disabled={
                  saving
                }
                className="w-full md:w-auto px-8 py-3 rounded-2xl bg-emerald-600 text-white font-semibold shadow-lg hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}