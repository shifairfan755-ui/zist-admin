import { useEffect, useState } from "react";
import { getStory } from "../lib/successStories";
import { useParams } from "react-router-dom";

interface Story {
  id: string;
  title: string;
  story: string;
  image_url?: string;
  created_at?: string;
}

export default function ViewStory() {
  const { id } = useParams();
  const [storyData, setStoryData] = useState<Story | null>(null);

  useEffect(() => {
    loadStory();
  }, []);

  async function loadStory() {
    const { data } = await getStory(id as string);
    setStoryData(data || null);
  }

  if (!storyData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">{storyData.title}</h1>

      {storyData.image_url && (
        <img
          src={storyData.image_url}
          alt={storyData.title}
          className="rounded shadow mb-6"
        />
      )}

      <p className="text-lg leading-relaxed whitespace-pre-wrap">
        {storyData.story}
      </p>

      {storyData.created_at && (
        <p className="text-gray-500 text-sm mt-4">
          Created on: {storyData.created_at.substring(0, 10)}
        </p>
      )}
    </div>
  );
}
