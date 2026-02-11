import { supabase } from "./supabaseClient";

export async function uploadStoryImages(files: File[]) {
  const paths: string[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()}.${ext}`;
    const filePath = `story-images/${fileName}`;

    const { error } = await supabase.storage
      .from("story-images")
      .upload(filePath, file);

    if (error) {
      console.error("Upload failed:", error);
      continue;
    }

    // Store ONLY internal file path (Option A)
    paths.push(filePath);
  }

  return paths;
}
