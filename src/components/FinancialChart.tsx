import React from 'react';
import { FormatoNumericoConfig, formatearMoneda } from '../utils/formatters';

export interface PuntoSerieGrafico {
  etiqueta: string;
  valorPrincipal: number;
  valorSecundario?: number;
}

interface FinancialChartProps {
  titulo: string;
  subtitulo: string;
  etiquetaSeriePrincipal: string;
  etiquetaSerieSecundaria?: string;
  datos: PuntoSerieGrafico[];
  formato: FormatoNumericoConfig;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({
  titulo,
  subtitulo,
  etiquetaSeriePrincipal,
  etiquetaSerieSecundaria,
  datos,
  formato,
}) => {
  if (!datos || datos.length === 0) return null;

  const maxAbsVal = Math.max(
    1,
    ...datos.map((d) =>
      Math.max(Math.abs(d.valorPrincipal), Math.abs(d.valorSecundario ?? 0))
    )
  );

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {titulo}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitulo}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 dark:bg-blue-500 inline-block" />
            {etiquetaSeriePrincipal}
          </span>
          {etiquetaSerieSecundaria && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-teal-600 dark:bg-teal-400 inline-block" />
              {etiquetaSerieSecundaria}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {datos.slice(0, 16).map((item, idx) => {
          const esNegativoPrincipal = item.valorPrincipal < 0;
          const pctPrincipal = Math.max(
            2,
            Math.min(100, (Math.abs(item.valorPrincipal) / maxAbsVal) * 100)
          );
          const pctSecundario =
            item.valorSecundario !== undefined
              ? Math.max(
                  2,
                  Math.min(100, (Math.abs(item.valorSecundario) / maxAbsVal) * 100)
                )
              : 0;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-600 dark:text-slate-400">
                  {item.etiqueta}
                </span>
                <div className="flex items-center gap-3 font-mono tabular-nums">
                  <span
                    className={`font-medium ${
                      esNegativoPrincipal
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {formatearMoneda(item.valorPrincipal, formato)}
                  </span>
                  {item.valorSecundario !== undefined && (
                    <span className="text-teal-700 dark:text-teal-400">
                      {formatearMoneda(item.valorSecundario, formato)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden flex gap-0.5">
                <div
                  style={{ width: `${pctPrincipal}%` }}
                  className={`h-full transition-all duration-150 ${
                    esNegativoPrincipal
                      ? 'bg-rose-600 dark:bg-rose-500'
                      : 'bg-blue-600 dark:bg-blue-500'
                  }`}
                />
                {item.valorSecundario !== undefined && (
                  <div
                    style={{ width: `${pctSecundario}%` }}
                    className="h-full bg-teal-600 dark:bg-teal-400 transition-all duration-150"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
