import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  rsInteresTotal,
  rsMontoFinal,
  rsCapitalInvertido,
  rsTasaInteres,
  rsTasaTotalOperacion,
  rsValorDescontado,
  rsValorActual,
  rsDescuentoTotal,
  rsResultadoFinanciero,
  TasaPeriodoSimple,
  EtapaCapitalizacionSimple,
} from '../engine/financialEngine';
import { FormatoNumericoConfig, formatearMoneda, formatearPorcentaje } from '../utils/formatters';
import { ResultBanner } from './ResultBanner';
import { FinancialChart } from './FinancialChart';

type SubOperacionRS = 'm' | 'i' | 'c' | 'y' | 'vd' | 'va' | 'd' | 'rf';

const OPCIONES_RS: { id: SubOperacionRS; codigo: string; nombre: string; desc: string }[] = [
  { id: 'm', codigo: 'M', nombre: 'Monto Final', desc: 'Capital más intereses acumulados (con o sin tramos)' },
  { id: 'i', codigo: 'I', nombre: 'Interés Total', desc: 'Ganancia financiera nominal (M − C)' },
  { id: 'c', codigo: 'C', nombre: 'Capital Invertido', desc: 'Importe inicial necesario para alcanzar un monto' },
  { id: 'y', codigo: 'i / R', nombre: 'Tasa de Interés', desc: 'Tasa periódica simple y rendimiento total de la operación' },
  { id: 'vd', codigo: 'VD', nombre: 'Valor Descontado', desc: 'Valor líquido con descuento comercial simple' },
  { id: 'va', codigo: 'VA', nombre: 'Valor Actual', desc: 'Valor presente con descuento racional o matemático' },
  { id: 'd', codigo: 'D', nombre: 'Descuento Total', desc: 'Importe descontado comercialmente sobre el valor nominal' },
  { id: 'rf', codigo: 'RF', nombre: 'Resultado Financiero', desc: 'Diferencia entre valor descontado y valor original' },
];

interface RegimenSimpleViewProps {
  formato: FormatoNumericoConfig;
}

