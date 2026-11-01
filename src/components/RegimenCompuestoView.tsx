import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  rcInteresTotal,
  rcCapitalInvertido,
  rcTasaInteres,
  rcMontoFinal,
  rcValorDescontado,
  rcValorActual,
  rcDescuentoTotal,
  rcResultadoFinanciero,
  TasaPeriodoSimple,
} from '../engine/financialEngine';
import { FormatoNumericoConfig, formatearMoneda } from '../utils/formatters';
import { ResultBanner } from './ResultBanner';
import { FinancialChart } from './FinancialChart';

type SubOperacionRC = 'm' | 'i' | 'c' | 'y' | 'vd' | 'va' | 'd' | 'rf';

const OPCIONES_RC: { id: SubOperacionRC; codigo: string; nombre: string; desc: string }[] = [
  { id: 'm', codigo: 'M', nombre: 'Monto Final', desc: 'Capitalización compuesta con tasa fija o variable' },
  { id: 'i', codigo: 'I', nombre: 'Interés Total', desc: 'Interés compuesto devengado (M − C)' },
  { id: 'c', codigo: 'C', nombre: 'Capital Invertido', desc: 'Capital inicial actualizado M / (1 + i)^n' },
  { id: 'y', codigo: 'i', nombre: 'Tasa de Interés', desc: 'Tasa efectiva periódica ((M/C)^(1/n) − 1) · 100' },
  { id: 'vd', codigo: 'VD', nombre: 'Valor Descontado', desc: 'Descuento compuesto comercial N · (1 − d)^n' },
  { id: 'va', codigo: 'VA', nombre: 'Valor Actual', desc: 'Actualización compuesta N / (1 + i)^n' },
  { id: 'd', codigo: 'D', nombre: 'Descuento Total', desc: 'Quita compuesta acumulada N · (1 − (1 − d)^n)' },
  { id: 'rf', codigo: 'RF', nombre: 'Resultado Financiero', desc: 'Diferencia neta entre valor descontado y original' },
];

interface RegimenCompuestoViewProps {
  formato: FormatoNumericoConfig;
}

