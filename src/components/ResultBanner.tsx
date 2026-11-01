import React from 'react';
import { Download, Printer, Info } from 'lucide-react';
import {
  FormatoNumericoConfig,
  formatearMoneda,
  formatearPorcentaje,
  formatearTantoPorUno,
  exportarResultadoCSV,
} from '../utils/formatters';
import { VariableExplicacion } from '../engine/traceabilityMatrix';
import { FilaTablaAmortizacion } from '../engine/financialEngine';

export interface ItemResultadoSecundario {
  etiqueta: string;
  valorFormateado: string;
  valorExacto: number;
}

interface ResultBannerProps {
  tituloOperacion: string;
  subtituloOperacion?: string;
  formulaMatematica: string;
  explicacionEconomica?: string;
  etiquetaResultadoPrincipal: string;
  simboloResultado: string;
  valorPrincipalExacto: number;
  tipoValorPrincipal: 'moneda' | 'porcentaje' | 'tanto_por_uno_y_porcentaje';
  formato: FormatoNumericoConfig;
  entradasResumen: { etiqueta: string; valor: string }[];
  variablesExplicacion: VariableExplicacion[];
  resultadosSecundarios?: ItemResultadoSecundario[];
  notaMetodologica?: string;
  tablaAmortizacion?: FilaTablaAmortizacion[];
  errorValidacion?: string | null;
}

export const ResultBanner: React.FC<ResultBannerProps> = ({
  tituloOperacion,
  subtituloOperacion,
  formulaMatematica,
  explicacionEconomica,
  etiquetaResultadoPrincipal,
  simboloResultado,
  valorPrincipalExacto,
  tipoValorPrincipal,
  formato,
  entradasResumen,
  variablesExplicacion,
  resultadosSecundarios = [],
  notaMetodologica,
  tablaAmortizacion,
  errorValidacion,
}) => {
  const valorPrincipalFormateado = React.useMemo(() => {
    if (tipoValorPrincipal === 'moneda') {
      return formatearMoneda(valorPrincipalExacto, formato);
    }
    if (tipoValorPrincipal === 'porcentaje') {
      return formatearPorcentaje(valorPrincipalExacto, formato);
    }
    const tantoPorUno = formatearTantoPorUno(valorPrincipalExacto, formato);
    const pct = formatearPorcentaje(valorPrincipalExacto * 100, formato);
    return `${pct} (${tantoPorUno} en tanto por uno)`;
  }, [valorPrincipalExacto, tipoValorPrincipal, formato]);

  const handleDownloadCSV = () => {
    exportarResultadoCSV({
      tituloOperacion,
      formulaMatematica,
      explicacionEconomica,
      entradas: entradasResumen,
      salidas: [
        {
          etiqueta: `${etiquetaResultadoPrincipal} (${simboloResultado})`,
          valorFormateado: valorPrincipalFormateado,
          valorExacto: valorPrincipalExacto,
        },
        ...resultadosSecundarios,
      ],
      tablaAmortizacion,
    });
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (errorValidacion) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/40 p-5 text-sm text-amber-950 dark:text-amber-200"
      >
        <p className="font-semibold mb-1">Verifique los datos ingresados</p>
        <p className="leading-relaxed">{errorValidacion}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resultado Principal */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
              {tituloOperacion}
            </p>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-1">
              {etiquetaResultadoPrincipal}{' '}
              <span className="font-mono text-slate-500 dark:text-slate-400">({simboloResultado})</span>
            </h3>
            {subtituloOperacion && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtituloOperacion}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 no-print shrink-0">
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={handlePrintPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>
          </div>
        </div>

        <div className="py-5">
          <div
            data-testid="primary-result-value"
            className={`text-3xl sm:text-4xl font-bold tracking-tight font-mono tabular-nums break-words ${
              valorPrincipalExacto < 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-blue-700 dark:text-blue-400'
            }`}
          >
            {valorPrincipalFormateado}
          </div>
          {explicacionEconomica && (
            <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {explicacionEconomica}
            </p>
          )}
        </div>

        {resultadosSecundarios.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resultadosSecundarios.map((sec, idx) => (
              <div key={idx} className="space-y-0.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  {sec.etiqueta}
                </span>
                <span className="text-sm font-semibold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {sec.valorFormateado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fórmula matemática y glosario de variables */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Fórmula financiera aplicada
          </h4>
          <pre className="mt-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto">
            {formulaMatematica}
          </pre>
        </div>

        {variablesExplicacion.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
              Referencias de variables y unidades
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {variablesExplicacion.map((v, i) => (
                <div key={i} className="py-2 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <span className="font-mono font-semibold text-blue-700 dark:text-blue-400 w-24 shrink-0">
                    {v.simbolo}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 w-48 shrink-0">
                    {v.nombre} ({v.unidad})
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {v.descripcion}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {notaMetodologica && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-lg flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Nota financiera: </span>
              {notaMetodologica}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