export const RegimenSimpleView: React.FC<RegimenSimpleViewProps> = ({ formato }) => {
  const [subOp, setSubOp] = useState<SubOperacionRS>('m');

  const [C, setC] = useState<number>(10000);
  const [M, setM] = useState<number>(12500);
  const [N, setN] = useState<number>(15000);
  const [iPct, setIPct] = useState<number>(5);
  const [dPct, setDPct] = useState<number>(4);
  const [nPeriodos, setNPeriodos] = useState<number>(4);
  const [VD, setVD] = useState<number>(13200);
  const [Vi, setVi] = useState<number>(12000);

  const [cambioTasa, setCambioTasa] = useState<boolean>(false);
  const [capitalizacion, setCapitalizacion] = useState<boolean>(false);
  const [tramosIniciales, setTramosIniciales] = useState<TasaPeriodoSimple[]>([
    { tasaPorcentaje: 5, periodos: 2 },
    { tasaPorcentaje: 7, periodos: 3 },
  ]);
  const [etapasCap, setEtapasCap] = useState<EtapaCapitalizacionSimple[]>([
    {
      cambioTasa: false,
      tasaPorcentaje: 6,
      periodos: 2,
      tramos: [
        { tasaPorcentaje: 4, periodos: 2 },
        { tasaPorcentaje: 6, periodos: 2 },
      ],
    },
  ]);

  const agregarTramoInicial = () => {
    setTramosIniciales([...tramosIniciales, { tasaPorcentaje: 5, periodos: 1 }]);
  };

  const eliminarTramoInicial = (idx: number) => {
    if (tramosIniciales.length <= 1) return;
    setTramosIniciales(tramosIniciales.filter((_, i) => i !== idx));
  };

  const agregarEtapaCap = () => {
    setEtapasCap([
      ...etapasCap,
      {
        cambioTasa: false,
        tasaPorcentaje: 5,
        periodos: 2,
        tramos: [{ tasaPorcentaje: 5, periodos: 2 }],
      },
    ]);
  };

  const eliminarEtapaCap = (idx: number) => {
    if (etapasCap.length <= 1) return;
    setEtapasCap(etapasCap.filter((_, i) => i !== idx));
  };

  const calculo = React.useMemo(() => {
    switch (subOp) {
      case 'i': {
        const res = rsInteresTotal(C, M);
        return {
          titulo: 'Régimen Simple — Interés Total',
          formula: 'I = M − C',
          explicacion:
            'Representa el incremento nominal absoluto obtenido al comparar el monto final cobrado con el capital originalmente invertido.',
          etiqueta: 'Interés Total Devengado',
          simbolo: 'I',
          valor: res,
          tipo: 'moneda' as const,
          errorValidacion: null,
          entradas: [
            { etiqueta: 'Capital invertido (C)', valor: formatearMoneda(C, formato) },
            { etiqueta: 'Monto recibido al final (M)', valor: formatearMoneda(M, formato) },
          ],
          variables: [
            { simbolo: 'C', nombre: 'Capital invertido', unidad: 'Moneda', descripcion: 'Importe original colocado al inicio de la operación.' },
            { simbolo: 'M', nombre: 'Monto recibido', unidad: 'Moneda', descripcion: 'Importe total percibido al vencimiento.' },
            { simbolo: 'I', nombre: 'Interés total', unidad: 'Moneda', descripcion: 'Diferencia nominal entre el monto final y el capital inicial.' },
          ],
          secundarios: [],
          grafico: [
            { etiqueta: 'Capital Invertido (C)', valorPrincipal: C },
            { etiqueta: 'Interés Total (I)', valorPrincipal: res },
            { etiqueta: 'Monto Recibido (M)', valorPrincipal: M },
          ],
        };
      }
      case 'm': {
        const errorM =
          C < 0
            ? 'El capital inicial (C) no puede ser negativo.'
            : !cambioTasa && nPeriodos < 0
            ? 'La cantidad de períodos (n) debe ser mayor o igual a cero.'
            : null;
        const res = rsMontoFinal({
          C,
          cambioTasa,
          capitalizacion,
          iPorcentaje: iPct,
          n: nPeriodos,
          tramosIniciales,
          etapasCapitalizacion: etapasCap,
        });
        const modalidadTexto = !cambioTasa && !capitalizacion
          ? 'Tasa constante sin capitalización intermedia'
          : cambioTasa && !capitalizacion
          ? 'Tasas variables por tramos sobre capital inicial'
          : !cambioTasa && capitalizacion
          ? 'Con etapas de capitalización intermedia'
          : 'Tasas variables y etapas de capitalización intermedia';
        return {
          titulo: `Régimen Simple — Monto Final (${modalidadTexto})`,
          formula:
            !cambioTasa && !capitalizacion
              ? 'M = C · (1 + i · n)'
              : cambioTasa && !capitalizacion
              ? 'M = C + ∑ (C · i_k · n_k)'
              : 'M_k = M_{k-1} · (1 + ∑ i_{k,j} · n_{k,j})',
          explicacion:
            'Determina el capital final acumulado al término del plazo bajo interés simple, adicionando los intereses devengados en cada tramo o etapa de capitalización pactada.',
          etiqueta: 'Monto Final Acumulado',
          simbolo: 'M',
          valor: res.montoFinal,
          tipo: 'moneda' as const,
          errorValidacion: errorM,
          entradas: [
            { etiqueta: 'Capital invertido (C)', valor: formatearMoneda(C, formato) },
            { etiqueta: 'Modalidad de cálculo', valor: modalidadTexto },
          ],
          variables: [
            { simbolo: 'C', nombre: 'Capital invertido', unidad: 'Moneda', descripcion: 'Capital inicial de la colocación.' },
            { simbolo: 'i', nombre: 'Tasa periódica simple', unidad: '%', descripcion: 'Tasa de interés proporcional por período.' },
            { simbolo: 'n', nombre: 'Cantidad de períodos', unidad: 'Períodos', descripcion: 'Plazo de vigencia de cada tasa.' },
          ],
          secundarios: [
            {
              etiqueta: 'Interés total devengado (M − C)',
              valorFormateado: formatearMoneda(res.interesTotalGenerado, formato),
              valorExacto: res.interesTotalGenerado,
            },
            {
              etiqueta: 'Etapas computadas',
              valorFormateado: `${res.historialCapitalizaciones.length}`,
              valorExacto: res.historialCapitalizaciones.length,
            },
          ],
          grafico: [
            { etiqueta: 'Capital Inicial (C)', valorPrincipal: C },
            ...res.historialCapitalizaciones.map((val, idx) => ({
              etiqueta: idx === 0 ? 'Tramo Inicial' : `Capitalización ${idx}`,
              valorPrincipal: val,
            })),
          ],
        };
      }
      case 'c': {
        const factor = 1 + (iPct / 100) * nPeriodos;
        const errorC =
          nPeriodos < 0
            ? 'La cantidad de períodos (n) debe ser mayor o igual a cero.'
            : factor <= 0
            ? 'El factor de capitalización (1 + i · n) debe ser mayor que cero para actualizar el monto.'
            : null;
        const res = errorC ? 0 : rsCapitalInvertido(M, iPct, nPeriodos);
        return {
          titulo: 'Régimen Simple — Capital Invertido',
          formula: 'C = M / (1 + i · n)',
          explicacion:
            'Calcula el capital inicial que debe colocarse hoy a interés simple durante n períodos a la tasa periódica i para reunir el monto final M.',
          etiqueta: 'Capital Inicial Necesario',
          simbolo: 'C',
          valor: res,
          tipo: 'moneda' as const,
          errorValidacion: errorC,
          entradas: [
            { etiqueta: 'Monto final objetivo (M)', valor: formatearMoneda(M, formato) },
            { etiqueta: 'Tasa periódica de interés (i)', valor: `${iPct}%` },
            { etiqueta: 'Cantidad de períodos (n)', valor: `${nPeriodos}` },
          ],
          variables: [
            { simbolo: 'M', nombre: 'Monto final', unidad: 'Moneda', descripcion: 'Importe final conocido al vencimiento.' },
            { simbolo: 'i', nombre: 'Tasa de interés', unidad: '%', descripcion: 'Tasa periódica simple expresada en porcentaje.' },
            { simbolo: 'n', nombre: 'Cantidad de períodos', unidad: 'Períodos', descripcion: 'Plazo total de la operación.' },
          ],
          secundarios: [
            {
              etiqueta: 'Interés devengado en el plazo (M − C)',
              valorFormateado: formatearMoneda(M - res, formato),
              valorExacto: M - res,
            },
          ],
          grafico: [
            { etiqueta: 'Capital Invertido (C)', valorPrincipal: res },
            { etiqueta: 'Interés Devengado (I)', valorPrincipal: M - res },
            { etiqueta: 'Monto Final (M)', valorPrincipal: M },
          ],
        };
      }
      case 'y': {
        const errorY =
          C <= 0
            ? 'El capital invertido (C) debe ser mayor que cero para calcular la tasa de rendimiento.'
            : nPeriodos <= 0
            ? 'La cantidad de períodos (n) debe ser mayor que cero para determinar la tasa periódica.'
            : null;
        const tasaPeriodica = errorY ? 0 : rsTasaInteres(M, C, nPeriodos);
        const tasaTotal = errorY ? 0 : rsTasaTotalOperacion(M, C);
        return {
          titulo: 'Régimen Simple — Tasa de Interés Periódica y Rendimiento Total',
          formula: 'i = ((M / C − 1) / n) · 100   |   R_total = ((M / C) − 1) · 100',
          explicacion:
            'En régimen simple, la tasa periódica (i) mide el rendimiento lineal por cada unidad de tiempo, mientras que el rendimiento total de la operación (R_total = i · n) expresa la variación porcentual acumulada punta a punta entre el capital inicial C y el monto final M.',
          etiqueta: 'Tasa de Interés Periódica Simple',
          simbolo: 'i',
          valor: tasaPeriodica,
          tipo: 'porcentaje' as const,
          errorValidacion: errorY,
          entradas: [
            { etiqueta: 'Monto recibido al final (M)', valor: formatearMoneda(M, formato) },
            { etiqueta: 'Capital invertido (C)', valor: formatearMoneda(C, formato) },
            { etiqueta: 'Cantidad de períodos (n)', valor: `${nPeriodos}` },
          ],
          variables: [
            { simbolo: 'M', nombre: 'Monto recibido al final', unidad: 'Moneda', descripcion: 'Importe final cobrado al vencimiento.' },
            { simbolo: 'C', nombre: 'Capital invertido', unidad: 'Moneda', descripcion: 'Capital inicial colocado.' },
            { simbolo: 'n', nombre: 'Cantidad de períodos', unidad: 'Períodos', descripcion: 'Plazo transcurrido entre la inversión y el cobro.' },
            { simbolo: 'i', nombre: 'Tasa periódica simple', unidad: '% por período', descripcion: 'Rendimiento simple por cada período.' },
            { simbolo: 'R_total', nombre: 'Rendimiento total punta a punta', unidad: '% total', descripcion: 'Rendimiento directo acumulado en toda la operación (para n = 1 coincide con i).' },
          ],
          secundarios: [
            {
              etiqueta: 'Rendimiento Total de la Operación (R_total = i · n)',
              valorFormateado: formatearPorcentaje(tasaTotal, formato),
              valorExacto: tasaTotal,
            },
            {
              etiqueta: 'Interés nominal devengado (M − C)',
              valorFormateado: formatearMoneda(M - C, formato),
              valorExacto: M - C,
            },
          ],
          nota: 'Si desea conocer únicamente la tasa total punta a punta sin prorratear por períodos, observe el indicador "Rendimiento Total de la Operación" o ingrese n = 1.',
          grafico: [
            { etiqueta: 'Capital Invertido (C)', valorPrincipal: C },
            { etiqueta: 'Interés Nominal (M − C)', valorPrincipal: M - C },
            { etiqueta: 'Monto Final (M)', valorPrincipal: M },
          ],
        };
      }
      case 'vd': {
        const factorD = 1 - (dPct / 100) * nPeriodos;
        const errorVD =
          nPeriodos < 0
            ? 'La cantidad de períodos de anticipación (n) debe ser mayor o igual a cero.'
            : factorD < 0
            ? 'El descuento comercial acumulado (d · n) supera el 100% del valor nominal (1 − d · n < 0), por lo que el descuento comercial simple se vuelve financieramente impropio para ese plazo.'
            : null;
        const res = errorVD ? 0 : rsValorDescontado(N, dPct, nPeriodos);
        return {
          titulo: 'Régimen Simple — Valor Descontado Comercial',
          formula: 'VD = N · (1 − d · n)',
          explicacion:
            'Calcula el valor efectivo o líquido que se percibe al descontar comercialmente un documento de valor nominal N con una tasa adelantada simple d durante n períodos antes de su vencimiento.',
          etiqueta: 'Valor Descontado Líquido',
          simbolo: 'VD',
          valor: res,
          tipo: 'moneda' as const,
          errorValidacion: errorVD,
          entradas: [
            { etiqueta: 'Valor nominal del documento (N)', valor: formatearMoneda(N, formato) },
            { etiqueta: 'Tasa periódica de descuento (d)', valor: `${dPct}%` },
            { etiqueta: 'Períodos de anticipación (n)', valor: `${nPeriodos}` },
          ],
          variables: [
            { simbolo: 'N', nombre: 'Valor nominal', unidad: 'Moneda', descripcion: 'Importe escrito en el documento al vencimiento.' },
            { simbolo: 'd', nombre: 'Tasa de descuento', unidad: '%', descripcion: 'Tasa adelantada simple aplicada sobre el valor nominal.' },
            { simbolo: 'n', nombre: 'Períodos de anticipación', unidad: 'Períodos', descripcion: 'Plazo que resta hasta el vencimiento.' },
          ],
          secundarios: [
            {
              etiqueta: 'Descuento comercial practicado (D = N − VD)',
              valorFormateado: formatearMoneda(N - res, formato),
              valorExacto: N - res,
            },
          ],
          grafico: [
            { etiqueta: 'Valor Nominal (N)', valorPrincipal: N },
            { etiqueta: 'Descuento Comercial (D)', valorPrincipal: N - res },
            { etiqueta: 'Valor Descontado (VD)', valorPrincipal: res },
          ],
        };
      }
      case 'va': {
        const divisor = 1 + (iPct / 100) * nPeriodos;
        const errorVA =
          nPeriodos < 0
            ? 'La cantidad de períodos (n) debe ser mayor o igual a cero.'
            : divisor <= 0
            ? 'El divisor (1 + i · n) debe ser mayor que cero para calcular el valor actual racional.'
            : null;
        const res = errorVA ? 0 : rsValorActual(N, iPct, nPeriodos);
        return {
          titulo: 'Régimen Simple — Valor Actual Racional o Matemático',
          formula: 'VA = N / (1 + i · n)',
          explicacion:
            'Determina el valor presente racional de un documento de valor futuro N aplicando una tasa vencida simple i durante n períodos.',
          etiqueta: 'Valor Actual Racional',
          simbolo: 'VA',
          valor: res,
          tipo: 'moneda' as const,
          errorValidacion: errorVA,
          entradas: [
            { etiqueta: 'Valor nominal futuro (N)', valor: formatearMoneda(N, formato) },
            { etiqueta: 'Tasa vencida de interés (i)', valor: `${iPct}%` },
            { etiqueta: 'Períodos de espera (n)', valor: `${nPeriodos}` },
          ],
          variables: [
            { simbolo: 'N', nombre: 'Valor nominal', unidad: 'Moneda', descripcion: 'Importe futuro a actualizar.' },
            { simbolo: 'i', nombre: 'Tasa de interés', unidad: '%', descripcion: 'Tasa periódica vencida simple.' },
            { simbolo: 'n', nombre: 'Cantidad de períodos', unidad: 'Períodos', descripcion: 'Plazo hasta el vencimiento.' },
          ],
          secundarios: [
            {
              etiqueta: 'Descuento racional (N − VA)',
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
            : null;
        const res = errorD ? 0 : rsDescuentoTotal(N, dPct, nPeriodos);
        return {
          titulo: 'Régimen Simple — Descuento Comercial Total',
          formula: 'D = N · d · n',
          explicacion:
            'Calcula la quita o reducción total aplicada sobre el valor nominal N cuando se descuenta comercialmente a la tasa adelantada d por n períodos.',
          etiqueta: 'Descuento Total',
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
            { simbolo: 'N', nombre: 'Valor nominal', unidad: 'Moneda', descripcion: 'Valor nominal del documento.' },
            { simbolo: 'd', nombre: 'Tasa de descuento', unidad: '%', descripcion: 'Porcentaje periódico de descuento comercial.' },
            { simbolo: 'n', nombre: 'Cantidad de períodos', unidad: 'Períodos', descripcion: 'Plazo de anticipación.' },
          ],
          secundarios: [
            {
              etiqueta: 'Valor líquido resultante (VD = N − D)',
              valorFormateado: formatearMoneda(N - res, formato),
              valorExacto: N - res,
            },
          ],
          grafico: [
            { etiqueta: 'Valor Nominal (N)', valorPrincipal: N },
            { etiqueta: 'Descuento Total (D)', valorPrincipal: res },
            { etiqueta: 'Valor Líquido (N − D)', valorPrincipal: N - res },
          ],
        };
      }
      case 'rf': {
        const res = rsResultadoFinanciero(VD, Vi);
        return {
          titulo: 'Régimen Simple — Resultado Financiero',
          formula: 'RF = VD − Vi',
          explicacion:
            'Evalúa la diferencia neta entre el valor descontado o percibido en la operación (VD) y el valor original de referencia (Vi).',
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
            { simbolo: 'VD', nombre: 'Valor descontado', unidad: 'Moneda', descripcion: 'Importe efectivo obtenido tras el descuento.' },
            { simbolo: 'Vi', nombre: 'Valor original', unidad: 'Moneda', descripcion: 'Valor inicial o de referencia de la operación.' },
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
  }, [subOp, C, M, N, iPct, dPct, nPeriodos, VD, Vi, cambioTasa, capitalizacion, tramosIniciales, etapasCap, formato]);

  return (
    <div className="space-y-6">
      {/* Selector de operaciones de Régimen Simple */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
          Seleccione la magnitud que desea calcular en Régimen Simple:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {OPCIONES_RS.map((op) => {
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
        {/* Panel de Parámetros de Entrada */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            Datos de la operación
          </h3>

          {(subOp === 'i' || subOp === 'm' || subOp === 'y') && (
            <div>
              <label htmlFor="rs-capital" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Capital invertido (C)
              </label>
              <input
                id="rs-capital"
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
              <label htmlFor="rs-monto" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Monto recibido al final (M)
              </label>
              <input
                id="rs-monto"
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
              <label htmlFor="rs-nominal" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Valor nominal del documento (N)
              </label>
              <input
                id="rs-nominal"
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
              <label htmlFor="rs-tasa-i" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Tasa periódica de interés (i %)
              </label>
              <input
                id="rs-tasa-i"
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
              <label htmlFor="rs-tasa-d" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Tasa periódica de descuento (d %)
              </label>
              <input
                id="rs-tasa-d"
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
              <label htmlFor="rs-periodos" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Cantidad de períodos (n)
              </label>
              <input
                id="rs-periodos"
                type="number"
                step="any"
                value={nPeriodos}
                onChange={(e) => setNPeriodos(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {subOp === 'y' && (
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Ingrese n = 1 si desea evaluar la operación como un único período global.
                </p>
              )}
            </div>
          )}

          {subOp === 'rf' && (
            <>
              <div>
                <label htmlFor="rs-vd-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Valor descontado de la operación (VD)
                </label>
                <input
                  id="rs-vd-input"
                  type="number"
                  step="any"
                  value={VD}
                  onChange={(e) => setVD(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label htmlFor="rs-vi-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Valor original de la operación (Vi)
                </label>
                <input
                  id="rs-vi-input"
                  type="number"
                  step="any"
                  value={Vi}
                  onChange={(e) => setVi(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </>
          )}

          {/* Opciones avanzadas de Monto Final */}
          {subOp === 'm' && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cambioTasa}
                    onChange={(e) => setCambioTasa(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  ¿Hay cambio de tasa por tramos?
                </label>
                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={capitalizacion}
                    onChange={(e) => setCapitalizacion(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  ¿Hay capitalización intermedia?
                </label>
              </div>

              {cambioTasa && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {capitalizacion ? 'Tasas previas a la capitalización' : 'Tramos de tasas y períodos'}
                    </span>
                    <button
                      type="button"
                      onClick={agregarTramoInicial}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar tramo
                    </button>
                  </div>
                  {tramosIniciales.map((tramo, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <label className="block text-[11px] text-slate-500 mb-1">
                          Tasa {idx + 1} (%)
                        </label>
                        <input
                          type="number"
                          step="any"
                          aria-label={`Tasa inicial ${idx + 1}`}
                          value={tramo.tasaPorcentaje}
                          onChange={(e) => {
                            const copia = [...tramosIniciales];
                            copia[idx] = { ...copia[idx], tasaPorcentaje: parseFloat(e.target.value) || 0 };
                            setTramosIniciales(copia);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                        />
                      </div>
                      <div className="col-span-5">
                        <label className="block text-[11px] text-slate-500 mb-1">
                          Períodos {idx + 1}
                        </label>
                        <input
                          type="number"
                          step="any"
                          aria-label={`Períodos iniciales ${idx + 1}`}
                          value={tramo.periodos}
                          onChange={(e) => {
                            const copia = [...tramosIniciales];
                            copia[idx] = { ...copia[idx], periodos: parseFloat(e.target.value) || 0 };
                            setTramosIniciales(copia);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button
                          type="button"
                          aria-label={`Eliminar tasa ${idx + 1}`}
                          onClick={() => eliminarTramoInicial(idx)}
                          disabled={tramosIniciales.length <= 1}
                          className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {capitalizacion && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Etapas de capitalización ({etapasCap.length})
                    </span>
                    <button
                      type="button"
                      onClick={agregarEtapaCap}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Nueva etapa
                    </button>
                  </div>

                  {etapasCap.map((etapa, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Capitalización #{idx + 1}
                        </span>
                        <button
                          type="button"
                          aria-label={`Eliminar capitalización ${idx + 1}`}
                          onClick={() => eliminarEtapaCap(idx)}
                          disabled={etapasCap.length <= 1}
                          className="text-xs text-slate-400 hover:text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <input
                          type="checkbox"
                          checked={etapa.cambioTasa}
                          onChange={(e) => {
                            const copia = [...etapasCap];
                            copia[idx] = {
                              ...copia[idx],
                              cambioTasa: e.target.checked,
                              tramos: copia[idx].tramos ?? [{ tasaPorcentaje: 5, periodos: 2 }],
                            };
                            setEtapasCap(copia);
                          }}
                          className="rounded border-slate-300 text-blue-600"
                        />
                        ¿Variación de tasa dentro de la etapa #{idx + 1}?
                      </label>

                      {!etapa.cambioTasa ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] text-slate-500 mb-1">Tasa (%)</label>
                            <input
                              type="number"
                              step="any"
                              aria-label={`Tasa capitalización ${idx + 1}`}
                              value={etapa.tasaPorcentaje ?? 5}
                              onChange={(e) => {
                                const copia = [...etapasCap];
                                copia[idx] = { ...copia[idx], tasaPorcentaje: parseFloat(e.target.value) || 0 };
                                setEtapasCap(copia);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-500 mb-1">Períodos (n)</label>
                            <input
                              type="number"
                              step="any"
                              aria-label={`Períodos capitalización ${idx + 1}`}
                              value={etapa.periodos ?? 1}
                              onChange={(e) => {
                                const copia = [...etapasCap];
                                copia[idx] = { ...copia[idx], periodos: parseFloat(e.target.value) || 0 };
                                setEtapasCap(copia);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(etapa.tramos ?? []).map((sub, sIdx) => (
                            <div key={sIdx} className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                step="any"
                                aria-label={`Subtasa ${sIdx + 1} en cap ${idx + 1}`}
                                value={sub.tasaPorcentaje}
                                onChange={(e) => {
                                  const copia = [...etapasCap];
                                  const nuevosTramos = [...(copia[idx].tramos ?? [])];
                                  nuevosTramos[sIdx] = {
                                    ...nuevosTramos[sIdx],
                                    tasaPorcentaje: parseFloat(e.target.value) || 0,
                                  };
                                  copia[idx] = { ...copia[idx], tramos: nuevosTramos };
                                  setEtapasCap(copia);
                                }}
                                placeholder="Tasa %"
                                className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                              />
                              <input
                                type="number"
                                step="any"
                                aria-label={`Subperíodo ${sIdx + 1} en cap ${idx + 1}`}
                                value={sub.periodos}
                                onChange={(e) => {
                                  const copia = [...etapasCap];
                                  const nuevosTramos = [...(copia[idx].tramos ?? [])];
                                  nuevosTramos[sIdx] = {
                                    ...nuevosTramos[sIdx],
                                    periodos: parseFloat(e.target.value) || 0,
                                  };
                                  copia[idx] = { ...copia[idx], tramos: nuevosTramos };
                                  setEtapasCap(copia);
                                }}
                                placeholder="Períodos"
                                className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const copia = [...etapasCap];
                              copia[idx] = {
                                ...copia[idx],
                                tramos: [...(copia[idx].tramos ?? []), { tasaPorcentaje: 5, periodos: 1 }],
                              };
                              setEtapasCap(copia);
                            }}
                            className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            + Añadir subtasa a esta etapa
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel de Resultados y Visualización */}
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
            notaMetodologica={calculo.nota}
            errorValidacion={calculo.errorValidacion}
          />

          {!calculo.errorValidacion && calculo.grafico && calculo.grafico.length > 0 && (
            <FinancialChart
              titulo="Composición de Magnitudes en Régimen Simple"
              subtitulo="Comparación proporcional de los importes calculados"
              etiquetaSeriePrincipal="Importe"
              datos={calculo.grafico}
              formato={formato}
            />
          )}
        </div>
      </div>
    </div>
  );
};
