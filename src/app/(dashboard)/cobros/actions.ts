"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function marcarPagado(cobroId: string, formData: FormData) {
  const monto = Number(formData.get("monto_pagado_ars"));
  const fecha = String(formData.get("fecha_pago") ?? "") || new Date().toISOString().slice(0, 10);
  if (!Number.isFinite(monto) || monto < 0) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("cobros")
    .update({ estado: "pagado", monto_pagado_ars: monto, fecha_pago: fecha })
    .eq("id", cobroId);
  if (error) throw error;
  revalidatePath("/cobros");
  revalidatePath("/");
}

export async function deshacerPago(cobroId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cobros")
    .update({ estado: "pendiente", monto_pagado_ars: null, fecha_pago: null })
    .eq("id", cobroId);
  if (error) throw error;
  revalidatePath("/cobros");
  revalidatePath("/");
}

export async function guardarDiaCobro(clienteId: string, formData: FormData) {
  const dia = Number(formData.get("dia_cobro"));
  if (!Number.isInteger(dia) || dia < 1 || dia > 28) return;

  const supabase = await createClient();
  const { error } = await supabase.from("clientes").update({ dia_cobro: dia }).eq("id", clienteId);
  if (error) throw error;
  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/cobros");
}
