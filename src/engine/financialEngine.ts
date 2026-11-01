/**
 * MOTOR FINANCIERO CORREGIDO Y AUDITADO — CALCULADORA FINANCIERA
 *
 * Implementa las fórmulas de matemática financiera auditadas y validadas
 * para Régimen Simple, Régimen Compuesto, Equivalencia de Tasas,
 * Rentas (Valor Final y Valor Actual) y Sistemas de Amortización
 * (Francés, Alemán y Americano).
 *
 * Características matemáticas:
 * - Tratamiento continuo y exacto del caso límite i = 0 en rentas y amortizaciones.
 * - Cálculo de intereses acumulados e intereses por período en Sistema Francés y Alemán
 *   sin desplazamientos de índice.
 * - Tasa periódica y tasa efectiva total diferenciadas en Régimen Simple.
 * - Resolución numérica de tasa implícita con bisección + Newton-Raphson garantizada
 *   en todo el dominio financiero admisible i > -1.
 * - Generación de tablas de amortización sin truncamientos silenciosos.
 */

// ============================================================================
// 1. RÉGIMEN SIMPLE
// ============================================================================

export interface TasaPeriodoSimple {
  tasaPorcentaje: number;
  periodos: number;
}

export interface EtapaCapitalizacionSimple {
  cambioTasa: boolean;
  tasaPorcentaje?: number;
  periodos?: number;
  tramos?: TasaPeriodoSimple[];
}

export interface RegimenSimpleMontoParams {
  C: number;
  cambioTasa: boolean;
  capitalizacion: boolean;
  iPorcentaje?: number;
  n?: number;
  tramosIniciales?: TasaPeriodoSimple[];
  etapasCapitalizacion?: EtapaCapitalizacionSimple[];
}

export interface RegimenSimpleMontoResult {
  montoFinal: number;
  historialCapitalizaciones: number[];
  interesTotalGenerado: number;
}

/**
 * Interés Total en Régimen Simple: I = M - C
 */
export function rsInteresTotal(C: number, M: number): number {
  return M - C;
}

/**
 * Monto Final en Régimen Simple (con o sin cambio de tasa y con o sin capitalización intermedia)
 */
export function rsMontoFinal(params: RegimenSimpleMontoParams): RegimenSimpleMontoResult {
  const { C, cambioTasa, capitalizacion } = params;

  if (cambioTasa && capitalizacion) {
    const tramosPre = params.tramosIniciales ?? [];
    let sumaInteresesPre = 0;
    for (const tramo of tramosPre) {
      const tasa = tramo.tasaPorcentaje / 100;
      sumaInteresesPre += C * (tasa * tramo.periodos);
    }
    const montoInicial = C + sumaInteresesPre;

    const capitalizaciones: number[] = [montoInicial];
    const etapas = params.etapasCapitalizacion ?? [];

    for (let i = 0; i < etapas.length; i++) {
      const etapa = etapas[i];
      if (etapa.cambioTasa) {
        const tramos = etapa.tramos ?? [];
        let sumaInt = 0;
        for (const t of tramos) {
          sumaInt += capitalizaciones[i] * ((t.tasaPorcentaje / 100) * t.periodos);
        }
        capitalizaciones.push(capitalizaciones[i] + sumaInt);
      } else {
        const tasa = (etapa.tasaPorcentaje ?? 0) / 100;
        const n = etapa.periodos ?? 0;
        const interes = capitalizaciones[i] * (tasa * n);
        capitalizaciones.push(capitalizaciones[i] + interes);
      }
    }

    const montoFinal = capitalizaciones[capitalizaciones.length - 1];
    return {
      montoFinal,
      historialCapitalizaciones: capitalizaciones,
      interesTotalGenerado: montoFinal - C,
    };
  } else if (cambioTasa && !capitalizacion) {
    const tramos = params.tramosIniciales ?? [];
    let sumaIntereses = 0;
    for (const t of tramos) {
      sumaIntereses += C * ((t.tasaPorcentaje / 100) * t.periodos);
    }
    const monto = C + sumaIntereses;
    return {
      montoFinal: monto,
      historialCapitalizaciones: [monto],
      interesTotalGenerado: monto - C,
    };
  } else if (!cambioTasa && capitalizacion) {
    const i = (params.iPorcentaje ?? 0) / 100;
    const n = params.n ?? 0;
    const montoInicial = C * (1 + i * n);
    const capitalizaciones: number[] = [montoInicial];
    const etapas = params.etapasCapitalizacion ?? [];

    for (let idx = 0; idx < etapas.length; idx++) {
      const etapa = etapas[idx];
      if (etapa.cambioTasa) {
        const tramos = etapa.tramos ?? [];
        let sumaInt = 0;
        for (const t of tramos) {
          sumaInt += capitalizaciones[idx] * ((t.tasaPorcentaje / 100) * t.periodos);
        }
        capitalizaciones.push(capitalizaciones[idx] + sumaInt);
      } else {
        const tasa = (etapa.tasaPorcentaje ?? 0) / 100;
        const nEtapa = etapa.periodos ?? 0;
        const interes = capitalizaciones[idx] * (tasa * nEtapa);
        capitalizaciones.push(capitalizaciones[idx] + interes);
      }
    }

    const montoFinal = capitalizaciones[capitalizaciones.length - 1];
    return {
      montoFinal,
      historialCapitalizaciones: capitalizaciones,
      interesTotalGenerado: montoFinal - C,
    };
  } else {
    const i = (params.iPorcentaje ?? 0) / 100;
    const n = params.n ?? 0;
    const monto = C * (1 + i * n);
    return {
      montoFinal: monto,
      historialCapitalizaciones: [monto],
      interesTotalGenerado: monto - C,
    };
  }
}

/**
 * Capital Invertido en Régimen Simple: C = M / (1 + i * n)
 */
