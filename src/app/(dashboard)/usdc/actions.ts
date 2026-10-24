"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function crearConversionUsdc(formData: FormData) {
  const supabase = await createClient();
  const fecha = String(formData.get("fecha"));
  const pesos_entregados = Number(formData.get("pesos_entregados"));
  const usdc_recibidos = Number(formData.get("usdc_recibidos"));
  const notas = String(formData.get("notas") ?? "").trim() || null;
  if (!fecha || !pesos_entregados || !usdc_recibidos) return;

  await supabase
    .from("conversiones_usdc")
    .insert({ fecha, pesos_entregados, usdc_recibidos, notas });

  revalidatePath("/usdc");
}
