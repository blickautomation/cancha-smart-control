"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function crearCliente(formData: FormData) {
  const supabase = await createClient();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const pack = String(formData.get("pack") ?? "").trim() || null;
  const mensualidad = Number(formData.get("mensualidad_ars"));

  if (!nombre || !mensualidad) return;

  const { data: cliente, error } = await supabase
    .from("clientes")
    .insert({ nombre, pack })
    .select("id")
    .single();

  if (error) throw error;

  await supabase.from("cliente_mensualidades").insert({
    cliente_id: cliente.id,
    monto_ars: mensualidad,
    vigente_desde: new Date().toISOString().slice(0, 10),
    motivo: "Alta de cliente",
  });

  revalidatePath("/clientes");
  revalidatePath("/");
}

export async function cambiarEstadoCliente(clienteId: string, estado: "activo" | "pausado" | "baja") {
  const supabase = await createClient();
  await supabase
    .from("clientes")
    .update({ estado, fecha_baja: estado === "baja" ? new Date().toISOString().slice(0, 10) : null })
    .eq("id", clienteId);
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${clienteId}`);
}

export async function agregarMensualidad(clienteId: string, formData: FormData) {
  const supabase = await createClient();
  const monto = Number(formData.get("monto_ars"));
  const vigente_desde = String(formData.get("vigente_desde"));
  const motivo = String(formData.get("motivo") ?? "").trim() || null;
  if (!monto || !vigente_desde) return;

  await supabase.from("cliente_mensualidades").insert({
    cliente_id: clienteId,
    monto_ars: monto,
    vigente_desde,
    motivo,
  });
  revalidatePath(`/clientes/${clienteId}`);
}

export async function agregarApiKey(clienteId: string, formData: FormData) {
  const supabase = await createClient();
  const proveedor = String(formData.get("proveedor"));
  const api_key_id = String(formData.get("api_key_id") ?? "").trim();
  const alias = String(formData.get("alias") ?? "").trim() || null;
  if (!api_key_id || (proveedor !== "anthropic" && proveedor !== "openai")) return;

  await supabase.from("cliente_api_keys").insert({
    cliente_id: clienteId,
    proveedor,
    api_key_id,
    alias,
    vigente_desde: new Date().toISOString().slice(0, 10),
  });
  revalidatePath(`/clientes/${clienteId}`);
}

export async function agregarHorasSoporte(clienteId: string, formData: FormData) {
  const supabase = await createClient();
  const horas = Number(formData.get("horas"));
  const fecha = String(formData.get("fecha"));
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null;
  if (!horas || !fecha) return;

  await supabase.from("horas_soporte").insert({ cliente_id: clienteId, horas, fecha, descripcion });
  revalidatePath(`/clientes/${clienteId}`);
}