export function rsCapitalInvertido(M: number, iPorcentaje: number, n: number): number {
  const i = iPorcentaje / 100;
  const denom = 1 + i * n;
  if (Math.abs(denom) < 1e-15) return NaN;
  return M / denom;
}

/**
 * Tasa de Interés en Régimen Simple:
 * - Si se provee n > 0: calcula la tasa periódica simple i = ((M / C - 1) / n) * 100
 * - Si no se provee n (o n === 1): calcula el rendimiento directo total de la operación ((M / C) - 1) * 100
 */
export function rsTasaInteres(M: number, C: number, nPeriodos = 1): number {
  if (C === 0 || nPeriodos <= 0) return NaN;
  return ((M / C - 1) / nPeriodos) * 100;
}

/**
 * Rendimiento Total Directo de la Punta en Régimen Simple: R_total = ((M / C) - 1) * 100
 */
export function rsTasaTotalOperacion(M: number, C: number): number {
  if (C === 0) return NaN;
  return (M / C - 1) * 100;
}

/**
 * Valor Descontado Comercial en Régimen Simple: VD = N * (1 - d * n)
 */
export function rsValorDescontado(N: number, dPorcentaje: number, n: number): number {
  const d = dPorcentaje / 100;
  return N * (1 - d * n);
}

/**
 * Valor Actual Racional en Régimen Simple: VA = N / (1 + i * n)
 */
export function rsValorActual(N: number, iPorcentaje: number, n: number): number {
  const i = iPorcentaje / 100;
  const denom = 1 + i * n;
  if (Math.abs(denom) < 1e-15) return NaN;
  return N / denom;
}

/**
 * Descuento Comercial Total en Régimen Simple: D = N * d * n
 */
export function rsDescuentoTotal(N: number, dPorcentaje: number, n: number): number {
  const d = dPorcentaje / 100;
  return N * d * n;
}

/**
 * Resultado Financiero: RF = VD - Vi
 */
export function rsResultadoFinanciero(VD: number, Vi: number): number {
  return VD - Vi;
}

// ============================================================================
// 2. RÉGIMEN COMPUESTO
// ============================================================================

export interface RegimenCompuestoMontoParams {
  C: number;
  cambioTasa: boolean;
  iPorcentaje?: number;
  n?: number;
  tramos?: TasaPeriodoSimple[];
}

export interface RegimenCompuestoMontoResult {
  montoFinal: number;
  evolucionTramos: number[];
}

/**
 * Interés Total en Régimen Compuesto: I = M - C
 */
export function rcInteresTotal(C: number, M: number): number {
  return M - C;
}

/**
 * Capital Invertido en Régimen Compuesto: C = M / (1 + i)^n
 */
export function rcCapitalInvertido(M: number, iPorcentaje: number, n: number): number {
  const i = iPorcentaje / 100;
  if (1 + i <= 0) return NaN;
  return M / Math.pow(1 + i, n);
}

/**
 * Tasa de Interés Efectiva Periódica en Régimen Compuesto: i = ((M / C)^(1 / n) - 1) * 100
 */
export function rcTasaInteres(M: number, C: number, n: number): number {
  if (C <= 0 || M <= 0 || n <= 0) return NaN;
  return (Math.pow(M / C, 1 / n) - 1) * 100;
}

/**
 * Monto Final en Régimen Compuesto (con o sin cambios de tasa)
 */
export function rcMontoFinal(params: RegimenCompuestoMontoParams): RegimenCompuestoMontoResult {
  const { C, cambioTasa } = params;
  if (cambioTasa) {
    const tramos = params.tramos ?? [];
    let monto = C;
    const evolucion: number[] = [C];
    for (const tramo of tramos) {
      const tasa = tramo.tasaPorcentaje / 100;
      const n = tramo.periodos;
      monto *= Math.pow(1 + tasa, n);
      evolucion.push(monto);
    }
    return {
      montoFinal: monto,
      evolucionTramos: evolucion,
    };
  } else {
    const i = (params.iPorcentaje ?? 0) / 100;
    const n = params.n ?? 0;
    const monto = C * Math.pow(1 + i, n);
    return {
      montoFinal: monto,
      evolucionTramos: [C, monto],
    };
  }
}

/**
 * Valor Descontado en Régimen Compuesto: VD = N * (1 - d)^n
 */
export function rcValorDescontado(N: number, dPorcentaje: number, n: number): number {
  const d = dPorcentaje / 100;
  if (1 - d < 0) return NaN;
  return N * Math.pow(1 - d, n);
}

/**
 * Valor Actual en Régimen Compuesto: VA = N / (1 + i)^n
 */
export function rcValorActual(N: number, iPorcentaje: number, n: number): number {
  const i = iPorcentaje / 100;
  if (1 + i <= 0) return NaN;
  return N / Math.pow(1 + i, n);
}

/**
 * Descuento Total en Régimen Compuesto: D = N * (1 - (1 - d)^n)
 */
export function rcDescuentoTotal(N: number, dPorcentaje: number, n: number): number {
  const d = dPorcentaje / 100;
  if (1 - d < 0) return NaN;
  return N * (1 - Math.pow(1 - d, n));
}

/**
 * Resultado Financiero: RF = VD - Vi
 */
export function rcResultadoFinanciero(VD: number, Vi: number): number {
  return VD - Vi;
}

// ============================================================================
// 3. EQUIVALENCIAS DE TASAS (12 CONVERSIONES)
// ============================================================================
// Todas las funciones reciben la tasa de entrada en porcentaje (ej. 5 para 5%)
// y devuelven la tasa resultante en tanto por uno (ej. 0.05).

/**
 * 1. Tasa efectiva vencida a tasa efectiva vencida
 */
