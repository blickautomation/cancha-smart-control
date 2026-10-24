"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function crearModeloPrecio(formData: FormData) {
  const supabase = await createClient();
  const proveedor = String(formData.get("proveedor"));
  const modelo = String(formData.get("modelo") ?? "").trim();
  if (!modelo) return;

  const num = (name: string) => {
    const v = formData.get(name);
    return v === null || v === "" ? null : Number(v);
  };

  await supabase.from("modelos_precios").insert({
    proveedor,
    modelo,
    vigente_desde: new Date().toISOString().slice(0, 10),
    precio_input_usd_mtok: num("precio_input_usd_mtok"),
    precio_output_usd_mtok: num("precio_output_usd_mtok"),
    precio_cache_escritura_5m_usd_mtok: num("precio_cache_escritura_5m_usd_mtok"),
    precio_cache_escritura_1h_usd_mtok: num("precio_cache_escritura_1h_usd_mtok"),
    precio_cache_lectura_usd_mtok: num("precio_cache_lectura_usd_mtok"),
  });
  revalidatePath("/configuracion");
}

export async function actualizarUmbral(clave: string, formData: FormData) {
  const supabase = await createClient();
  const valor = Number(formData.get("valor"));
  if (Number.isNaN(valor)) return;
  await supabase
    .from("configuracion_alertas")
    .update({ valor, actualizado_en: new Date().toISOString() })
    .eq("clave", clave);
  revalidatePath("/configuracion");
}
