import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../../lib/supabaseClient";

function getPublicUrl(
  path: string
) {
  if (!path)
    return "";

  if (
    path.startsWith(
      "http"
    )
  )
    return path;

  return supabase.storage
    .from(
      "story-images"
    )
    .getPublicUrl(
      path
    ).data.publicUrl;
}

export default function ViewStory() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [story, setStory] =
    useState<any>(null);

  const [likes, setLikes] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [liked, setLiked] =
    useState(false);

  const [activeImage, setActiveImage] =
    useState(0);

  useEffect(() => {
    loadStory();
  }, []);

  async function loadStory() {
    const { data } =
      await supabase
        .from(
          "success_stories"
        )
        .select("*")
        .eq("id", id)
        .single();

    if (!data) {
      navigate(
        "/success-stories"
      );
      return;
    }

    setStory(data);
    setLikes(
      data.likes || 0
    );
    setLoading(false);
  }

  async function handleLike() {
    if (
      liked ||
      !story
    )
      return;

    const newLikes =
      likes + 1;

    await supabase
      .from(
        "success_stories"
      )
      .update({
        likes:
          newLikes,
      })
      .eq(
        "id",
        story.id
      );

    setLikes(
      newLikes
    );
    setLiked(true);
  }

  async function handleDelete() {
    const yes =
      confirm(
        "Delete this story?"
      );

    if (!yes)
      return;

    await supabase
      .from(
        "success_stories"
      )
      .delete()
      .eq("id", id);

    navigate(
      "/success-stories"
    );
  }

  async function handleShare() {
    const url =
      window.location.href;

    try {
      if (
        navigator.share
      ) {
        await navigator.share(
          {
            title:
              story.title,
            text:
              story.description,
            url,
          }
        );
      } else {
        await navigator.clipboard.writeText(
          url
        );
        alert(
          "Link copied!"
        );
      }
    } catch {
      //
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  const images =
    story.images ||
    [];

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <button
          onClick={() =>
            navigate(-1)
          }
          className="text-blue-600 text-sm font-medium hover:underline mb-5"
        >
          ← Back to
          Stories
        </button>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">

          {/* Hero */}
          {images.length >
            0 && (
            <div className="relative">
              <img
                src={getPublicUrl(
                  images[
                    activeImage
                  ]
                )}
                alt={
                  story.title
                }
                className="w-full h-[240px] md:h-[520px] object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 text-white">
                <p className="text-xs uppercase tracking-widest text-blue-200 font-semibold">
                  Success
                  Story
                </p>

                <h1 className="text-2xl md:text-5xl font-bold mt-2 max-w-4xl leading-tight">
                  {
                    story.title
                  }
                </h1>

                <div className="flex flex-wrap gap-3 mt-4 text-sm text-white/90">
                  <span>
                    📅{" "}
                    {new Date(
                      story.created_at
                    ).toLocaleDateString()}
                  </span>

                  {story.category && (
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      #
                      {
                        story.category
                      }
                    </span>
                  )}

                  <span>
                    ❤️{" "}
                    {likes}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Thumbnails */}
          {images.length >
            1 && (
            <div className="p-4 border-b bg-slate-50">
              <div className="flex gap-3 overflow-x-auto">
                {images.map(
                  (
                    img: string,
                    index: number
                  ) => (
                    <button
                      key={
                        index
                      }
                      onClick={() =>
                        setActiveImage(
                          index
                        )
                      }
                      className={`min-w-[90px] h-20 rounded-2xl overflow-hidden border-2 ${
                        activeImage ===
                        index
                          ? "border-blue-600"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={getPublicUrl(
                          img
                        )}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-5 md:p-10">

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:justify-between gap-3 mb-8">

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={
                    handleLike
                  }
                  disabled={
                    liked
                  }
                  className="px-5 py-3 rounded-2xl bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-60"
                >
                  ❤️ Like (
                  {likes})
                </button>

                <button
                  onClick={
                    handleShare
                  }
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200"
                >
                  Share
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    navigate(
                      `/success-stories/edit/${story.id}`
                    )
                  }
                  className="px-5 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  Edit
                </button>

                <button
                  onClick={
                    handleDelete
                  }
                  className="px-5 py-3 rounded-2xl bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>

            </div>

            {/* Story Body */}
            <div className="prose prose-slate max-w-none">
              <div className="text-slate-700 text-base md:text-lg leading-8 whitespace-pre-line">
                {
                  story.description
                }
              </div>
            </div>

            {/* Footer Card */}
            <div className="mt-10 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6">
              <h3 className="font-bold text-slate-800 text-lg">
                Impact
                Matters
              </h3>

              <p className="text-slate-600 mt-2 leading-relaxed">
                Every story
                represents
                real support,
                dignity and
                transformation
                made possible
                through ZIST
                initiatives.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}