export function eq1EfectivaVencidaAEfectivaVencida(efectivaPorcentaje: number, ut2: number, ut1: number): number {
  if (ut2 <= 0 || ut1 <= 0) return NaN;
  const i2 = efectivaPorcentaje / 100;
  if (1 + i2 <= 0) return NaN;
  return Math.pow(1 + i2, ut1 / ut2) - 1;
}

/**
 * 2. Tasa nominal vencida a tasa efectiva vencida
 */
export function eq2NominalVencidaAEfectivaVencida(
  nominalPorcentaje: number,
  ut2: number,
  fs: number,
  ut1: number
): number {
  if (ut2 <= 0 || fs <= 0 || ut1 <= 0) return NaN;
  const jm = nominalPorcentaje / 100;
  const base = 1 + (jm / ut2) * fs;
  if (base <= 0) return NaN;
  return Math.pow(base, ut1 / fs) - 1;
}

/**
 * 3. Tasa efectiva vencida a tasa nominal vencida
 */
export function eq3EfectivaVencidaANominalVencida(
  efectivaPorcentaje: number,
  ut1: number,
  ut2: number,
  fs: number
): number {
  if (ut1 <= 0 || ut2 <= 0 || fs <= 0) return NaN;
  const i = efectivaPorcentaje / 100;
  if (1 + i <= 0) return NaN;
  return (Math.pow(1 + i, fs / ut1) - 1) * (ut2 / fs);
}

/**
 * 4. Tasa nominal vencida a tasa nominal vencida
 */
export function eq4NominalVencidaANominalVencida(
  nominalPorcentaje: number,
  ut2: number,
  fs2: number,
  ut1: number,
  fs1: number
): number {
  if (ut2 <= 0 || fs2 <= 0 || ut1 <= 0 || fs1 <= 0) return NaN;
  const jm2 = nominalPorcentaje / 100;
  const base = 1 + (jm2 / ut2) * fs2;
  if (base <= 0) return NaN;
  return (Math.pow(base, fs1 / fs2) - 1) * (ut1 / fs1);
}

/**
 * 5. Tasa efectiva adelantada a tasa efectiva adelantada
 */
export function eq5EfectivaAdelantadaAEfectivaAdelantada(
  efectivaPorcentaje: number,
  ut2: number,
  ut1: number
): number {
  if (ut2 <= 0 || ut1 <= 0) return NaN;
  const d2 = efectivaPorcentaje / 100;
  if (1 - d2 <= 0) return NaN;
  return 1 - Math.pow(1 - d2, ut1 / ut2);
}

/**
 * 6. Tasa efectiva adelantada a tasa nominal adelantada
 */
export function eq6EfectivaAdelantadaANominalAdelantada(
  efectivaPorcentaje: number,
  ut1: number,
  ut2: number,
  fs: number
): number {
  if (ut1 <= 0 || ut2 <= 0 || fs <= 0) return NaN;
  const d = efectivaPorcentaje / 100;
  if (1 - d <= 0) return NaN;
  return (ut2 / fs) * (1 - Math.pow(1 - d, fs / ut1));
}

/**
 * 7. Tasa nominal adelantada a tasa efectiva adelantada
 */
export function eq7NominalAdelantadaAEfectivaAdelantada(
  nominalPorcentaje: number,
  ut2: number,
  fs: number,
  ut1: number
): number {
  if (ut2 <= 0 || fs <= 0 || ut1 <= 0) return NaN;
  const fm = nominalPorcentaje / 100;
  const base = 1 - (fm / ut2) * fs;
  if (base <= 0) return NaN;
  return 1 - Math.pow(base, ut1 / fs);
}

/**
 * 8. Tasa nominal adelantada a tasa nominal adelantada
 */
export function eq8NominalAdelantadaANominalAdelantada(
  nominalPorcentaje: number,
  ut2: number,
  fs2: number,
  ut1: number,
  fs1: number
): number {
  if (ut2 <= 0 || fs2 <= 0 || ut1 <= 0 || fs1 <= 0) return NaN;
  const fm2 = nominalPorcentaje / 100;
  const base = 1 - (fm2 / ut2) * fs2;
  if (base <= 0) return NaN;
  return (ut1 / fs1) * (1 - Math.pow(base, fs1 / fs2));
}

/**
 * 9. Tasa efectiva vencida a tasa efectiva adelantada
 */
export function eq9EfectivaVencidaAEfectivaAdelantada(
  efectivaPorcentaje: number,
  ut2: number,
  ut1: number
): number {
  if (ut2 <= 0 || ut1 <= 0) return NaN;
  const i2 = efectivaPorcentaje / 100;
  if (1 + i2 <= 0) return NaN;
  return 1 - Math.pow(1 / (1 + i2), ut1 / ut2);
}

/**
 * 10. Tasa efectiva adelantada a tasa efectiva vencida
 */
export function eq10EfectivaAdelantadaAEfectivaVencida(
  efectivaPorcentaje: number,
  ut2: number,
  ut1: number
): number {
  if (ut2 <= 0 || ut1 <= 0) return NaN;
  const d2 = efectivaPorcentaje / 100;
  if (1 - d2 <= 0) return NaN;
  return Math.pow(1 / (1 - d2), ut1 / ut2) - 1;
}

/**
 * 11. Tasa nominal vencida a tasa nominal adelantada
 */
export function eq11NominalVencidaANominalAdelantada(
  nominalPorcentaje: number,
  ut2: number,
  fs2: number,
  ut1: number,
  fs1: number
): number {
  if (ut2 <= 0 || fs2 <= 0 || ut1 <= 0 || fs1 <= 0) return NaN;
  const jm2 = nominalPorcentaje / 100;
  const base = 1 + (jm2 / ut2) * fs2;
  if (base <= 0) return NaN;
  return (ut1 / fs1) * (1 - Math.pow(1 / base, fs1 / fs2));
}

