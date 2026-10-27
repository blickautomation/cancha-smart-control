import { createClient } from "@/lib/supabase/server";
import type {
  Alerta,
  Cliente,
  ClienteApiKey,
  ClienteMensualidad,
  ConciliacionMensualAnthropic,
  ConfiguracionAlerta,
  ConversionUsdc,
  Cobro,
  CostoFijo,
  CostoMensualCliente,
  HoraSoporte,
  ModeloPrecio,
} from "@/lib/types";

export async function getClientes(): Promise<Cliente[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("nombre", { ascending: true });
  if (error) throw error;
  return data as Cliente[];
}

export async function getCliente(id: string): Promise<Cliente | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clientes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Cliente | null;
}

export async function getUltimoMesConDatos(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("costos_mensuales_cliente")
    .select("mes")
    .order("mes", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.mes ?? null;
}

export async function getCostosMensualesPorMes(mes: string): Promise<
  (CostoMensualCliente & { cliente: Pick<Cliente, "id" | "nombre" | "estado"> })[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("costos_mensuales_cliente")
    .select("*, cliente:clientes(id, nombre, estado)")
    .eq("mes", mes)
    .order("ganancia_ars", { ascending: false });
  if (error) throw error;
  return data as never;
}

export async function getTendenciaMensual(
  limiteMeses = 6
): Promise<(CostoMensualCliente & { cliente: Pick<Cliente, "id" | "nombre" | "estado"> })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("costos_mensuales_cliente")
    .select("*, cliente:clientes(id, nombre, estado)")
    .order("mes", { ascending: false })
    .limit(limiteMeses * 8); // margen para varios clientes por mes
  if (error) throw error;
  return (data as never) ?? [];
}

export async function getAlertasRecientes(soloNoVistas = true, limite = 20): Promise<
  (Alerta & { cliente: Pick<Cliente, "nombre"> | null })[]
> {
  const supabase = await createClient();
  let query = supabase
    .from("alertas")
    .select("*, cliente:clientes(nombre)")
    .order("creado_en", { ascending: false })
    .limit(limite);
  if (soloNoVistas) query = query.eq("vista", false);
  const { data, error } = await query;
  if (error) throw error;
  return data as never;
}

export async function getMensualidadesDeCliente(clienteId: string): Promise<ClienteMensualidad[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cliente_mensualidades")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("vigente_desde", { ascending: false });
  if (error) throw error;
  return data as ClienteMensualidad[];
}

export async function getApiKeysDeCliente(clienteId: string): Promise<ClienteApiKey[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cliente_api_keys")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("vigente_desde", { ascending: false });
  if (error) throw error;
  return data as ClienteApiKey[];
}

export async function getHorasSoporteDeCliente(clienteId: string): Promise<HoraSoporte[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("horas_soporte")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data as HoraSoporte[];
}

export async function getHistorialMensualDeCliente(clienteId: string): Promise<CostoMensualCliente[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("costos_mensuales_cliente")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("mes", { ascending: false });
  if (error) throw error;
  return data as CostoMensualCliente[];
}

export async function getCostosFijos(): Promise<CostoFijo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("costos_fijos")
    .select("*")
    .order("activo", { ascending: false })
    .order("nombre", { ascending: true });
  if (error) throw error;
  return data as CostoFijo[];
}

export async function getConversionesUsdc(limite = 50): Promise<ConversionUsdc[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversiones_usdc")
    .select("*")
    .order("fecha", { ascending: false })
    .limit(limite);
  if (error) throw error;
  return data as ConversionUsdc[];
}

export async function getCostoPromedioUsdcActual(): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_costo_promedio_usdc")
    .select("costo_promedio_ars_por_usdc")
    .order("fecha", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.costo_promedio_ars_por_usdc ?? null;
}

export async function getConciliaciones(limite = 24): Promise<
  (ConciliacionMensualAnthropic & { cliente: Pick<Cliente, "nombre"> })[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conciliacion_mensual_anthropic")
    .select("*, cliente:clientes(nombre)")
    .order("mes", { ascending: false })
    .limit(limite);
  if (error) throw error;
  return data as never;
}

export async function getModelosPrecios(): Promise<ModeloPrecio[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modelos_precios")
    .select("*")
    .order("proveedor", { ascending: true })
    .order("vigente_desde", { ascending: false });
  if (error) throw error;
  return data as ModeloPrecio[];
}

export async function getConfiguracionAlertas(): Promise<ConfiguracionAlerta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("configuracion_alertas")
    .select("*")
    .order("clave", { ascending: true });
  if (error) throw error;
  return data as ConfiguracionAlerta[];
}

const mesActual = () => new Date().toISOString().slice(0, 7) + "-01";

/** Crea (si faltan) los cobros del mes para clientes activos con día de cobro y mensualidad vigente. */
export async function asegurarCobrosDelMes(): Promise<void> {
  const supabase = await createClient();
  const mes = mesActual();
  const hoy = new Date().toISOString().slice(0, 10);

  const [clientes, mensualidades, existentes] = await Promise.all([
    supabase.from("clientes").select("id, dia_cobro").eq("estado", "activo").not("dia_cobro", "is", null),
    supabase
      .from("cliente_mensualidades")
      .select("cliente_id, monto_ars, vigente_desde")
      .lte("vigente_desde", hoy)
      .order("vigente_desde", { ascending: false }),
    supabase.from("cobros").select("cliente_id").eq("mes", mes),
  ]);
  if (clientes.error) throw clientes.error;
  if (existentes.error) throw existentes.error;

  const yaTienen = new Set((existentes.data ?? []).map((c) => c.cliente_id));
  const nuevos = (clientes.data ?? [])
    .filter((c) => !yaTienen.has(c.id))
    .map((c) => {
      const monto = (mensualidades.data ?? []).find((m) => m.cliente_id === c.id)?.monto_ars ?? 0;
      return {
        cliente_id: c.id,
        mes,
        fecha_vencimiento: `${mes.slice(0, 7)}-${String(c.dia_cobro).padStart(2, "0")}`,
        monto_esperado_ars: Number(monto),
      };
    })
    .filter((c) => c.monto_esperado_ars > 0);

  if (nuevos.length > 0) {
    const { error } = await supabase
      .from("cobros")
      .upsert(nuevos, { onConflict: "cliente_id,mes", ignoreDuplicates: true });
    if (error) throw error;
  }
}

export async function getCobros(
  limiteMeses = 3
): Promise<(Cobro & { cliente: Pick<Cliente, "id" | "nombre"> })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cobros")
    .select("*, cliente:clientes(id, nombre)")
    .order("mes", { ascending: false })
    .order("fecha_vencimiento", { ascending: true })
    .limit(limiteMeses * 8);
  if (error) throw error;
  return data as never;
}

/** Cantidad de cobros pendientes ya vencidos. Devuelve 0 si la tabla todavía no existe. */
export async function contarCobrosVencidos(): Promise<number> {
  const supabase = await createClient();
  const hoy = new Date().toISOString().slice(0, 10);
  const { count, error } = await supabase
    .from("cobros")
    .select("id", { count: "exact", head: true })
    .eq("estado", "pendiente")
    .lt("fecha_vencimiento", hoy);
  if (error) return 0;
  return count ?? 0;
}
