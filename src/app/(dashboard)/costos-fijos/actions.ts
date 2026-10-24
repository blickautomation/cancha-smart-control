"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function crearCostoFijo(formData: FormData) {
  const supabase = await createClient();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const moneda = String(formData.get("moneda"));
  const monto = Number(formData.get("monto"));
  const periodicidad = String(formData.get("periodicidad"));
  const prorratear = formData.get("prorratear") === "on";
  if (!nombre || !monto) return;

  await supabase.from("costos_fijos").insert({
    nombre,
    moneda,
    monto,
    periodicidad,
    prorratear,
    fecha_pago: new Date().toISOString().slice(0, 10),
  });
  revalidatePath("/costos-fijos");
}

export async function alternarActivoCostoFijo(id: string, activo: boolean) {
  const supabase = await createClient();
  await supabase.from("costos_fijos").update({ activo }).eq("id", id);
  revalidatePath("/costos-fijos");
}