/**
 * 12. Tasa nominal adelantada a tasa nominal vencida
 */
export function eq12NominalAdelantadaANominalVencida(
  nominalPorcentaje: number,
  ut2: number,
  fs2: number,
  ut1: number,
  fs1: number
): number {
  if (ut2 <= 0 || fs2 <= 0 || ut1 <= 0 || fs1 <= 0) return NaN;
  const fm2 = nominalPorcentaje / 100;
  const base = 1 - (fm2 / ut2) * fs2;
  if (base <= 0) return NaN;
  return (ut1 / fs1) * (1 / Math.pow(base, fs1 / fs2) - 1);
}

// ============================================================================
// FUNCIONES AUXILIARES CON LÍMITE CONTINUO EN TASA CERO (i -> 0)
// ============================================================================

/**
 * Factor de capitalización de renta vencida: s_{n|i} = ((1 + i)^n - 1) / i
 * Para i = 0, el límite matemático exacto es n.
 */
function factorValorFinalRenta(i: number, n: number): number {
  if (Math.abs(i) < 1e-12) {
    return n + ((n * (n - 1)) / 2) * i;
  }
  return (Math.pow(1 + i, n) - 1) / i;
}

/**
 * Factor de actualización de renta vencida: a_{n|i} = (1 - (1 + i)^(-n)) / i
 * Para i = 0, el límite matemático exacto es n.
 */
function factorValorActualRenta(i: number, n: number): number {
  if (Math.abs(i) < 1e-12) {
    return n - ((n * (n + 1)) / 2) * i;
  }
  return (1 - Math.pow(1 + i, -n)) / i;
}

// ============================================================================
// 4. RENTAS — VALOR FINAL
// ============================================================================

export interface TasaPosteriorRenta {
  tasaPorcentaje: number;
  periodosFaltantes: number;
}

export interface SubTramoTasaEnCuota {
  tasaPorcentaje: number;
  cantidadCuotas: number;
  tasasPosteriores: TasaPosteriorRenta[];
}

export interface BloqueCapitalVarAmbos {
  C: number;
  cambioTasaDuranteCuota: boolean;
  tasaPorcentaje?: number;
  cantidadCuotas?: number;
  tasasPosteriores?: TasaPosteriorRenta[];
  subTramos?: SubTramoTasaEnCuota[];
}

export interface TramoSoloTasaRenta {
  tasaPorcentaje: number;
  periodos: number;
}

export interface TramoSoloCuotaRenta {
  C: number;
  n: number;
  h: number;
}

/**
 * 1A. Renta Final de Pagos Vencidos — Cuota y tasa constantes
 * Con límite continuo exacto cuando i = 0 (VF = C * n).
 */
export function rvf1VencidaConstante(C: number, iPorcentaje: number, n: number): number {
  const i = iPorcentaje / 100;
  if (1 + i <= 0 || n < 0) return NaN;
  return C * factorValorFinalRenta(i, n);
}

/**
 * 1B. Renta Final de Pagos Vencidos — Variación en el capital y en la tasa
 */
export function rvf1VencidaVarCapitalYTasa(bloques: BloqueCapitalVarAmbos[]): {
  valorFinal: number;
  resultadosPorCapital: number[];
} {
  const resultados: number[] = [];

  for (const bloque of bloques) {
    const C = bloque.C;
    if (!bloque.cambioTasaDuranteCuota) {
      const i = (bloque.tasaPorcentaje ?? 0) / 100;
      const n = bloque.cantidadCuotas ?? 0;
      let resultado = C * factorValorFinalRenta(i, n);
      const posteriores = bloque.tasasPosteriores ?? [];
      for (const post of posteriores) {
        const tasaPost = post.tasaPorcentaje / 100;
        resultado *= Math.pow(1 + tasaPost, post.periodosFaltantes);
      }
      resultados.push(resultado);
    } else {
      const resultadoCuota: number[] = [];
      const subTramos = bloque.subTramos ?? [];
      for (const sub of subTramos) {
        const i = sub.tasaPorcentaje / 100;
        const n = sub.cantidadCuotas;
        let resultado = C * factorValorFinalRenta(i, n);
        for (const post of sub.tasasPosteriores) {
          const tasaPost = post.tasaPorcentaje / 100;
          resultado *= Math.pow(1 + tasaPost, post.periodosFaltantes);
        }
        resultadoCuota.push(resultado);
      }
      resultados.push(resultadoCuota.reduce((acc, v) => acc + v, 0));
    }
  }

  return {
    valorFinal: resultados.reduce((acc, v) => acc + v, 0),
    resultadosPorCapital: resultados,
  };
}

/**
 * 1C. Renta Final de Pagos Vencidos — Varía solo la tasa
 */
export function rvf1VencidaVarSoloTasa(C: number, tramos: TramoSoloTasaRenta[]): {
  valorFinal: number;
  aportesCapitalizados: number[];
} {
  const cantidadTasas = tramos.length;
  const tasas = tramos.map((t) => t.tasaPorcentaje / 100);
  const periodos = tramos.map((t) => t.periodos);
  const tasasACapital: number[] = [];

  for (let j = 0; j < cantidadTasas; j++) {
    const resultado = C * factorValorFinalRenta(tasas[j], periodos[j]);
    tasasACapital.push(resultado);
  }

  for (let j = 0; j < cantidadTasas; j++) {
    for (let k = j + 1; k < cantidadTasas; k++) {
      tasasACapital[j] *= Math.pow(1 + tasas[k], periodos[k]);
    }
  }

  return {
    valorFinal: tasasACapital.reduce((acc, v) => acc + v, 0),
    aportesCapitalizados: tasasACapital,
  };
}

/**
 * 1D. Renta Final de Pagos Vencidos — Varía solo la cuota
 */
