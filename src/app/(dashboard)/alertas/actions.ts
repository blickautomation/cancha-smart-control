"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function marcarAlertaVista(id: string) {
  const supabase = await createClient();
  await supabase.from("alertas").update({ vista: true }).eq("id", id);
  revalidatePath("/alertas");
  revalidatePath("/");
}
