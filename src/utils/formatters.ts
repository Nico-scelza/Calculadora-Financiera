/**
 * UTILIDADES DE FORMATO NUMÉRICO Y EXPORTACIÓN (CSV / IMPRESIÓN PDF)
 * La precisión de cálculo está 100% separada del formato visual.
 */

export interface FormatoNumericoConfig {
  decimalesMonto: number;      // Por defecto 2
  decimalesTasa: number;       // Por defecto 4
  separadorDecimal: ',' | '.'; // Por defecto ',' (estándar ES-AR) o '.'
  simboloMoneda: string;       // Ej. '$', 'USD', 'EUR', ''
  mostrarPrecisionCompleta: boolean;
}

export const FORMATO_POR_DEFECTO: FormatoNumericoConfig = {
  decimalesMonto: 2,
  decimalesTasa: 4,
  separadorDecimal: ',',
  simboloMoneda: '$',
  mostrarPrecisionCompleta: false,
};

export function formatearNumero(
  valor: number,
  decimales: number,
  config: FormatoNumericoConfig
): string {
  if (!Number.isFinite(valor)) {
    return 'Valor no disponible';
  }

  // Evitar "-0,00" por residuos infinitesimales
  const valorLimpio = Math.abs(valor) < 1e-12 ? 0 : valor;

  if (config.mostrarPrecisionCompleta) {
    const raw = valorLimpio.toString();
    return config.separadorDecimal === ',' ? raw.replace('.', ',') : raw;
  }

  const absVal = Math.abs(valorLimpio);
  const signo = valorLimpio < 0 ? '-' : '';
  const partes = absVal.toFixed(decimales).split('.');
  const parteEntera = partes[0];
  const parteDecimal = partes[1] ?? '';

  const sepMiles = config.separadorDecimal === ',' ? '.' : ',';
  const enteroConMiles = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, sepMiles);

  if (decimales === 0) {
    return `${signo}${enteroConMiles}`;
  }
  return `${signo}${enteroConMiles}${config.separadorDecimal}${parteDecimal}`;
}

export function formatearMoneda(valor: number, config: FormatoNumericoConfig): string {
  const numStr = formatearNumero(valor, config.decimalesMonto, config);
  if (!Number.isFinite(valor)) return numStr;
  return config.simboloMoneda ? `${config.simboloMoneda} ${numStr}` : numStr;
}

export function formatearPorcentaje(valorPorcentaje: number, config: FormatoNumericoConfig): string {
  const numStr = formatearNumero(valorPorcentaje, config.decimalesTasa, config);
  if (!Number.isFinite(valorPorcentaje)) return numStr;
  return `${numStr}%`;
}

export function formatearTantoPorUno(valorDecimal: number, config: FormatoNumericoConfig): string {
  return formatearNumero(valorDecimal, Math.max(6, config.decimalesTasa + 2), config);
}

export interface ParametrosExportacionCSV {
  tituloOperacion: string;
  formulaMatematica: string;
  explicacionEconomica?: string;
  entradas: { etiqueta: string; valor: string }[];
  salidas: { etiqueta: string; valorFormateado: string; valorExacto: number }[];
  tablaAmortizacion?: {
    periodo: number;
    cuotaTotal: number;
    interesPeriodo: number;
    amortizacionPeriodo: number;
    amortizacionAcumulada: number;
    saldoDeuda: number;
  }[];
}

/**
 * Construye el contenido CSV limpio y orientado al usuario final (sin referencias internas de desarrollo).
 */
export function generarContenidoCSV(params: ParametrosExportacionCSV): string {
  const lineas: string[] = [];
  const escapar = (texto: string | number) => `"${String(texto).replace(/"/g, '""')}"`;

  lineas.push([escapar('Concepto'), escapar('Valor Formateado'), escapar('Valor Numérico Completo')].join(','));
  lineas.push([escapar('Operación Financiera'), escapar(params.tituloOperacion), escapar('')].join(','));
  lineas.push([escapar('Fórmula Matemática'), escapar(params.formulaMatematica), escapar('')].join(','));
  if (params.explicacionEconomica) {
    lineas.push([escapar('Interpretación Financiera'), escapar(params.explicacionEconomica), escapar('')].join(','));
  }
  lineas.push('');

  lineas.push([escapar('--- DATOS INGRESADOS ---'), escapar(''), escapar('')].join(','));
  for (const e of params.entradas) {
    lineas.push([escapar(e.etiqueta), escapar(e.valor), escapar('')].join(','));
  }
  lineas.push('');

  lineas.push([escapar('--- RESULTADOS DEL CÁLCULO ---'), escapar(''), escapar('')].join(','));
  for (const s of params.salidas) {
    lineas.push([escapar(s.etiqueta), escapar(s.valorFormateado), escapar(s.valorExacto)].join(','));
  }

  if (params.tablaAmortizacion && params.tablaAmortizacion.length > 0) {
    lineas.push('');
    lineas.push([escapar('--- CUADRO DE MARCHA DE AMORTIZACIÓN ---')].join(','));
    lineas.push(
      [
        escapar('Período'),
        escapar('Cuota Total (ch)'),
        escapar('Interés del Período (Ih)'),
        escapar('Amortización de Capital (th)'),
        escapar('Amortización Acumulada'),
        escapar('Saldo de Deuda (SD)'),
      ].join(',')
    );
    for (const fila of params.tablaAmortizacion) {
      lineas.push(
        [
          fila.periodo,
          fila.cuotaTotal,
          fila.interesPeriodo,
          fila.amortizacionPeriodo,
          fila.amortizacionAcumulada,
          fila.saldoDeuda,
        ].join(',')
      );
    }
  }

  return '\uFEFF' + lineas.join('\r\n');
}

/**
 * Exporta un conjunto de resultados y tabla opcional a un archivo CSV descargable en el navegador.
 */
export function exportarResultadoCSV(params: ParametrosExportacionCSV): void {
  const contenido = generarContenidoCSV(params);
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const slug = params.tituloOperacion
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  link.href = url;
  link.setAttribute('download', `calculo_${slug || 'financiero'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
