import React, { useState } from 'react';
import { rva1ValorActualVencida, rva2SaldoDeuda } from '../engine/financialEngine';
import { FormatoNumericoConfig, formatearMoneda } from '../utils/formatters';
import { ResultBanner } from './ResultBanner';
import { FinancialChart } from './FinancialChart';

interface RentasValorActualViewProps {
  formato: FormatoNumericoConfig;
}

export const RentasValorActualView: React.FC<RentasValorActualViewProps> = ({ formato }) => {
  const [pregunta, setPregunta] = useState<1 | 2>(1);
  const [C, setC] = useState<number>(1500);
  const [iPct, setIPct] = useState<number>(5);
  const [nCuotas, setNCuotas] = useState<number>(12);
  const [hPagadas, setHPagadas] = useState<number>(5);

  const errorValidacion = React.useMemo(() => {
    if (nCuotas <= 0) {
      return 'La cantidad total de cuotas (n) debe ser mayor que cero.';
    }
    if (iPct <= -100) {
      return 'La tasa periódica de interés (i) debe ser mayor a −100%.';
    }
    if (pregunta === 2) {
      if (hPagadas < 0) {
        return 'La cantidad de cuotas pagadas (h) no puede ser negativa.';
      }
      if (hPagadas > nCuotas) {
        return `La cantidad de cuotas pagadas (h = ${hPagadas}) no puede superar la cantidad total de cuotas de la renta (n = ${nCuotas}).`;
      }
    }
    return null;
  }, [pregunta, nCuotas, iPct, hPagadas]);

  const calculo = React.useMemo(() => {
    if (pregunta === 1) {
      const va = errorValidacion ? 0 : rva1ValorActualVencida(C, iPct, nCuotas);
      const sumaNominal = C * nCuotas;
      return {
        titulo: 'Rentas Valor Actual — 1. Valor Actual de Renta de Pagos Vencidos',
        formula: 'VA = C · ((1 − (1 + i)^(−n)) / i)   (si i = 0, VA = C · n)',
        explicacion:
          'Determina el valor presente equivalente hoy (momento 0) de una serie de n pagos periódicos vencidos constantes de importe C descontados a la tasa efectiva i.',
        etiqueta: 'Valor Actual de la Renta',
        simbolo: 'VA',
        valor: va,
        entradas: [
          { etiqueta: 'Valor de cada cuota (C)', valor: formatearMoneda(C, formato) },
          { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
          { etiqueta: 'Cantidad total de cuotas (n)', valor: `${nCuotas}` },
        ],
        variables: [
          { simbolo: 'C', nombre: 'Cuota periódica', unidad: 'Moneda', descripcion: 'Importe constante pagadero al final de cada período.' },
          { simbolo: 'i', nombre: 'Tasa de interés', unidad: '%', descripcion: 'Tasa efectiva periódica de actualización.' },
          { simbolo: 'n', nombre: 'Cantidad total de cuotas', unidad: 'Cuotas', descripcion: 'Número total de pagos de la renta.' },
        ],
        secundarios: [
          {
            etiqueta: 'Suma nominal de cuotas (C · n)',
            valorFormateado: formatearMoneda(sumaNominal, formato),
            valorExacto: sumaNominal,
          },
          {
            etiqueta: 'Intereses implícitos descontados (C · n − VA)',
            valorFormateado: formatearMoneda(sumaNominal - va, formato),
            valorExacto: sumaNominal - va,
          },
        ],
        grafico: [
          { etiqueta: 'Valor Actual (VA)', valorPrincipal: va },
          { etiqueta: 'Intereses Descontados', valorPrincipal: sumaNominal - va },
          { etiqueta: 'Suma Nominal de Cuotas (C · n)', valorPrincipal: sumaNominal },
        ],
      };
    }

    const sd = errorValidacion ? 0 : rva2SaldoDeuda(C, iPct, nCuotas, hPagadas);
    const vaInicial = errorValidacion ? 0 : rva1ValorActualVencida(C, iPct, nCuotas);
    return {
      titulo: 'Rentas Valor Actual — 2. Saldo de Deuda Prospectivo',
      formula: 'SD_h = C · ((1 − (1 + i)^(−(n − h))) / i)   (si h = n, SD_n = 0)',
      explicacion:
        'Mide el capital pendiente de cancelación inmediatamente después de haber abonado la cuota número h, calculado como el valor actual de las (n − h) cuotas que aún restan por vencer.',
      etiqueta: 'Saldo de Deuda Pendiente',
      simbolo: 'SD',
      valor: sd,
      entradas: [
        { etiqueta: 'Valor de cada cuota (C)', valor: formatearMoneda(C, formato) },
        { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
        { etiqueta: 'Cantidad total de cuotas (n)', valor: `${nCuotas}` },
        { etiqueta: 'Cantidad de cuotas pagadas (h)', valor: `${hPagadas}` },
      ],
      variables: [
        { simbolo: 'C', nombre: 'Valor de las cuotas', unidad: 'Moneda', descripcion: 'Importe periódico constante de cada cuota.' },
        { simbolo: 'i', nombre: 'Tasa de interés', unidad: '%', descripcion: 'Tasa efectiva por período.' },
        { simbolo: 'n', nombre: 'Cantidad total de cuotas', unidad: 'Cuotas', descripcion: 'Total de cuotas pactadas.' },
        { simbolo: 'h', nombre: 'Cuotas ya pagadas', unidad: 'Cuotas', descripcion: 'Cantidad de cuotas abonadas hasta el momento de evaluación (0 ≤ h ≤ n).' },
      ],
      secundarios: [
        {
          etiqueta: 'Valor Actual original en h = 0',
          valorFormateado: formatearMoneda(vaInicial, formato),
          valorExacto: vaInicial,
        },
        {
          etiqueta: 'Capital ya amortizado (VA − SD)',
          valorFormateado: formatearMoneda(vaInicial - sd, formato),
          valorExacto: vaInicial - sd,
        },
      ],
      grafico: errorValidacion
        ? []
        : Array.from({ length: Math.min(13, Math.floor(nCuotas) + 1) }, (_, idx) => ({
            etiqueta: `Tras cuota h = ${idx}`,
            valorPrincipal: rva2SaldoDeuda(C, iPct, nCuotas, idx),
          })),
    };
  }, [pregunta, C, iPct, nCuotas, hPagadas, formato, errorValidacion]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
          Seleccione la operación de Renta — Valor Actual (Actualización):
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPregunta(1)}
            className={`text-left p-3 rounded-lg border transition-colors ${
              pregunta === 1
                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 text-slate-900 dark:text-white'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="text-xs font-semibold">
              1. Valor actual de una renta de pagos vencidos
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Actualización financiera de n cuotas constantes vencidas a tasa efectiva i
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPregunta(2)}
            className={`text-left p-3 rounded-lg border transition-colors ${
              pregunta === 2
                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 text-slate-900 dark:text-white'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="text-xs font-semibold">2. Saldo de deuda (SD)</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Valor actual de las (n − h) cuotas pendientes luego de abonar h pagos (0 ≤ h ≤ n)
            </p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            Parámetros de entrada
          </h3>

          <div>
            <label htmlFor="rva-c" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Valor de cada cuota constante (C)
            </label>
            <input
              id="rva-c"
              type="number"
              step="any"
              value={C}
              onChange={(e) => setC(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label htmlFor="rva-i" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Tasa efectiva periódica (i %)
            </label>
            <input
              id="rva-i"
              type="number"
              step="any"
              value={iPct}
              onChange={(e) => setIPct(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label htmlFor="rva-n" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Cantidad total de cuotas (n)
            </label>
            <input
              id="rva-n"
              type="number"
              step="any"
              value={nCuotas}
              onChange={(e) => setNCuotas(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          {pregunta === 2 && (
            <div>
              <label htmlFor="rva-h" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Cantidad de cuotas ya pagadas (h, entre 0 y n)
              </label>
              <input
                id="rva-h"
                type="number"
                step="any"
                value={hPagadas}
                onChange={(e) => setHPagadas(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6">
          <ResultBanner
            tituloOperacion={calculo.titulo}
            formulaMatematica={calculo.formula}
            explicacionEconomica={calculo.explicacion}
            etiquetaResultadoPrincipal={calculo.etiqueta}
            simboloResultado={calculo.simbolo}
            valorPrincipalExacto={calculo.valor}
            tipoValorPrincipal="moneda"
            formato={formato}
            entradasResumen={calculo.entradas}
            variablesExplicacion={calculo.variables}
            resultadosSecundarios={calculo.secundarios}
            errorValidacion={errorValidacion}
          />

          {!errorValidacion && calculo.grafico && calculo.grafico.length > 0 && (
            <FinancialChart
              titulo={pregunta === 1 ? 'Valor Actual vs. Suma de Cuotas' : 'Curva de Evolución del Saldo de Deuda'}
              subtitulo="Actualización financiera en función de los períodos remanentes"
              etiquetaSeriePrincipal="Saldo / Valor Actual"
              datos={calculo.grafico}
              formato={formato}
            />
          )}
        </div>
      </div>
    </div>
  );
};
