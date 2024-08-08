import { supabase } from "@/lib/supabase/browser-client"
import { Tables, TablesInsert, TablesUpdate } from "@/supabase/types"

export async function upsertUserQuestion(
  question: TablesInsert<"user_questions">
) {
  await supabase
    .from("user_questions")
    .upsert(question, { onConflict: "user_id" })
    .select("*")
}
