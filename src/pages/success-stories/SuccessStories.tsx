import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import { supabase } from "../../lib/supabaseClient";

export default function SuccessStories() {
  const [stories, setStories] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  useEffect(() => {
    loadStories();
  }, []);

  async function loadStories() {
    setLoading(true);

    const { data } =
      await supabase
        .from(
          "success_stories"
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        );

    setStories(
      data || []
    );

    setLoading(false);
  }

  function getImageUrl(
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

  async function handleDelete(
    id: string
  ) {
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

    loadStories();
  }

  const filtered =
    stories.filter(
      (story) => {
        const matchesSearch =
          (
            story.title ||
            ""
          )
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          (
            story.description ||
            ""
          )
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesCategory =
          category
            ? story.category ===
              category
            : true;

        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );

  const featured =
    filtered[0];

  const rest =
    filtered.slice(1);

  const categories =
    Array.from(
      new Set(
        stories
          .map(
            (s) =>
              s.category
          )
          .filter(
            Boolean
          )
      )
    );

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-500 font-medium">
        Loading
        stories...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl text-white p-6 md:p-8 shadow-xl mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>
              <h1 className="text-3xl md:text-5xl font-bold">
                Success
                Stories
              </h1>

              <p className="text-blue-100 mt-2 max-w-2xl text-sm md:text-base">
                Real impact,
                transformed
                lives and
                stories of
                hope through
                ZIST support.
              </p>
            </div>

            <Link
              to="/success-stories/add"
              className="px-6 py-3 bg-white text-blue-700 rounded-2xl font-semibold shadow hover:scale-[1.02] transition w-full sm:w-auto text-center"
            >
              + Add Story
            </Link>

          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow p-4 md:p-5 mb-6 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            <input
              type="text"
              placeholder="Search stories..."
              value={
                search
              }
              onChange={(
                e
              ) =>
                setSearch(
                  e.target
                    .value
                )
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={
                category
              }
              onChange={(
                e
              ) =>
                setCategory(
                  e.target
                    .value
                )
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="">
                All
                Categories
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

            <button
              onClick={() => {
                setSearch(
                  ""
                );
                setCategory(
                  ""
                );
              }}
              className="rounded-2xl bg-slate-100 hover:bg-slate-200 px-4 py-3 font-medium"
            >
              Reset
            </button>

          </div>
        </div>

        {/* Featured Story */}
        {featured && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 mb-8">

            {featured.images?.[0] && (
              <img
                src={getImageUrl(
                  featured
                    .images[0]
                )}
                alt={
                  featured.title
                }
                className="w-full h-[240px] md:h-[420px] object-cover"
              />
            )}

            <div className="p-5 md:p-8">
              <div className="flex flex-col lg:flex-row lg:justify-between gap-4">

                <div>
                  <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold">
                    Featured
                    Story
                  </p>

                  <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mt-2">
                    {
                      featured.title
                    }
                  </h2>

                  <p className="text-sm text-slate-500 mt-2">
                    {new Date(
                      featured.created_at
                    ).toLocaleDateString()}
                    {" • "}
                    {featured.category ||
                      "General"}
                  </p>
                </div>

                <div className="text-pink-600 font-semibold text-lg">
                  ❤️{" "}
                  {featured.likes ||
                    0}
                </div>
              </div>

              <p className="text-slate-600 mt-5 leading-relaxed line-clamp-4">
                {
                  featured.description
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">

                <Link
                  to={`/success-stories/view/${featured.id}`}
                  className="px-5 py-3 rounded-2xl bg-blue-600 text-white text-center hover:bg-blue-700"
                >
                  View Story
                </Link>

                <Link
                  to={`/success-stories/edit/${featured.id}`}
                  className="px-5 py-3 rounded-2xl bg-emerald-600 text-white text-center hover:bg-emerald-700"
                >
                  Edit
                </Link>

                <button
                  onClick={() =>
                    handleDelete(
                      featured.id
                    )
                  }
                  className="px-5 py-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>

              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {rest.length ===
        0 ? (
          <div className="bg-white rounded-3xl shadow p-10 text-center text-slate-500">
            No stories
            found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {rest.map(
              (
                story
              ) => (
                <div
                  key={
                    story.id
                  }
                  className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl transition border border-slate-100"
                >

                  {story
                    .images?.[0] && (
                    <img
                      src={getImageUrl(
                        story
                          .images[0]
                      )}
                      alt={
                        story.title
                      }
                      className="w-full h-56 object-cover"
                    />
                  )}

                  <div className="p-5">

                    <div className="flex justify-between items-start gap-3">
                      <h3 className="font-bold text-lg text-slate-800 line-clamp-2">
                        {
                          story.title
                        }
                      </h3>

                      <span className="text-pink-600 text-sm font-semibold">
                        ❤️{" "}
                        {story.likes ||
                          0}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(
                        story.created_at
                      ).toLocaleDateString()}
                      {" • "}
                      {story.category ||
                        "General"}
                    </p>

                    <p className="text-sm text-slate-600 mt-4 line-clamp-3">
                      {
                        story.description
                      }
                    </p>

                    <div className="grid grid-cols-3 gap-2 mt-5">

                      <Link
                        to={`/success-stories/view/${story.id}`}
                        className="text-center px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm"
                      >
                        View
                      </Link>

                      <Link
                        to={`/success-stories/edit/${story.id}`}
                        className="text-center px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() =>
                          handleDelete(
                            story.id
                          )
                        }
                        className="px-3 py-2 rounded-xl bg-red-50 text-red-700 text-sm"
                      >
                        Delete
                      </button>

                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

      </div>
    </div>
  );
}