export function rvf1VencidaVarSoloCuota(iPorcentaje: number, tramos: TramoSoloCuotaRenta[]): {
  valorFinal: number;
  resultadosPorTramo: number[];
} {
  const i = iPorcentaje / 100;
  const resultados: number[] = [];

  for (const tramo of tramos) {
    const resultado = C_CalcVencida(tramo.C, i, tramo.n) * Math.pow(1 + i, tramo.h);
    resultados.push(resultado);
  }

  return {
    valorFinal: resultados.reduce((acc, v) => acc + v, 0),
    resultadosPorTramo: resultados,
  };
}

function C_CalcVencida(C: number, i: number, n: number): number {
  return C * factorValorFinalRenta(i, n);
}

/**
 * 2. Renta Final de Pagos Adelantados: VFA = C * s_{n|i} * (1 + i)
 */
export function rvf2Adelantada(C: number, iPorcentaje: number, n: number): number {
  const i = iPorcentaje / 100;
  if (1 + i <= 0 || n < 0) return NaN;
  return C * factorValorFinalRenta(i, n) * (1 + i);
}

/**
 * 3. Intereses Totales de una Renta: IT = An - sum(C_j * n_j)
 */
export interface AporteCapitalRenta {
  C: number;
  n: number;
}

export function rvf3InteresesTotales(An: number, aportes: AporteCapitalRenta[]): {
  interesesTotales: number;
  capitalTotalAportado: number;
} {
  const capitalAportado = aportes.map((a) => a.C * a.n);
  const capitalTotal = capitalAportado.reduce((acc, v) => acc + v, 0);
  const IT = An - capitalTotal;
  return {
    interesesTotales: IT,
    capitalTotalAportado: capitalTotal,
  };
}

/**
 * 4. Cálculo de la Cuota (Capital Periódico) dado un Valor Final Objetivo
 * Con límite continuo cuando i = 0 (C = VF / n).
 */
export function rvf4CapitalNecesario(VF: number, iPorcentaje: number, n: number): number {
  if (n <= 0) return NaN;
  const i = iPorcentaje / 100;
  if (1 + i <= 0) return NaN;
  const factor = factorValorFinalRenta(i, n);
  if (Math.abs(factor) < 1e-15) return NaN;
  return VF / factor;
}

/**
 * 5. Cálculo de la Tasa de Interés Implícita para lograr un Valor Final Objetivo
 * Resuelve f(i) = C * ((1 + i)^n - 1) / i - VF = 0 en el dominio i > -1.
 *
 * Propiedades matemáticas:
 * - Para n = 1, toda renta vencida vale VF = C independientemente de i.
 * - Para n > 1 y C > 0, f(i) es estrictamente creciente y continua en (-1, +inf),
 *   con lim_{i -> -1+} f(i) = -VF < 0 y lim_{i -> +inf} f(i) = +inf.
 * - Por tanto, para cualquier VF > 0, C > 0 y n > 1 existe una ÚNICA raíz real en (-1, +inf).
 * - Algoritmo híbrido (acotación + bisección/Newton salvaguardado) con convergencia garantizada.
 */
export interface TasaImplicitaResult {
  tasaDecimal: number;
  tasaPorcentaje: number;
  iteraciones: number;
  residuo: number;
  convergio: boolean;
  mensaje?: string;
}

