import { Tables, TablesInsert, TablesUpdate } from "@/supabase/types"

import { supabase } from "@/lib/supabase/browser-client"

export async function upsertUserQuestion(
  question: TablesInsert<"user_questions">
) {
  await supabase
    .from("user_questions")
    .upsert(question, { onConflict: "user_id" })
    .select("*")
}
