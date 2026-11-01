/**
 * DICCIONARIO DE EXPLICACIONES ECONÓMICAS Y AUDITORÍA TÉCNICA INTERNA
 *
 * Este módulo conserva el registro técnico interno de la auditoría matemática
 * realizada sobre el repositorio original y provee las definiciones de variables,
 * fórmulas matemáticas y explicaciones comprensibles para estudiantes y profesionales.
 */

export interface VariableExplicacion {
  simbolo: string;
  nombre: string;
  unidad: string;
  descripcion: string;
}

export interface HallazgoAuditoriaMatematica {
  id: string;
  operacion: string;
  archivoOriginal: string;
  formulaHeredada: string;
  formulaCorregida: string;
  justificacionMatematica: string;
}

/**
 * Registro interno de las correcciones matemáticas aplicadas en la Fase 1.
 */
export const HALLAZGOS_AUDITORIA_FASE_1: HallazgoAuditoriaMatematica[] = [
  {
    id: 'AUD-01',
    operacion: 'Sistema Alemán — Intereses Pagados Acumulados (Opción 7)',
    archivoOriginal: 'Operaciones/sistema_aleman.py (líneas 171–174)',
    formulaHeredada: 'th = V / n; SD = (n - h) * th; Ih = (((V * i) + (SD * i)) / 2) * h',
    formulaCorregida: 'th = V / n; I_1 = V * i; I_h = (n - h + 1) * th * i; Ih = ((I_1 + I_h) / 2) * h',
    justificacionMatematica:
      'En el sistema alemán, el interés del período k (k = 1..h) se devenga sobre el saldo al comienzo del período k: SD_{k-1} = (n - k + 1) * th. La fórmula heredada usaba SD_h = (n - h) * th (el saldo posterior al pago h, correspondiente al período h+1), subestimando la suma acumulada en (h * th * i) / 2. Por ejemplo, para V=1200, i=10%, n=12, h=1, el interés del primer período es 120, mientras que la fórmula heredada arrojaba 115.',
  },
  {
    id: 'AUD-02',
    operacion: 'Régimen Simple — Cálculo de Tasa de Interés (Opción Y)',
    archivoOriginal: 'Operaciones/regimen_simple.py (líneas 297–306)',
    formulaHeredada: 'interés = ((M / C) - 1) * 100',
    formulaCorregida: 'Tasa periódica: i = (((M / C) - 1) / n) * 100 | Rendimiento total de la operación: R = ((M / C) - 1) * 100',
    justificacionMatematica:
      'De M = C * (1 + i * n) se despeja la tasa simple periódica i = (M / C - 1) / n. Cuando n = 1, coincide con el rendimiento directo total de la punta ((M / C) - 1). El motor y la interfaz distinguen explícitamente ambos conceptos.',
  },
  {
    id: 'AUD-03',
    operacion: 'Sistemas Francés y Alemán — Indexación de Período (p) vs. Cuotas Canceladas (h)',
    archivoOriginal: 'Operaciones/sistema_frances.py y Operaciones/sistema_aleman.py',
    formulaHeredada: 'Restricción h < n y mezcla entre período objetivo y cuotas canceladas',
    formulaCorregida: 'Habilitación de h = n para saldos, amortizaciones acumuladas e intereses pagados; distinción explícita entre período de cuota p (1 <= p <= n) y cuotas ya abonadas h (0 <= h <= n)',
    justificacionMatematica:
      'Al cancelar la totalidad del préstamo (h = n), el saldo de deuda es 0, la amortización acumulada es V y los intereses pagados acumulados igualan a los intereses totales TI.',
  },
  {
    id: 'AUD-04',
    operacion: 'Límite Matemático en Tasa Cero (i = 0%) en Rentas y Amortizaciones',
    archivoOriginal: 'rentas_valor_final.py, rentas_valor_actual.py, sistema_frances.py',
    formulaHeredada: 'División directa por i que producía NaN / ZeroDivisionError cuando i = 0',
    formulaCorregida: ' Aplicación del límite continuo lim_{i -> 0} ((1+i)^n - 1)/i = n y lim_{i -> 0} (1 - (1+i)^-n)/i = n',
    justificacionMatematica:
      'Cuando la tasa de interés es 0%, el valor final y el valor actual de n cuotas de importe C son exactamente C * n, y la cuota del sistema francés es V / n.',
  },
  {
    id: 'AUD-05',
    operacion: 'Rentas Valor Final — Tasa de Interés Implícita (Opción 5)',
    archivoOriginal: 'Operaciones/rentas_valor_final.py (líneas 318–339)',
    formulaHeredada: 'fsolve(lambda i: C * ((1 + i)**n - 1) / i - VF, 0.1)[0]',
    formulaCorregida: 'Método híbrido acotado Newton-Raphson + Bisección en (-1, +inf) con serie de Taylor de orden 4 en torno a i = 0 y validación de n >= 2',
    justificacionMatematica:
      'Garantiza convergencia global tanto para tasas positivas (VF > C*n), tasa cero (VF = C*n) y tasas negativas admisibles (-1 < i < 0 cuando VF < C*n), evitando divergencias en plazos largos.',
  },
  {
    id: 'AUD-06',
    operacion: 'Cuadro de Marcha — Eliminación de Truncamiento Silencioso',
    archivoOriginal: 'generarTablaAmortizacion',
    formulaHeredada: 'Recorte silencioso Math.min(360, n)',
    formulaCorregida: 'Sin recorte silencioso; soporte hasta 1.200 períodos con validación explícita en el formulario antes del cálculo',
    justificacionMatematica:
      'Evita mostrar una tabla incompleta que no cierra en saldo cero cuando el préstamo supera 360 períodos.',
  },
];