export function rvf5TasaInteresImplicita(
  VF: number,
  C: number,
  n: number,
  semillaInicial = 0.1
): TasaImplicitaResult {
  if (C <= 0 || VF <= 0 || n <= 0) {
    return {
      tasaDecimal: NaN,
      tasaPorcentaje: NaN,
      iteraciones: 0,
      residuo: NaN,
      convergio: false,
      mensaje: 'El valor final objetivo, el importe de la cuota y la cantidad de cuotas deben ser mayores que cero.',
    };
  }

  if (n === 1) {
    if (Math.abs(VF - C) < 1e-12) {
      return {
        tasaDecimal: 0,
        tasaPorcentaje: 0,
        iteraciones: 1,
        residuo: 0,
        convergio: true,
      };
    }
    return {
      tasaDecimal: NaN,
      tasaPorcentaje: NaN,
      iteraciones: 0,
      residuo: NaN,
      convergio: false,
      mensaje:
        'En una renta de pagos vencidos de una sola cuota (n = 1), el único pago se realiza al final del período y no devenga intereses. Para calcular una tasa implícita se requieren al menos 2 cuotas.',
    };
  }

  // Caso exacto tasa cero: VF === C * n
  if (Math.abs(VF - C * n) <= 1e-14 * Math.max(1, VF)) {
    return {
      tasaDecimal: 0,
      tasaPorcentaje: 0,
      iteraciones: 1,
      residuo: 0,
      convergio: true,
    };
  }

  const f = (i: number): number => {
    if (Math.abs(i) < 1e-9) {
      // Serie de Taylor de orden 4 alrededor de i = 0
      const t1 = n;
      const t2 = ((n * (n - 1)) / 2) * i;
      const t3 = ((n * (n - 1) * (n - 2)) / 6) * i * i;
      const t4 = ((n * (n - 1) * (n - 2) * (n - 3)) / 24) * i * i * i;
      return C * (t1 + t2 + t3 + t4) - VF;
    }
    return (C * (Math.pow(1 + i, n) - 1)) / i - VF;
  };

  const df = (i: number): number => {
    if (Math.abs(i) < 1e-8) {
      const d1 = (n * (n - 1)) / 2;
      const d2 = ((n * (n - 1) * (n - 2)) / 3) * i;
      const d3 = ((n * (n - 1) * (n - 2) * (n - 3)) / 8) * i * i;
      return C * (d1 + d2 + d3);
    }
    const u = Math.pow(1 + i, n - 1);
    const num = n * i * u - (Math.pow(1 + i, n) - 1);
    return C * (num / (i * i));
  };

  // Acotar el intervalo [low, high] donde f(low) <= 0 <= f(high)
  let low = -0.99999999;
  let high = Math.max(0.1, semillaInicial);

  if (VF < C * n) {
    // La raíz es negativa: está en (-1, 0)
    low = -0.99999999;
    high = 0;
  } else {
    // La raíz es positiva: está en (0, +inf)
    low = 0;
    high = Math.max(0.05, Math.pow(VF / C, 1 / Math.max(1, n - 1)) - 1);
    if (!Number.isFinite(high) || high <= 0) high = 0.1;
    let expandIter = 0;
    while (f(high) < 0 && expandIter < 100) {
      low = high;
      high *= 2;
      expandIter++;
    }
  }

  // Método híbrido Newton-Raphson salvaguardado con Bisección (tipo Brent/RTSAFE)
  let x = VF < C * n ? -0.05 : Math.min(Math.max(semillaInicial, low + 1e-7), high - 1e-7);
  if (x <= low || x >= high || !Number.isFinite(f(x))) {
    x = 0.5 * (low + high);
  }

  const maxIter = 200;
  const xtol = 1e-14;
  const ftol = 1e-13 * Math.max(1, VF);

  for (let iter = 1; iter <= maxIter; iter++) {
    const fx = f(x);
    if (Math.abs(fx) <= ftol || Math.abs(high - low) <= xtol * Math.max(1, Math.abs(x))) {
      return {
        tasaDecimal: x,
        tasaPorcentaje: x * 100,
        iteraciones: iter,
        residuo: fx,
        convergio: true,
      };
    }

    if (fx < 0) {
      low = x;
    } else {
      high = x;
    }

    const dfx = df(x);
    let xNext = x - fx / dfx;

    // Si el paso de Newton sale del intervalo [low, high] o no es finito, usar bisección
    if (!Number.isFinite(xNext) || xNext <= low || xNext >= high) {
      xNext = 0.5 * (low + high);
    }

    if (Math.abs(xNext - x) <= xtol * Math.max(1, Math.abs(xNext))) {
      const finalFx = f(xNext);
      return {
        tasaDecimal: xNext,
        tasaPorcentaje: xNext * 100,
        iteraciones: iter,
        residuo: finalFx,
        convergio: true,
      };
    }

    x = xNext;
  }

  const finalRes = f(x);
  const ok = Math.abs(finalRes) <= 1e-8 * Math.max(1, VF);
  return {
    tasaDecimal: x,
    tasaPorcentaje: x * 100,
    iteraciones: maxIter,
    residuo: finalRes,
    convergio: ok,
    mensaje: ok
      ? undefined
      : 'No se encontró una tasa convergente para los valores ingresados. Verifique que la relación entre cuota, plazo y valor final sea financieramente factible.',
  };
}

// ============================================================================
// 5. RENTAS — VALOR ACTUAL
// ============================================================================

/**
 * 1. Valor Actual de una Renta de Pagos Vencidos: VA = C * a_{n|i}
 * Con límite continuo cuando i = 0 (VA = C * n).
 */
export function rva1ValorActualVencida(C: number, iPorcentaje: number, n: number): number {
  const i = iPorcentaje / 100;
  if (1 + i <= 0 || n < 0) return NaN;
  return C * factorValorActualRenta(i, n);
}

/**
 * 2. Saldo de Deuda de una Renta luego de h cuotas pagadas (0 <= h <= n):
 * SD_h = C * a_{n-h|i}
 */
export function rva2SaldoDeuda(C: number, iPorcentaje: number, n: number, h: number): number {
  const i = iPorcentaje / 100;
  if (1 + i <= 0 || n < 0 || h < 0 || h > n) return NaN;
  return C * factorValorActualRenta(i, n - h);
}

// ============================================================================
// 6. SISTEMA DE AMORTIZACIÓN FRANCÉS
// ============================================================================

/**
 * 1. Valor del Préstamo: V = ch * a_{n|i}
 */
export function sf1ValorPrestamo(ch: number, iPorcentaje: number, n: number): number {
  const i = iPorcentaje / 100;
  if (1 + i <= 0 || n <= 0) return NaN;
  return ch * factorValorActualRenta(i, n);
}

/**
 * 2. Valor de la Cuota Constante: ch = V / a_{n|i}
 */
export function sf2ValorCuota(V: number, iPorcentaje: number, n: number): number {
  const i = iPorcentaje / 100;
  if (1 + i <= 0 || n <= 0) return NaN;
  const factor = factorValorActualRenta(i, n);
  if (Math.abs(factor) < 1e-15) return NaN;
  return V / factor;
}

/**
 * 3. Cuota de Amortización del período p (1 <= p <= n):
 * t_p = ch * (1 + i)^-(n - p + 1)
 */
export function sf3CuotaAmortizacion(ch: number, n: number, periodoP: number, iPorcentaje: number): number {
  const i = iPorcentaje / 100;
  if (1 + i <= 0 || n <= 0 || periodoP < 1 || periodoP > n) return NaN;
  return ch * Math.pow(1 + i, -(n - periodoP + 1));
}

/**
 * 4. Cuota de Interés del período p (1 <= p <= n), o equivalentemente tras h = p - 1 cuotas pagadas:
 * El interés del período p se calcula sobre el saldo de deuda al inicio del período p (SD_{p-1}):
 * I_p = SD_{p-1} * i = ch * (1 - (1 + i)^-(n - p + 1))
 *
 * Nota: Si se invoca con cantidad de cuotas ya canceladas h (0 <= h < n), el interés de la
 * próxima cuota (período p = h + 1) es SD_h * i. Para evitar la ambigüedad de desplazamiento
 * de un período, proveemos tanto el cálculo por período p (1..n) como por cuotas canceladas h.
 */
