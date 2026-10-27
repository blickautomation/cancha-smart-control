// Tipos de dominio. Reflejan supabase/migrations/0001_schema.sql.
// Cuando el proyecto Supabase exista, se puede reemplazar por
// `npx supabase gen types typescript` sin cambiar los nombres acá.

export type EstadoCliente = "activo" | "pausado" | "baja";
export type Proveedor = "anthropic" | "openai";
export type Periodicidad = "mensual" | "anual" | "unica";
export type Moneda = "ARS" | "USD";
export type TipoAlerta = "margen_bajo" | "consumo_anomalo" | "diferencia_conciliacion";
export type Severidad = "info" | "warning" | "critical";

export interface Cliente {
  id: string;
  nombre: string;
  pack: string | null;
  estado: EstadoCliente;
  fecha_alta: string;
  fecha_baja: string | null;
  notas: string | null;
  dia_cobro?: number | null;
  creado_en: string;
}

export type EstadoCobro = "pendiente" | "pagado";

export interface Cobro {
  id: string;
  cliente_id: string;
  mes: string;
  fecha_vencimiento: string;
  monto_esperado_ars: number;
  estado: EstadoCobro;
  monto_pagado_ars: number | null;
  fecha_pago: string | null;
  creado_en: string;
}

export interface ClienteMensualidad {
  id: string;
  cliente_id: string;
  monto_ars: number;
  vigente_desde: string;
  motivo: string | null;
  creado_en: string;
}

export interface ClienteApiKey {
  id: string;
  cliente_id: string;
  proveedor: Proveedor;
  api_key_id: string;
  alias: string | null;
  vigente_desde: string;
  vigente_hasta: string | null;
  creado_en: string;
}

export interface ModeloPrecio {
  id: string;
  proveedor: Proveedor;
  modelo: string;
  vigente_desde: string;
  vigente_hasta: string | null;
  precio_input_usd_mtok: number | null;
  precio_output_usd_mtok: number | null;
  precio_cache_escritura_5m_usd_mtok: number | null;
  precio_cache_escritura_1h_usd_mtok: number | null;
  precio_cache_lectura_usd_mtok: number | null;
  notas: string | null;
}

export interface ConversionUsdc {
  id: string;
  fecha: string;
  pesos_entregados: number;
  usdc_recibidos: number;
  notas: string | null;
  creado_en: string;
}

export interface CostoFijo {
  id: string;
  nombre: string;
  moneda: Moneda;
  monto: number;
  periodicidad: Periodicidad;
  fecha_pago: string | null;
  prorratear: boolean;
  activo: boolean;
  notas: string | null;
}

export interface CostoMensualCliente {
  id: string;
  cliente_id: string;
  mes: string;
  mensualidad_ars: number;
  costo_apis_usd: number;
  costo_promedio_usdc_usado: number;
  costo_apis_ars: number;
  costo_fijo_prorrateado_ars: number;
  costo_total_ars: number;
  ganancia_ars: number;
  margen_pct: number;
  cerrado: boolean;
  calculado_en: string;
}

export interface ConciliacionMensualAnthropic {
  id: string;
  cliente_id: string;
  mes: string;
  costo_calculado_usd: number;
  costo_cost_api_usd: number;
  diferencia_usd: number;
  diferencia_pct: number;
  estado: "ok" | "alerta";
  revisado: boolean;
}

export interface HoraSoporte {
  id: string;
  cliente_id: string;
  fecha: string;
  horas: number;
  descripcion: string | null;
}

export interface ConfiguracionAlerta {
  id: string;
  clave: string;
  valor: number;
  descripcion: string | null;
}

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  cliente_id: string | null;
  mes: string | null;
  fecha: string;
  severidad: Severidad;
  mensaje: string;
  datos: Record<string, unknown> | null;
  vista: boolean;
  creado_en: string;
}
