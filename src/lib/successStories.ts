import { supabase } from "./supabaseClient";

export interface SuccessStory {
  id?: string;
  title: string;
  story: string;
  image_url?: string | null;
  beneficiary_id?: string | null;
  created_by?: string | null;
}

export async function getStories() {
  return await supabase
    .from("success_stories")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function getStory(id: string) {
  return await supabase
    .from("success_stories")
    .select("*")
    .eq("id", id)
    .single();
}

export async function addStory(data: SuccessStory) {
  return await supabase.from("success_stories").insert([data]);
}

export async function updateStory(id: string, data: Partial<SuccessStory>) {
  return await supabase
    .from("success_stories")
    .update(data)
    .eq("id", id);
}

export async function deleteStory(id: string) {
  return await supabase
    .from("success_stories")
    .delete()
    .eq("id", id);
}