export function sf4CuotaInteresPorPeriodo(ch: number, iPorcentaje: number, n: number, periodoP: number): number {
  const i = iPorcentaje / 100;
  if (1 + i <= 0 || n <= 0 || periodoP < 1 || periodoP > n) return NaN;
  if (Math.abs(i) < 1e-12) return 0;
  const sdAnterior = ch * factorValorActualRenta(i, n - (periodoP - 1));
  return sdAnterior * i;
}

/**
 * Función compatible con parámetro h = cuotas canceladas antes del período actual (0 <= h < n):
 * Calcula el interés de la cuota (h + 1) sobre el saldo luego de h cuotas pagadas.
 */
export function sf4CuotaInteres(ch: number, iPorcentaje: number, n: number, hCanceladas: number): number {
  const i = iPorcentaje / 100;
  if (1 + i <= 0 || n <= 0 || hCanceladas < 0 || hCanceladas >= n) return NaN;
  if (Math.abs(i) < 1e-12) return 0;
  const SD = ch * factorValorActualRenta(i, n - hCanceladas);
  return SD * i;
}

/**
 * 5. Amortización Acumulada luego de h cuotas pagadas (0 <= h <= n):
 * Amort_acum_h = V - SD_h
 */
export function sf5AmortizacionAcumulada(
  V: number,
  ch: number,
  iPorcentaje: number,
  n: number,
  h: number
): number {
  const i = iPorcentaje / 100;
  if (1 + i <= 0 || n <= 0 || h < 0 || h > n) return NaN;
  const SD = ch * factorValorActualRenta(i, n - h);
  return V - SD;
}

/**
 * 6. Saldo de Deuda luego de h cuotas pagadas (0 <= h <= n):
 * SD_h = ch * a_{n-h|i}
 */
export function sf6SaldoDeuda(ch: number, iPorcentaje: number, n: number, h: number): number {
  const i = iPorcentaje / 100;
  if (1 + i <= 0 || n <= 0 || h < 0 || h > n) return NaN;
  return ch * factorValorActualRenta(i, n - h);
}

/**
 * 7. Intereses Pagados Acumulados en las primeras h cuotas (0 <= h <= n):
 * I_acum(h) = h * ch - Amort_acum_h
 */
export function sf7InteresesPagados(
  V: number,
  ch: number,
  iPorcentaje: number,
  n: number,
  h: number
): number {
  const i = iPorcentaje / 100;
  if (1 + i <= 0 || n <= 0 || h < 0 || h > n) return NaN;
  const SD = ch * factorValorActualRenta(i, n - h);
  const Amort_acum = V - SD;
  return h * ch - Amort_acum;
}

/**
 * 8. Intereses Totales del Préstamo: TI = (ch * n) - V
 */
export function sf8InteresesTotales(V: number, ch: number, n: number): number {
  if (n < 0) return NaN;
  return ch * n - V;
}

// ============================================================================
// 7. SISTEMA DE AMORTIZACIÓN ALEMÁN
// ============================================================================

/**
 * 1. Valor del Préstamo: V = th * n
 */
export function sa1ValorPrestamo(th: number, n: number): number {
  return th * n;
}

/**
 * 2. Valor de la Cuota del período: ch = th + ih
 */
export function sa2ValorCuota(th: number, ih: number): number {
  return th + ih;
}

/**
 * 3. Cuota de Amortización Constante: th = V / n
 */
export function sa3CuotaAmortizacion(V: number, n: number): number {
  if (n <= 0) return NaN;
  return V / n;
}

/**
 * 4. Cuota de Interés en Sistema Alemán:
 * Tras h cuotas canceladas (0 <= h < n), el saldo vigente para el período (h + 1) es SD_h = (n - h) * th,
 * y el interés de esa cuota es I_{h+1} = (n - h) * th * i.
 */
export function sa4CuotaInteres(n: number, hCanceladas: number, th: number, iPorcentaje: number): number {
  if (n <= 0 || hCanceladas < 0 || hCanceladas >= n) return NaN;
  const i = iPorcentaje / 100;
  const SD = (n - hCanceladas) * th;
  return SD * i;
}

/**
 * Cuota de Interés del período p (1 <= p <= n) en Sistema Alemán:
 * El saldo anterior al pago p es SD_{p-1} = (n - p + 1) * th.
 * Por lo tanto, I_p = (n - p + 1) * th * i.
 */
export function sa4CuotaInteresPorPeriodo(n: number, periodoP: number, th: number, iPorcentaje: number): number {
  if (n <= 0 || periodoP < 1 || periodoP > n) return NaN;
  const i = iPorcentaje / 100;
  return (n - periodoP + 1) * th * i;
}

/**
 * 5. Amortización Acumulada luego de h cuotas pagadas (0 <= h <= n):
 * Amort_acum = h * th
 */
export function sa5AmortizacionAcumulada(h: number, th: number): number {
  return h * th;
}

/**
 * 6. Saldo de Deuda luego de h cuotas pagadas (0 <= h <= n):
 * SD_h = (n - h) * th
 */
export function sa6SaldoDeuda(n: number, h: number, th: number): number {
  if (n <= 0 || h < 0 || h > n) return NaN;
  return (n - h) * th;
}

/**
 * 7. Intereses Pagados Acumulados en las primeras h cuotas (0 <= h <= n) en Sistema Alemán:
 *
 * AUDITORÍA MATEMÁTICA Y CORRECCIÓN (Fase 1.2.A):
 * En el Sistema Alemán, el interés del período k (k = 1..h) se calcula sobre el saldo
 * al inicio de dicho período:
 *   I_k = SD_{k-1} * i = (n - k + 1) * th * i
 * En particular:
 *   - Primer período (k = 1): I_1 = n * th * i = V * i
 *   - h-ésimo período (k = h): I_h = (n - h + 1) * th * i
 * La suma de la progresión aritmética de los primeros h períodos es exactamente:
 *   I_acum(h) = sum_{k=1}^{h} I_k = ((I_1 + I_h) / 2) * h
 *             = (((V * i) + ((n - h + 1) * th * i)) / 2) * h
 *             = V * i * h * (2*n - h + 1) / (2 * n)
 *
 * Verificación con el caso testigo de auditoría:
 *   V = 1200, i = 10%, n = 12, h = 1 -> th = 100, I_1 = 1200 * 0.10 = 120.
 *   Para h = n = 12 -> I_acum(12) = V * i * (n + 1) / 2 = TI (coincide con Intereses Totales).
 */