export const RegimenCompuestoView: React.FC<RegimenCompuestoViewProps> = ({ formato }) => {
  const [subOp, setSubOp] = useState<SubOperacionRC>('m');

  const [C, setC] = useState<number>(10000);
  const [M, setM] = useState<number>(12155.0625);
  const [N, setN] = useState<number>(15000);
  const [iPct, setIPct] = useState<number>(5);
  const [dPct, setDPct] = useState<number>(4);
  const [nPeriodos, setNPeriodos] = useState<number>(4);
  const [VD, setVD] = useState<number>(13500);
  const [Vi, setVi] = useState<number>(12000);

  const [cambioTasa, setCambioTasa] = useState<boolean>(false);
  const [tramos, setTramos] = useState<TasaPeriodoSimple[]>([
    { tasaPorcentaje: 5, periodos: 2 },
    { tasaPorcentaje: 8, periodos: 2 },
  ]);

  const agregarTramo = () => {
    setTramos([...tramos, { tasaPorcentaje: 6, periodos: 2 }]);
  };

  const eliminarTramo = (idx: number) => {
    if (tramos.length <= 1) return;
    setTramos(tramos.filter((_, i) => i !== idx));
  };

  const calculo = React.useMemo(() => {
    switch (subOp) {
      case 'i': {
        const res = rcInteresTotal(C, M);
        return {
          titulo: 'Régimen Compuesto — Interés Total',
          formula: 'I = M − C',
          explicacion:
            'Determina la ganancia total por intereses compuestos acumulados al finalizar la operación, restando el capital inicial del monto final obtenido.',
          etiqueta: 'Interés Compuesto Total',
          simbolo: 'I',
          valor: res,
          tipo: 'moneda' as const,
          errorValidacion: null,
          entradas: [
            { etiqueta: 'Capital invertido (C)', valor: formatearMoneda(C, formato) },
            { etiqueta: 'Monto recibido al final (M)', valor: formatearMoneda(M, formato) },
          ],
          variables: [
            { simbolo: 'C', nombre: 'Capital invertido', unidad: 'Moneda', descripcion: 'Importe inicial colocado.' },
            { simbolo: 'M', nombre: 'Monto recibido', unidad: 'Moneda', descripcion: 'Monto final capitalizado.' },
          ],
          secundarios: [],
          grafico: [
            { etiqueta: 'Capital Inicial (C)', valorPrincipal: C },
            { etiqueta: 'Interés Compuesto (I)', valorPrincipal: res },
            { etiqueta: 'Monto Final (M)', valorPrincipal: M },
          ],
        };
      }
      case 'c': {
        const errorC =
          nPeriodos < 0
            ? 'La cantidad de períodos (n) debe ser mayor o igual a cero.'
            : iPct <= -100
            ? 'La tasa periódica de interés (i) debe ser mayor a −100%.'
            : null;
        const res = errorC ? 0 : rcCapitalInvertido(M, iPct, nPeriodos);
        return {
          titulo: 'Régimen Compuesto — Capital Invertido',
          formula: 'C = M / (1 + i)^n',
          explicacion:
            'Calcula el capital inicial que, capitalizado periódicamente a la tasa efectiva i durante n períodos, permite alcanzar el monto final M.',
          etiqueta: 'Capital Inicial Necesario',
          simbolo: 'C',
          valor: res,
          tipo: 'moneda' as const,
          errorValidacion: errorC,
          entradas: [
            { etiqueta: 'Monto recibido al final (M)', valor: formatearMoneda(M, formato) },
            { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
            { etiqueta: 'Cantidad de períodos (n)', valor: `${nPeriodos}` },
          ],
          variables: [
            { simbolo: 'M', nombre: 'Monto final', unidad: 'Moneda', descripcion: 'Monto recibido al final de la operación.' },
            { simbolo: 'i', nombre: 'Tasa de interés', unidad: '%', descripcion: 'Tasa efectiva periódica.' },
            { simbolo: 'n', nombre: 'Períodos', unidad: 'Períodos', descripcion: 'Número de períodos de capitalización.' },
          ],
          secundarios: [
            {
              etiqueta: 'Intereses compuestos (M − C)',
              valorFormateado: formatearMoneda(M - res, formato),
              valorExacto: M - res,
            },
          ],
          grafico: [
            { etiqueta: 'Capital Invertido (C)', valorPrincipal: res },
            { etiqueta: 'Intereses Compuestos (I)', valorPrincipal: M - res },
            { etiqueta: 'Monto Final (M)', valorPrincipal: M },
          ],
        };
      }
      case 'y': {
        const errorY =
          C <= 0 || M <= 0
            ? 'El capital inicial (C) y el monto final (M) deben ser mayores que cero para calcular la tasa compuesta.'
            : nPeriodos <= 0
            ? 'La cantidad de períodos (n) debe ser mayor que cero.'
            : null;
        const res = errorY ? 0 : rcTasaInteres(M, C, nPeriodos);
        return {
          titulo: 'Régimen Compuesto — Tasa de Interés Efectiva Periódica',
          formula: 'i = ((M / C)^(1 / n) − 1) · 100',
          explicacion:
            'Determina la tasa efectiva de interés por período (rendimiento geométrico constante por unidad de tiempo) que transforma el capital C en el monto M al cabo de n capitalizaciones.',
          etiqueta: 'Tasa Efectiva Periódica',
          simbolo: 'i',
          valor: res,
          tipo: 'porcentaje' as const,
          errorValidacion: errorY,
          entradas: [
            { etiqueta: 'Monto recibido al final (M)', valor: formatearMoneda(M, formato) },
            { etiqueta: 'Capital invertido (C)', valor: formatearMoneda(C, formato) },
            { etiqueta: 'Cantidad de períodos (n)', valor: `${nPeriodos}` },
          ],
          variables: [
            { simbolo: 'M', nombre: 'Monto recibido', unidad: 'Moneda', descripcion: 'Importe final capitalizado.' },
            { simbolo: 'C', nombre: 'Capital invertido', unidad: 'Moneda', descripcion: 'Importe inicial colocado.' },
            { simbolo: 'n', nombre: 'Cantidad de períodos', unidad: 'Períodos', descripcion: 'Número de capitalizaciones.' },
          ],
          secundarios: [
            {
              etiqueta: 'Interés compuesto devengado (M − C)',
              valorFormateado: formatearMoneda(M - C, formato),
              valorExacto: M - C,
            },
          ],
          grafico: [
            { etiqueta: 'Capital Inicial (C)', valorPrincipal: C },
            { etiqueta: 'Interés Compuesto (M − C)', valorPrincipal: M - C },
            { etiqueta: 'Monto Final (M)', valorPrincipal: M },
          ],
        };
      }
      case 'm': {
        const errorM =
          C < 0
            ? 'El capital inicial (C) no puede ser negativo.'
            : !cambioTasa && nPeriodos < 0
            ? 'La cantidad de períodos (n) debe ser mayor o igual a cero.'
            : !cambioTasa && iPct <= -100
            ? 'La tasa de interés (i) debe ser mayor a −100%.'
            : null;
        const res = errorM
          ? { montoFinal: 0, evolucionTramos: [] }
          : rcMontoFinal({
              C,
              cambioTasa,
              iPorcentaje: iPct,
              n: nPeriodos,
              tramos,
            });

        const serieEvolucion: { etiqueta: string; valorPrincipal: number }[] = [];
        if (!errorM) {
          if (!cambioTasa) {
            const pasos = Math.min(12, Math.max(1, Math.floor(nPeriodos)));
            for (let p = 0; p <= pasos; p++) {
              serieEvolucion.push({
                etiqueta: `Período ${p}`,
                valorPrincipal: C * Math.pow(1 + iPct / 100, p),
              });
            }
          } else {
            res.evolucionTramos.forEach((v, idx) => {
              serieEvolucion.push({
                etiqueta: idx === 0 ? 'Capital Inicial' : `Fin Tramo ${idx}`,
                valorPrincipal: v,
              });
            });
          }
        }

        return {
          titulo: `Régimen Compuesto — Monto Final (${cambioTasa ? 'Tasas variables por tramo' : 'Tasa constante'})`,
          formula: cambioTasa
            ? 'M = C · ∏ (1 + i_k)^(n_k)'
            : 'M = C · (1 + i)^n',
          explicacion:
            'En el régimen compuesto, los intereses generados en cada período se incorporan al capital para devengar nuevos intereses en los períodos siguientes.',
          etiqueta: 'Monto Final Compuesto',
          simbolo: 'M',
          valor: res.montoFinal,
          tipo: 'moneda' as const,
          errorValidacion: errorM,
          entradas: [
            { etiqueta: 'Capital invertido (C)', valor: formatearMoneda(C, formato) },
            {
              etiqueta: cambioTasa ? 'Esquema de tasas' : 'Tasa y plazo',
              valor: cambioTasa ? `${tramos.length} tramos sucesivos` : `${iPct}% durante ${nPeriodos} períodos`,
            },
          ],
          variables: [
            { simbolo: 'C', nombre: 'Capital invertido', unidad: 'Moneda', descripcion: 'Capital inicial.' },
            { simbolo: 'i', nombre: 'Tasa efectiva', unidad: '%', descripcion: 'Tasa periódica de capitalización.' },
            { simbolo: 'n', nombre: 'Períodos', unidad: 'Períodos', descripcion: 'Cantidad de períodos de capitalización.' },
          ],
          secundarios: [
            {
              etiqueta: 'Interés compuesto acumulado (M − C)',
              valorFormateado: formatearMoneda(res.montoFinal - C, formato),
              valorExacto: res.montoFinal - C,
            },
          ],
          grafico: serieEvolucion,
        };
      }
      case 'vd': {
        const errorVD =
          nPeriodos < 0
            ? 'La cantidad de períodos (n) debe ser mayor o igual a cero.'
            : dPct < 0 || dPct >= 100
            ? 'La tasa de descuento adelantada (d) debe ubicarse entre 0% y menos de 100%.'
            : null;
        const res = errorVD ? 0 : rcValorDescontado(N, dPct, nPeriodos);
        return {
          titulo: 'Régimen Compuesto — Valor Descontado',
          formula: 'VD = N · (1 − d)^n',
          explicacion:
            'Determina el valor líquido presente de un documento de valor nominal N aplicando descuento compuesto a tasa adelantada periódica d durante n períodos.',
          etiqueta: 'Valor Descontado Compuesto',
          simbolo: 'VD',
          valor: res,
          tipo: 'moneda' as const,
          errorValidacion: errorVD,
          entradas: [
            { etiqueta: 'Valor nominal (N)', valor: formatearMoneda(N, formato) },
            { etiqueta: 'Tasa de descuento adelantada (d)', valor: `${dPct}%` },
            { etiqueta: 'Períodos de anticipación (n)', valor: `${nPeriodos}` },
          ],
          variables: [
            { simbolo: 'N', nombre: 'Valor nominal', unidad: 'Moneda', descripcion: 'Valor nominal futuro del documento.' },
            { simbolo: 'd', nombre: 'Tasa de descuento', unidad: '%', descripcion: 'Tasa adelantada periódica.' },
            { simbolo: 'n', nombre: 'Cantidad de períodos', unidad: 'Períodos', descripcion: 'Plazo de anticipación.' },
          ],
          secundarios: [
            {
              etiqueta: 'Descuento compuesto practicado (N − VD)',
              valorFormateado: formatearMoneda(N - res, formato),
              valorExacto: N - res,
            },
          ],
          grafico: [
            { etiqueta: 'Valor Nominal (N)', valorPrincipal: N },
            { etiqueta: 'Descuento Compuesto (D)', valorPrincipal: N - res },
            { etiqueta: 'Valor Descontado (VD)', valorPrincipal: res },
          ],
        };
      }
      case 'va': {
        const errorVA =
          nPeriodos < 0
            ? 'La cantidad de períodos (n) debe ser mayor o igual a cero.'
            : iPct <= -100
            ? 'La tasa de interés (i) debe ser mayor a −100%.'
            : null;
        const res = errorVA ? 0 : rcValorActual(N, iPct, nPeriodos);
        return {
          titulo: 'Régimen Compuesto — Valor Actual',
          formula: 'VA = N / (1 + i)^n',
          explicacion:
            'Calcula el valor presente equivalente de un importe futuro N actualizándolo de manera compuesta con una tasa vencida periódica i durante n períodos.',
          etiqueta: 'Valor Actual Compuesto',
          simbolo: 'VA',
          valor: res,
          tipo: 'moneda' as const,
          errorValidacion: errorVA,
          entradas: [
            { etiqueta: 'Valor nominal futuro (N)', valor: formatearMoneda(N, formato) },
            { etiqueta: 'Tasa efectiva vencida (i)', valor: `${iPct}%` },
            { etiqueta: 'Cantidad de períodos (n)', valor: `${nPeriodos}` },
          ],
          variables: [
            { simbolo: 'N', nombre: 'Valor nominal', unidad: 'Moneda', descripcion: 'Monto futuro a actualizar.' },
            { simbolo: 'i', nombre: 'Tasa de interés', unidad: '%', descripcion: 'Tasa vencida de actualización.' },
            { simbolo: 'n', nombre: 'Cantidad de períodos', unidad: 'Períodos', descripcion: 'Número de períodos de actualización.' },
          ],
          secundarios: [
            {
              etiqueta: 'Descuento racional compuesto (N − VA)',
              valorFormateado: formatearMoneda(N - res, formato),
              valorExacto: N - res,
            },
          ],
          grafico: [
            { etiqueta: 'Valor Nominal (N)', valorPrincipal: N },
            { etiqueta: 'Descuento Racional (N − VA)', valorPrincipal: N - res },
            { etiqueta: 'Valor Actual (VA)', valorPrincipal: res },
          ],
        };
      }
      case 'd': {
        const errorD =
          nPeriodos < 0
            ? 'La cantidad de períodos (n) debe ser mayor o igual a cero.'
            : dPct < 0 || dPct >= 100
            ? 'La tasa de descuento adelantada (d) debe ubicarse entre 0% y menos de 100%.'
            : null;
        const res = errorD ? 0 : rcDescuentoTotal(N, dPct, nPeriodos);
        return {
          titulo: 'Régimen Compuesto — Descuento Total',
          formula: 'D = N · (1 − (1 − d)^n)',
          explicacion:
            'Mide la reducción monetaria total practicada sobre el valor nominal N bajo régimen de descuento compuesto con tasa adelantada d durante n períodos.',
          etiqueta: 'Descuento Total Compuesto',
          simbolo: 'D',
          valor: res,
          tipo: 'moneda' as const,
          errorValidacion: errorD,
          entradas: [
            { etiqueta: 'Valor nominal (N)', valor: formatearMoneda(N, formato) },
            { etiqueta: 'Tasa de descuento (d)', valor: `${dPct}%` },
            { etiqueta: 'Cantidad de períodos (n)', valor: `${nPeriodos}` },
          ],
          variables: [
            { simbolo: 'N', nombre: 'Valor nominal', unidad: 'Moneda', descripcion: 'Importe nominal futuro.' },
            { simbolo: 'd', nombre: 'Tasa de descuento', unidad: '%', descripcion: 'Tasa de descuento compuesto.' },
            { simbolo: 'n', nombre: 'Cantidad de períodos', unidad: 'Períodos', descripcion: 'Períodos de anticipación.' },
          ],
          secundarios: [
            {
              etiqueta: 'Valor Descontado Líquido (VD = N − D)',
              valorFormateado: formatearMoneda(N - res, formato),
              valorExacto: N - res,
            },
          ],
          grafico: [
            { etiqueta: 'Valor Nominal (N)', valorPrincipal: N },
            { etiqueta: 'Descuento Compuesto (D)', valorPrincipal: res },
            { etiqueta: 'Valor Descontado (N − D)', valorPrincipal: N - res },
          ],
        };
      }
      case 'rf': {
        const res = rcResultadoFinanciero(VD, Vi);
        return {
          titulo: 'Régimen Compuesto — Resultado Financiero',
          formula: 'RF = VD − Vi',
          explicacion:
            'Expresa el resultado neto de la operación al comparar el valor descontado obtenido (VD) frente al valor original de referencia (Vi).',
          etiqueta: 'Resultado Financiero Neto',
          simbolo: 'RF',
          valor: res,
          tipo: 'moneda' as const,
          errorValidacion: null,
          entradas: [
            { etiqueta: 'Valor descontado (VD)', valor: formatearMoneda(VD, formato) },
            { etiqueta: 'Valor original (Vi)', valor: formatearMoneda(Vi, formato) },
          ],
          variables: [
            { simbolo: 'VD', nombre: 'Valor descontado', unidad: 'Moneda', descripcion: 'Valor descontado de la operación.' },
            { simbolo: 'Vi', nombre: 'Valor original', unidad: 'Moneda', descripcion: 'Valor original de la operación.' },
          ],
          secundarios: [],
          grafico: [
            { etiqueta: 'Valor Original (Vi)', valorPrincipal: Vi },
            { etiqueta: 'Valor Descontado (VD)', valorPrincipal: VD },
            { etiqueta: 'Resultado Financiero (RF)', valorPrincipal: res },
          ],
        };
      }
    }
  }, [subOp, C, M, N, iPct, dPct, nPeriodos, VD, Vi, cambioTasa, tramos, formato]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
          Seleccione la magnitud que desea calcular en Régimen Compuesto:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {OPCIONES_RC.map((op) => {
            const activo = subOp === op.id;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => setSubOp(op.id)}
                className={`text-left p-2.5 rounded-lg border transition-colors ${
                  activo
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{op.nombre}</span>
                  <span className="text-xs font-mono font-semibold text-blue-700 dark:text-blue-400">
                    {op.codigo}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {op.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            Datos de la operación
          </h3>

          {(subOp === 'i' || subOp === 'm' || subOp === 'y') && (
            <div>
              <label htmlFor="rc-capital" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Capital invertido (C)
              </label>
              <input
                id="rc-capital"
                type="number"
                step="any"
                value={C}
                onChange={(e) => setC(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}

          {(subOp === 'i' || subOp === 'c' || subOp === 'y') && (
            <div>
              <label htmlFor="rc-monto" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Monto recibido al final (M)
              </label>
              <input
                id="rc-monto"
                type="number"
                step="any"
                value={M}
                onChange={(e) => setM(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}

          {(subOp === 'vd' || subOp === 'va' || subOp === 'd') && (
            <div>
              <label htmlFor="rc-nominal" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Valor nominal (N)
              </label>
              <input
                id="rc-nominal"
                type="number"
                step="any"
                value={N}
                onChange={(e) => setN(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}

          {(subOp === 'c' || subOp === 'va' || (subOp === 'm' && !cambioTasa)) && (
            <div>
              <label htmlFor="rc-tasa-i" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Tasa efectiva de interés (i %)
              </label>
              <input
                id="rc-tasa-i"
                type="number"
                step="any"
                value={iPct}
                onChange={(e) => setIPct(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}

          {(subOp === 'vd' || subOp === 'd') && (
            <div>
              <label htmlFor="rc-tasa-d" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Tasa adelantada de descuento (d %)
              </label>
              <input
                id="rc-tasa-d"
                type="number"
                step="any"
                value={dPct}
                onChange={(e) => setDPct(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}

          {(subOp === 'c' || subOp === 'y' || subOp === 'vd' || subOp === 'va' || subOp === 'd' || (subOp === 'm' && !cambioTasa)) && (
            <div>
              <label htmlFor="rc-periodos" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Cantidad de períodos (n)
              </label>
              <input
                id="rc-periodos"
                type="number"
                step="any"
                value={nPeriodos}
                onChange={(e) => setNPeriodos(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}

          {subOp === 'rf' && (
            <>
              <div>
                <label htmlFor="rc-vd-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Valor descontado de la operación (VD)
                </label>
                <input
                  id="rc-vd-input"
                  type="number"
                  step="any"
                  value={VD}
                  onChange={(e) => setVD(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label htmlFor="rc-vi-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Valor original de la operación (Vi)
                </label>
                <input
                  id="rc-vi-input"
                  type="number"
                  step="any"
                  value={Vi}
                  onChange={(e) => setVi(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </>
          )}

          {subOp === 'm' && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cambioTasa}
                  onChange={(e) => setCambioTasa(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                ¿Hay cambios de tasa durante la operación?
              </label>

              {cambioTasa && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Tramos sucesivos de capitalización ({tramos.length})
                    </span>
                    <button
                      type="button"
                      onClick={agregarTramo}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar tramo
                    </button>
                  </div>
                  {tramos.map((t, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <label className="block text-[11px] text-slate-500 mb-1">Tasa {idx + 1} (%)</label>
                        <input
                          type="number"
                          step="any"
                          aria-label={`Tasa compuesta ${idx + 1}`}
                          value={t.tasaPorcentaje}
                          onChange={(e) => {
                            const copia = [...tramos];
                            copia[idx] = { ...copia[idx], tasaPorcentaje: parseFloat(e.target.value) || 0 };
                            setTramos(copia);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                        />
                      </div>
                      <div className="col-span-5">
                        <label className="block text-[11px] text-slate-500 mb-1">Períodos {idx + 1}</label>
                        <input
                          type="number"
                          step="any"
                          aria-label={`Períodos compuestos ${idx + 1}`}
                          value={t.periodos}
                          onChange={(e) => {
                            const copia = [...tramos];
                            copia[idx] = { ...copia[idx], periodos: parseFloat(e.target.value) || 0 };
                            setTramos(copia);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button
                          type="button"
                          aria-label={`Eliminar tramo ${idx + 1}`}
                          onClick={() => eliminarTramo(idx)}
                          disabled={tramos.length <= 1}
                          className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
            tipoValorPrincipal={calculo.tipo}
            formato={formato}
            entradasResumen={calculo.entradas}
            variablesExplicacion={calculo.variables}
            resultadosSecundarios={calculo.secundarios}
            errorValidacion={calculo.errorValidacion}
          />

          {!calculo.errorValidacion && calculo.grafico && calculo.grafico.length > 0 && (
            <FinancialChart
              titulo="Curva de Capitalización y Evolución en Régimen Compuesto"
              subtitulo="Crecimiento exponencial del capital por período o tramo"
              etiquetaSeriePrincipal="Capital acumulado"
              datos={calculo.grafico}
              formato={formato}
            />
          )}
        </div>
      </div>
    </div>
  );
};