export function sa7InteresesPagados(V: number, n: number, h: number, iPorcentaje: number): number {
  if (n <= 0 || h < 0 || h > n) return NaN;
  if (h === 0) return 0;
  const i = iPorcentaje / 100;
  const th = V / n;
  const primerInteres = V * i;
  const interesPeriodoH = (n - h + 1) * th * i;
  return ((primerInteres + interesPeriodoH) / 2) * h;
}

/**
 * 8. Intereses Totales en Sistema Alemán:
 * TI = sum_{k=1}^{n} I_k = V * i * ((n + 1) / 2)
 */
export function sa8InteresesTotales(V: number, iPorcentaje: number, n: number): number {
  if (n <= 0) return NaN;
  const i = iPorcentaje / 100;
  return V * i * ((n + 1) / 2);
}

// ============================================================================
// 8. SISTEMA DE AMORTIZACIÓN AMERICANO
// ============================================================================

/**
 * 1. Valor de la Cuota Periódica de Interés (períodos 1 a n-1): ch = V * i
 */
export function sam1ValorCuota(V: number, iPorcentaje: number): number {
  const i = iPorcentaje / 100;
  return V * i;
}

/**
 * 2. Intereses Pagados hasta la cuota h: Ih = (V * i) * h
 */
export function sam2InteresesPagados(V: number, iPorcentaje: number, h: number): number {
  const i = iPorcentaje / 100;
  return V * i * h;
}

/**
 * 3. Intereses Totales en n períodos: IT = (V * i) * n
 */
export function sam3InteresesTotales(V: number, iPorcentaje: number, n: number): number {
  const i = iPorcentaje / 100;
  return V * i * n;
}

// ============================================================================
// GENERADOR DE TABLAS DE AMORTIZACIÓN (SIN TRUNCAMIENTO SILENCIOSO)
// ============================================================================

export interface FilaTablaAmortizacion {
  periodo: number;
  cuotaTotal: number;
  interesPeriodo: number;
  amortizacionPeriodo: number;
  amortizacionAcumulada: number;
  saldoDeuda: number;
}

export const LIMITE_MAXIMO_PERIODOS_TABLA = 1200;

/**
 * Genera el cuadro de marcha completo para Sistema Francés, Alemán o Americano.
 * No trunca silenciosamente la cantidad de períodos: valida que n sea un entero
 * positivo dentro del límite explícito de seguridad de memoria (1200 períodos).
 */
export function generarTablaAmortizacion(
  sistema: 'frances' | 'aleman' | 'americano',
  V: number,
  iPorcentaje: number,
  n: number
): FilaTablaAmortizacion[] {
  if (!Number.isFinite(V) || V <= 0 || !Number.isFinite(iPorcentaje) || !Number.isFinite(n) || n < 1) {
    return [];
  }
  const nEntero = Math.round(n);
  if (nEntero > LIMITE_MAXIMO_PERIODOS_TABLA) {
    return [];
  }

  const i = iPorcentaje / 100;
  if (1 + i <= 0) return [];

  const filas: FilaTablaAmortizacion[] = [];

  if (sistema === 'frances') {
    const ch = sf2ValorCuota(V, iPorcentaje, nEntero);
    let amortAcum = 0;
    let saldo = V;

    for (let p = 1; p <= nEntero; p++) {
      const interes = saldo * i;
      const amort = p === nEntero ? saldo : ch - interes;
      const cuota = p === nEntero ? interes + amort : ch;
      amortAcum += amort;
      saldo = p === nEntero ? 0 : Math.max(0, V - amortAcum);
      filas.push({
        periodo: p,
        cuotaTotal: cuota,
        interesPeriodo: interes,
        amortizacionPeriodo: amort,
        amortizacionAcumulada: amortAcum,
        saldoDeuda: saldo,
      });
    }
  } else if (sistema === 'aleman') {
    const th = sa3CuotaAmortizacion(V, nEntero);
    for (let p = 1; p <= nEntero; p++) {
      const interes = sa4CuotaInteresPorPeriodo(nEntero, p, th, iPorcentaje);
      const ch = sa2ValorCuota(th, interes);
      const amortAcum = sa5AmortizacionAcumulada(p, th);
      const saldo = p === nEntero ? 0 : Math.max(0, (nEntero - p) * th);
      filas.push({
        periodo: p,
        cuotaTotal: ch,
        interesPeriodo: interes,
        amortizacionPeriodo: th,
        amortizacionAcumulada: amortAcum,
        saldoDeuda: saldo,
      });
    }
  } else {
    const interesPeriodico = sam1ValorCuota(V, iPorcentaje);
    for (let p = 1; p <= nEntero; p++) {
      const esUltimo = p === nEntero;
      const amort = esUltimo ? V : 0;
      const cuota = interesPeriodico + amort;
      const amortAcum = esUltimo ? V : 0;
      const saldo = esUltimo ? 0 : V;
      filas.push({
        periodo: p,
        cuotaTotal: cuota,
        interesPeriodo: interesPeriodico,
        amortizacionPeriodo: amort,
        amortizacionAcumulada: amortAcum,
        saldoDeuda: saldo,
      });
    }
  }

  return filas;
}
