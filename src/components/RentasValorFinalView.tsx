import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  rvf1VencidaConstante,
  rvf1VencidaVarCapitalYTasa,
  rvf1VencidaVarSoloTasa,
  rvf1VencidaVarSoloCuota,
  rvf2Adelantada,
  rvf3InteresesTotales,
  rvf4CapitalNecesario,
  rvf5TasaInteresImplicita,
  BloqueCapitalVarAmbos,
  TramoSoloTasaRenta,
  TramoSoloCuotaRenta,
  AporteCapitalRenta,
} from '../engine/financialEngine';
import {
  FormatoNumericoConfig,
  formatearMoneda,
  formatearPorcentaje,
  formatearTantoPorUno,
} from '../utils/formatters';
import { ResultBanner } from './ResultBanner';
import { FinancialChart } from './FinancialChart';

interface RentasValorFinalViewProps {
  formato: FormatoNumericoConfig;
}

const OPCIONES_RVF = [
  { id: 1, nombre: '1. Renta Final de Pagos Vencidos', desc: 'Cuotas al final de cada período (fijas o variables)' },
  { id: 2, nombre: '2. Renta Final de Pagos Adelantados', desc: 'Cuotas integradas al inicio de cada período' },
  { id: 3, nombre: '3. Intereses Totales Devengados', desc: 'Diferencia entre el valor final recibido y el capital aportado' },
  { id: 4, nombre: '4. Cuota Necesaria según VF Objetivo', desc: 'Aporte periódico constante C para reunir un Valor Final' },
  { id: 5, nombre: '5. Tasa Implícita según VF Objetivo', desc: 'Tasa efectiva periódica i necesaria para alcanzar un Valor Final' },
];

export const RentasValorFinalView: React.FC<RentasValorFinalViewProps> = ({ formato }) => {
  const [pregunta, setPregunta] = useState<number>(1);

  const [C, setC] = useState<number>(1000);
  const [iPct, setIPct] = useState<number>(5);
  const [nCuotas, setNCuotas] = useState<number>(12);
  const [VFObjetivo, setVFObjetivo] = useState<number>(15917.12652);
  const [AnFinal, setAnFinal] = useState<number>(15917.12652);

  const [variaCapital, setVariaCapital] = useState<boolean>(false);
  const [variaTasa, setVariaTasa] = useState<boolean>(false);

  const [tramosSoloTasa, setTramosSoloTasa] = useState<TramoSoloTasaRenta[]>([
    { tasaPorcentaje: 4, periodos: 6 },
    { tasaPorcentaje: 5, periodos: 6 },
  ]);

  const [tramosSoloCuota, setTramosSoloCuota] = useState<TramoSoloCuotaRenta[]>([
    { C: 1000, n: 6, h: 6 },
    { C: 1500, n: 6, h: 0 },
  ]);

  const [bloquesAmbos, setBloquesAmbos] = useState<BloqueCapitalVarAmbos[]>([
    {
      C: 1000,
      cambioTasaDuranteCuota: false,
      tasaPorcentaje: 4,
      cantidadCuotas: 6,
      tasasPosteriores: [{ tasaPorcentaje: 5, periodosFaltantes: 6 }],
    },
    {
      C: 1500,
      cambioTasaDuranteCuota: false,
      tasaPorcentaje: 5,
      cantidadCuotas: 6,
      tasasPosteriores: [],
    },
  ]);

  const [varioCuotaOp3, setVarioCuotaOp3] = useState<boolean>(false);
  const [aportesOp3, setAportesOp3] = useState<AporteCapitalRenta[]>([
    { C: 1000, n: 6 },
    { C: 1500, n: 6 },
  ]);

  const calculo = React.useMemo(() => {
    if (pregunta === 1) {
      if (!variaCapital && !variaTasa) {
        const error1A =
          nCuotas <= 0
            ? 'La cantidad de cuotas (n) debe ser mayor que cero.'
            : iPct <= -100
            ? 'La tasa de interés (i) debe ser mayor a −100%.'
            : null;
        const res = error1A ? 0 : rvf1VencidaConstante(C, iPct, nCuotas);
        const capPuro = C * nCuotas;
        return {
          titulo: 'Rentas Valor Final — Pagos Vencidos Constantes',
          formula: 'VF = C · (((1 + i)^n − 1) / i)   (si i = 0, VF = C · n)',
          explicacion:
            'Calcula el monto acumulado al final del período n por una sucesión de n cuotas constantes vencidas C capitalizadas a la tasa efectiva periódica i.',
          etiqueta: 'Valor Final de Renta Vencida',
          simbolo: 'VF',
          valor: res,
          tipo: 'moneda' as const,
          errorValidacion: error1A,
          entradas: [
            { etiqueta: 'Cuota periódica vencida (C)', valor: formatearMoneda(C, formato) },
            { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
            { etiqueta: 'Cantidad total de cuotas (n)', valor: `${nCuotas}` },
          ],
          variables: [
            { simbolo: 'C', nombre: 'Cuota periódica', unidad: 'Moneda', descripcion: 'Importe integrado al final de cada período.' },
            { simbolo: 'i', nombre: 'Tasa de interés', unidad: '%', descripcion: 'Tasa efectiva periódica de capitalización.' },
            { simbolo: 'n', nombre: 'Cantidad de cuotas', unidad: 'Cuotas', descripcion: 'Total de aportes vencidos.' },
          ],
          secundarios: [
            {
              etiqueta: 'Capital puro integrado (C · n)',
              valorFormateado: formatearMoneda(capPuro, formato),
              valorExacto: capPuro,
            },
            {
              etiqueta: 'Intereses devengados (VF − C · n)',
              valorFormateado: formatearMoneda(res - capPuro, formato),
              valorExacto: res - capPuro,
            },
          ],
          grafico: [
            { etiqueta: 'Capital Integrado (C · n)', valorPrincipal: capPuro },
            { etiqueta: 'Intereses Generados', valorPrincipal: res - capPuro },
            { etiqueta: 'Valor Final (VF)', valorPrincipal: res },
          ],
        };
      }

      if (!variaCapital && variaTasa) {
        const res = rvf1VencidaVarSoloTasa(C, tramosSoloTasa);
        return {
          titulo: 'Rentas Valor Final — Pagos Vencidos con Variación de Tasa',
          formula: 'VF = ∑ [ C · s(n_j, i_j) · ∏_{k > j} (1 + i_k)^(n_k) ]',
          explicacion:
            'Capitaliza cada tramo de cuotas constantes a su tasa vigente y proyecta el subtotal acumulado por las tasas de los tramos posteriores hasta el final de la renta.',
          etiqueta: 'Valor Final con Variación de Tasa',
          simbolo: 'VF',
          valor: res.valorFinal,
          tipo: 'moneda' as const,
          errorValidacion: null,
          entradas: [
            { etiqueta: 'Cuota constante (C)', valor: formatearMoneda(C, formato) },
            { etiqueta: 'Tramos de tasas sucesivas', valor: `${tramosSoloTasa.length}` },
          ],
          variables: [
            { simbolo: 'C', nombre: 'Cuota periódica', unidad: 'Moneda', descripcion: 'Cuota constante en todos los períodos.' },
            { simbolo: 'i_j', nombre: 'Tasa del tramo j', unidad: '%', descripcion: 'Tasa efectiva vigente en cada tramo.' },
            { simbolo: 'n_j', nombre: 'Períodos del tramo j', unidad: 'Cuotas', descripcion: 'Duración en cuotas de cada tasa.' },
          ],
          secundarios: res.aportesCapitalizados.map((v, i) => ({
            etiqueta: `Tramo ${i + 1} capitalizado hasta el final`,
            valorFormateado: formatearMoneda(v, formato),
            valorExacto: v,
          })),
          grafico: res.aportesCapitalizados.map((v, i) => ({
            etiqueta: `Aporte Tramo ${i + 1}`,
            valorPrincipal: v,
          })),
        };
      }

      if (variaCapital && !variaTasa) {
        const res = rvf1VencidaVarSoloCuota(iPct, tramosSoloCuota);
        return {
          titulo: 'Rentas Valor Final — Pagos Vencidos con Variación de Cuota',
          formula: 'VF = ∑ [ C_j · (((1 + i)^(n_j) − 1) / i) · (1 + i)^(h_j) ]',
          explicacion:
            'Calcula el valor final de cada grupo de cuotas C_j al término de su propio tramo y lo capitaliza por los h_j períodos restantes hasta la finalización total de la renta.',
          etiqueta: 'Valor Final con Variación de Cuota',
          simbolo: 'VF',
          valor: res.valorFinal,
          tipo: 'moneda' as const,
          errorValidacion: null,
          entradas: [
            { etiqueta: 'Tasa efectiva constante (i)', valor: `${iPct}%` },
            { etiqueta: 'Tramos de cuotas distintas', valor: `${tramosSoloCuota.length}` },
          ],
          variables: [
            { simbolo: 'C_j', nombre: 'Importe de la cuota j', unidad: 'Moneda', descripcion: 'Valor de la cuota en el tramo j.' },
            { simbolo: 'n_j', nombre: 'Cantidad de cuotas j', unidad: 'Cuotas', descripcion: 'Número de cuotas integradas con ese importe.' },
            { simbolo: 'h_j', nombre: 'Períodos hasta el final', unidad: 'Períodos', descripcion: 'Períodos que restan desde el fin del tramo j hasta el final de la operación.' },
          ],
          secundarios: res.resultadosPorTramo.map((v, i) => ({
            etiqueta: `Tramo de Cuota #${i + 1} capitalizado al final`,
            valorFormateado: formatearMoneda(v, formato),
            valorExacto: v,
          })),
          grafico: res.resultadosPorTramo.map((v, i) => ({
            etiqueta: `Tramo Cuota #${i + 1}`,
            valorPrincipal: v,
          })),
        };
      }

      const res = rvf1VencidaVarCapitalYTasa(bloquesAmbos);
      return {
        titulo: 'Rentas Valor Final — Pagos Vencidos con Variación de Cuota y Tasa',
        formula: 'VF = ∑ [ VF_bloque(C_j, i_j, n_j) · ∏ (1 + i_post)^(n_post) ]',
        explicacion:
          'Permite modelar planes de ahorro o inversión donde cambian simultáneamente el importe de las cuotas periódicas y las tasas de interés de cada etapa.',
        etiqueta: 'Valor Final (Variación Conjunta)',
        simbolo: 'VF',
        valor: res.valorFinal,
        tipo: 'moneda' as const,
        errorValidacion: null,
        entradas: [{ etiqueta: 'Bloques de cuotas configurados', valor: `${bloquesAmbos.length}` }],
        variables: [
          { simbolo: 'C_j', nombre: 'Cuota de cada bloque', unidad: 'Moneda', descripcion: 'Importe periódico del bloque.' },
          { simbolo: 'i_j, n_j', nombre: 'Tasa y cuotas del bloque', unidad: '% / Cuotas', descripcion: 'Condiciones vigentes durante la integración del bloque.' },
          { simbolo: 'i_post', nombre: 'Tasas posteriores', unidad: '%', descripcion: 'Tasas que capitalizan el bloque una vez concluida su integración.' },
        ],
        secundarios: res.resultadosPorCapital.map((v, i) => ({
          etiqueta: `Bloque #${i + 1} capitalizado al final`,
          valorFormateado: formatearMoneda(v, formato),
          valorExacto: v,
        })),
        grafico: res.resultadosPorCapital.map((v, i) => ({
          etiqueta: `Bloque #${i + 1}`,
          valorPrincipal: v,
        })),
      };
    }

    if (pregunta === 2) {
      const error2 =
        nCuotas <= 0
          ? 'La cantidad de períodos (n) debe ser mayor que cero.'
          : iPct <= -100
          ? 'La tasa de interés (i) debe ser mayor a −100%.'
          : null;
      const res = error2 ? 0 : rvf2Adelantada(C, iPct, nCuotas);
      const capPuro = C * nCuotas;
      return {
        titulo: 'Rentas Valor Final — Pagos Adelantados (Imposición Adelantada)',
        formula: 'VFA = C · (((1 + i)^n − 1) / i) · (1 + i)',
        explicacion:
          'Al efectuarse cada depósito al comienzo del período, cada cuota gana un período adicional de interés respecto de una renta vencida, multiplicando el valor final vencido por (1 + i).',
        etiqueta: 'Valor Final Adelantado',
        simbolo: 'VFA',
        valor: res,
        tipo: 'moneda' as const,
        errorValidacion: error2,
        entradas: [
          { etiqueta: 'Cuota periódica adelantada (C)', valor: formatearMoneda(C, formato) },
          { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
          { etiqueta: 'Cantidad total de períodos (n)', valor: `${nCuotas}` },
        ],
        variables: [
          { simbolo: 'C', nombre: 'Cuota adelantada', unidad: 'Moneda', descripcion: 'Monto integrado al inicio de cada período.' },
          { simbolo: 'i', nombre: 'Tasa de interés', unidad: '%', descripcion: 'Tasa efectiva periódica.' },
          { simbolo: 'n', nombre: 'Cantidad de períodos', unidad: 'Períodos', descripcion: 'Total de cuotas integradas.' },
        ],
        secundarios: [
          {
            etiqueta: 'Capital puro integrado (C · n)',
            valorFormateado: formatearMoneda(capPuro, formato),
            valorExacto: capPuro,
          },
          {
            etiqueta: 'Intereses totales devengados (VFA − C · n)',
            valorFormateado: formatearMoneda(res - capPuro, formato),
            valorExacto: res - capPuro,
          },
        ],
        grafico: [
          { etiqueta: 'Capital Integrado (C · n)', valorPrincipal: capPuro },
          { etiqueta: 'Intereses Generados', valorPrincipal: res - capPuro },
          { etiqueta: 'Valor Final Adelantado (VFA)', valorPrincipal: res },
        ],
      };
    }

    if (pregunta === 3) {
      const listaAportes = varioCuotaOp3 ? aportesOp3 : [{ C, n: nCuotas }];
      const res = rvf3InteresesTotales(AnFinal, listaAportes);
      return {
        titulo: 'Rentas Valor Final — Intereses Totales Acumulados',
        formula: 'IT = A_n − ∑ (C_j · n_j)',
        explicacion:
          'Determina la ganancia neta por intereses comparando el valor final percibido al término de la renta (A_n) con la suma nominal de todos los aportes de capital realizados.',
        etiqueta: 'Intereses Totales de la Renta',
        simbolo: 'IT',
        valor: res.interesesTotales,
        tipo: 'moneda' as const,
        errorValidacion: null,
        entradas: [
          { etiqueta: 'Valor recibido al final (A_n)', valor: formatearMoneda(AnFinal, formato) },
          { etiqueta: 'Capital total aportado', valor: formatearMoneda(res.capitalTotalAportado, formato) },
        ],
        variables: [
          { simbolo: 'A_n', nombre: 'Valor final recibido', unidad: 'Moneda', descripcion: 'Monto total acumulado al concluir la renta.' },
          { simbolo: 'C_j, n_j', nombre: 'Aportes periódicos', unidad: 'Moneda × Cuotas', descripcion: 'Suma de las cuotas puras integradas.' },
        ],
        secundarios: [
          {
            etiqueta: 'Capital puro aportado (∑ C_j · n_j)',
            valorFormateado: formatearMoneda(res.capitalTotalAportado, formato),
            valorExacto: res.capitalTotalAportado,
          },
        ],
        grafico: [
          { etiqueta: 'Capital Total Aportado', valorPrincipal: res.capitalTotalAportado },
          { etiqueta: 'Intereses Totales (IT)', valorPrincipal: res.interesesTotales },
          { etiqueta: 'Valor Recibido (A_n)', valorPrincipal: AnFinal },
        ],
      };
    }

    if (pregunta === 4) {
      const error4 =
        nCuotas <= 0
          ? 'La cantidad de cuotas (n) debe ser mayor que cero.'
          : iPct <= -100
          ? 'La tasa de interés (i) debe ser mayor a −100%.'
          : null;
      const res = error4 ? 0 : rvf4CapitalNecesario(VFObjetivo, iPct, nCuotas);
      return {
        titulo: 'Rentas Valor Final — Cuota Periódica Necesaria',
        formula: 'C = (VF · i) / ((1 + i)^n − 1)   (si i = 0, C = VF / n)',
        explicacion:
          'Determina el importe constante C que debe depositarse al final de cada uno de los n períodos a la tasa efectiva i para reunir exactamente el Valor Final objetivo VF.',
        etiqueta: 'Cuota Periódica Necesaria',
        simbolo: 'C',
        valor: res,
        tipo: 'moneda' as const,
        errorValidacion: error4,
        entradas: [
          { etiqueta: 'Valor Final objetivo (VF)', valor: formatearMoneda(VFObjetivo, formato) },
          { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
          { etiqueta: 'Cantidad total de cuotas (n)', valor: `${nCuotas}` },
        ],
        variables: [
          { simbolo: 'VF', nombre: 'Valor final objetivo', unidad: 'Moneda', descripcion: 'Capital final que se desea constituir.' },
          { simbolo: 'i', nombre: 'Tasa de interés', unidad: '%', descripcion: 'Tasa periódica efectiva de rendimiento.' },
          { simbolo: 'n', nombre: 'Cantidad de cuotas', unidad: 'Cuotas', descripcion: 'Total de depósitos periódicos.' },
        ],
        secundarios: [
          {
            etiqueta: 'Suma de cuotas a integrar (C · n)',
            valorFormateado: formatearMoneda(res * nCuotas, formato),
            valorExacto: res * nCuotas,
          },
          {
            etiqueta: 'Intereses que aportará la capitalización (VF − C · n)',
            valorFormateado: formatearMoneda(VFObjetivo - res * nCuotas, formato),
            valorExacto: VFObjetivo - res * nCuotas,
          },
        ],
        grafico: [
          { etiqueta: 'Cuota Periódica (C)', valorPrincipal: res },
          { etiqueta: 'Aporte Acumulado (C · n)', valorPrincipal: res * nCuotas },
          { etiqueta: 'Valor Final Objetivo (VF)', valorPrincipal: VFObjetivo },
        ],
      };
    }

    // pregunta === 5: Tasa implícita
    const solver = rvf5TasaInteresImplicita(VFObjetivo, C, nCuotas, 0.1);
    const aporteTotal = C * nCuotas;
    return {
      titulo: 'Rentas Valor Final — Tasa de Interés Implícita',
      formula: 'VF = C · (((1 + i)^n − 1) / i)   →   Resolución numérica de i',
      explicacion:
        'Halla la tasa efectiva periódica i a la cual deben capitalizarse n cuotas vencidas constantes de importe C para alcanzar exactamente el Valor Final objetivo VF.',
      etiqueta: 'Tasa Efectiva Periódica Necesaria',
      simbolo: 'i',
      valor: solver.tasaPorcentaje,
      tipo: 'porcentaje' as const,
      errorValidacion: !solver.convergio ? solver.mensaje : null,
      entradas: [
        { etiqueta: 'Valor Final objetivo (VF)', valor: formatearMoneda(VFObjetivo, formato) },
        { etiqueta: 'Valor de cada cuota (C)', valor: formatearMoneda(C, formato) },
        { etiqueta: 'Cantidad total de cuotas (n)', valor: `${nCuotas}` },
      ],
      variables: [
        { simbolo: 'VF', nombre: 'Valor final objetivo', unidad: 'Moneda', descripcion: 'Monto final que se desea alcanzar.' },
        { simbolo: 'C', nombre: 'Cuota periódica', unidad: 'Moneda', descripcion: 'Importe constante depositado al final de cada período.' },
        { simbolo: 'n', nombre: 'Cantidad de cuotas', unidad: 'Cuotas', descripcion: 'Número total de depósitos (requiere n > 1).' },
      ],
      secundarios: [
        {
          etiqueta: 'Tasa en Porcentaje (%)',
          valorFormateado: formatearPorcentaje(solver.tasaPorcentaje, formato),
          valorExacto: solver.tasaPorcentaje,
        },
        {
          etiqueta: 'Tasa en Tanto por Uno (decimal)',
          valorFormateado: formatearTantoPorUno(solver.tasaDecimal, formato),
          valorExacto: solver.tasaDecimal,
        },
        {
          etiqueta: 'Capital total aportado (C · n)',
          valorFormateado: formatearMoneda(aporteTotal, formato),
          valorExacto: aporteTotal,
        },
        {
          etiqueta: 'Intereses implícitos (VF − C · n)',
          valorFormateado: formatearMoneda(VFObjetivo - aporteTotal, formato),
          valorExacto: VFObjetivo - aporteTotal,
        },
      ],
      grafico: solver.convergio
        ? [
            { etiqueta: 'Capital Aportado (C · n)', valorPrincipal: aporteTotal },
            { etiqueta: 'Intereses Implícitos', valorPrincipal: VFObjetivo - aporteTotal },
            { etiqueta: 'Valor Final Objetivo (VF)', valorPrincipal: VFObjetivo },
          ]
        : [],
    };
  }, [
    pregunta,
    C,
    iPct,
    nCuotas,
    VFObjetivo,
    AnFinal,
    variaCapital,
    variaTasa,
    tramosSoloTasa,
    tramosSoloCuota,
    bloquesAmbos,
    varioCuotaOp3,
    aportesOp3,
    formato,
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
          Seleccione el cálculo de Renta — Valor Final (Capitalización):
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {OPCIONES_RVF.map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => setPregunta(op.id)}
              className={`text-left p-2.5 rounded-lg border transition-colors ${
                pregunta === op.id
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="text-xs font-semibold">{op.nombre}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{op.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            Parámetros de la Renta (Opción #{pregunta})
          </h3>

          {pregunta === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={variaCapital}
                    onChange={(e) => setVariaCapital(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  ¿Varía el importe de la cuota?
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={variaTasa}
                    onChange={(e) => setVariaTasa(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  ¿Varía la tasa de interés?
                </label>
              </div>

              {!variaCapital && !variaTasa && (
                <>
                  <div>
                    <label htmlFor="rvf-c" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Cuota que se integra en cada período (C)
                    </label>
                    <input
                      id="rvf-c"
                      type="number"
                      step="any"
                      value={C}
                      onChange={(e) => setC(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label htmlFor="rvf-i" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Tasa efectiva periódica (i %)
                    </label>
                    <input
                      id="rvf-i"
                      type="number"
                      step="any"
                      value={iPct}
                      onChange={(e) => setIPct(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label htmlFor="rvf-n" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Cantidad total de cuotas (n)
                    </label>
                    <input
                      id="rvf-n"
                      type="number"
                      step="any"
                      value={nCuotas}
                      onChange={(e) => setNCuotas(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                </>
              )}

              {!variaCapital && variaTasa && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="rvf-c-solotasa" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Cuota periódica constante (C)
                    </label>
                    <input
                      id="rvf-c-solotasa"
                      type="number"
                      step="any"
                      value={C}
                      onChange={(e) => setC(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Tramos de tasas sucesivas (mínimo 2)
                    </span>
                    <button
                      type="button"
                      onClick={() => setTramosSoloTasa([...tramosSoloTasa, { tasaPorcentaje: 6, periodos: 6 }])}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar tasa
                    </button>
                  </div>
                  {tramosSoloTasa.map((t, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <label className="block text-[11px] text-slate-500 mb-1">Tasa {idx + 1} (%)</label>
                        <input
                          type="number"
                          step="any"
                          aria-label={`Tasa renta ${idx + 1}`}
                          value={t.tasaPorcentaje}
                          onChange={(e) => {
                            const copia = [...tramosSoloTasa];
                            copia[idx] = { ...copia[idx], tasaPorcentaje: parseFloat(e.target.value) || 0 };
                            setTramosSoloTasa(copia);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                        />
                      </div>
                      <div className="col-span-5">
                        <label className="block text-[11px] text-slate-500 mb-1">Cuotas {idx + 1}</label>
                        <input
                          type="number"
                          step="1"
                          aria-label={`Período renta ${idx + 1}`}
                          value={t.periodos}
                          onChange={(e) => {
                            const copia = [...tramosSoloTasa];
                            copia[idx] = { ...copia[idx], periodos: parseInt(e.target.value, 10) || 0 };
                            setTramosSoloTasa(copia);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button
                          type="button"
                          aria-label={`Eliminar tasa renta ${idx + 1}`}
                          disabled={tramosSoloTasa.length <= 2}
                          onClick={() => setTramosSoloTasa(tramosSoloTasa.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {variaCapital && !variaTasa && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="rvf-i-solocuota" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Tasa de interés constante (i %)
                    </label>
                    <input
                      id="rvf-i-solocuota"
                      type="number"
                      step="any"
                      value={iPct}
                      onChange={(e) => setIPct(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Tramos de cuotas distintas (mínimo 2)
                    </span>
                    <button
                      type="button"
                      onClick={() => setTramosSoloCuota([...tramosSoloCuota, { C: 2000, n: 6, h: 0 }])}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar tramo
                    </button>
                  </div>
                  {tramosSoloCuota.map((t, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Tramo de Cuota #{idx + 1}</span>
                        <button
                          type="button"
                          aria-label={`Eliminar capital ${idx + 1}`}
                          disabled={tramosSoloCuota.length <= 2}
                          onClick={() => setTramosSoloCuota(tramosSoloCuota.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500">Cuota C</label>
                          <input
                            type="number"
                            step="any"
                            aria-label={`Monto capital ${idx + 1}`}
                            value={t.C}
                            onChange={(e) => {
                              const copia = [...tramosSoloCuota];
                              copia[idx] = { ...copia[idx], C: parseFloat(e.target.value) || 0 };
                              setTramosSoloCuota(copia);
                            }}
                            className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500">Cuotas (n)</label>
                          <input
                            type="number"
                            step="1"
                            aria-label={`Cuotas capital ${idx + 1}`}
                            value={t.n}
                            onChange={(e) => {
                              const copia = [...tramosSoloCuota];
                              copia[idx] = { ...copia[idx], n: parseInt(e.target.value, 10) || 0 };
                              setTramosSoloCuota(copia);
                            }}
                            className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500">Períodos al final (h)</label>
                          <input
                            type="number"
                            step="1"
                            aria-label={`Períodos faltantes ${idx + 1}`}
                            value={t.h}
                            onChange={(e) => {
                              const copia = [...tramosSoloCuota];
                              copia[idx] = { ...copia[idx], h: parseInt(e.target.value, 10) || 0 };
                              setTramosSoloCuota(copia);
                            }}
                            className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {variaCapital && variaTasa && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Bloques de cuota y tasas ({bloquesAmbos.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setBloquesAmbos([
                          ...bloquesAmbos,
                          {
                            C: 2000,
                            cambioTasaDuranteCuota: false,
                            tasaPorcentaje: 5,
                            cantidadCuotas: 6,
                            tasasPosteriores: [],
                          },
                        ])
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Nuevo bloque
                    </button>
                  </div>
                  {bloquesAmbos.map((b, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">Bloque de Cuota #{idx + 1}</span>
                        <button
                          type="button"
                          aria-label={`Eliminar bloque ${idx + 1}`}
                          disabled={bloquesAmbos.length <= 2}
                          onClick={() => setBloquesAmbos(bloquesAmbos.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500">Cuota C</label>
                          <input
                            type="number"
                            step="any"
                            aria-label={`Cuota bloque ${idx + 1}`}
                            value={b.C}
                            onChange={(e) => {
                              const copia = [...bloquesAmbos];
                              copia[idx] = { ...copia[idx], C: parseFloat(e.target.value) || 0 };
                              setBloquesAmbos(copia);
                            }}
                            className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500">Tasa (%)</label>
                          <input
                            type="number"
                            step="any"
                            aria-label={`Tasa bloque ${idx + 1}`}
                            value={b.tasaPorcentaje ?? 5}
                            onChange={(e) => {
                              const copia = [...bloquesAmbos];
                              copia[idx] = { ...copia[idx], tasaPorcentaje: parseFloat(e.target.value) || 0 };
                              setBloquesAmbos(copia);
                            }}
                            className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500">Cuotas (n)</label>
                          <input
                            type="number"
                            step="1"
                            aria-label={`Cantidad cuotas bloque ${idx + 1}`}
                            value={b.cantidadCuotas ?? 6}
                            onChange={(e) => {
                              const copia = [...bloquesAmbos];
                              copia[idx] = { ...copia[idx], cantidadCuotas: parseInt(e.target.value, 10) || 0 };
                              setBloquesAmbos(copia);
                            }}
                            className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {pregunta === 2 && (
            <>
              <div>
                <label htmlFor="rvf2-c" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Cuota adelantada integrada en cada período (C)
                </label>
                <input
                  id="rvf2-c"
                  type="number"
                  step="any"
                  value={C}
                  onChange={(e) => setC(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="rvf2-i" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Tasa efectiva periódica (i %)
                </label>
                <input
                  id="rvf2-i"
                  type="number"
                  step="any"
                  value={iPct}
                  onChange={(e) => setIPct(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="rvf2-n" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Cantidad total de períodos (n)
                </label>
                <input
                  id="rvf2-n"
                  type="number"
                  step="any"
                  value={nCuotas}
                  onChange={(e) => setNCuotas(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </>
          )}

          {pregunta === 3 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="rvf3-an" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Valor recibido al final de la renta (A_n)
                </label>
                <input
                  id="rvf3-an"
                  type="number"
                  step="any"
                  value={AnFinal}
                  onChange={(e) => setAnFinal(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={varioCuotaOp3}
                  onChange={(e) => setVarioCuotaOp3(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                ¿Varió el valor de la cuota durante la renta?
              </label>

              {!varioCuotaOp3 ? (
                <>
                  <div>
                    <label htmlFor="rvf3-c" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Importe de la cuota periódica (C)
                    </label>
                    <input
                      id="rvf3-c"
                      type="number"
                      step="any"
                      value={C}
                      onChange={(e) => setC(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label htmlFor="rvf3-n" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Cantidad de cuotas integradas (n)
                    </label>
                    <input
                      id="rvf3-n"
                      type="number"
                      step="1"
                      value={nCuotas}
                      onChange={(e) => setNCuotas(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2.5">
                  {aportesOp3.map((ap, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="any"
                        aria-label={`Capital aporte ${idx + 1}`}
                        value={ap.C}
                        onChange={(e) => {
                          const copia = [...aportesOp3];
                          copia[idx] = { ...copia[idx], C: parseFloat(e.target.value) || 0 };
                          setAportesOp3(copia);
                        }}
                        placeholder="Cuota C"
                        className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                      />
                      <input
                        type="number"
                        step="1"
                        aria-label={`Cuotas aporte ${idx + 1}`}
                        value={ap.n}
                        onChange={(e) => {
                          const copia = [...aportesOp3];
                          copia[idx] = { ...copia[idx], n: parseInt(e.target.value, 10) || 0 };
                          setAportesOp3(copia);
                        }}
                        placeholder="Cuotas n"
                        className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAportesOp3([...aportesOp3, { C: 1000, n: 6 }])}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Agregar tramo de cuotas
                  </button>
                </div>
              )}
            </div>
          )}

          {pregunta === 4 && (
            <>
              <div>
                <label htmlFor="rvf4-vf" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Valor Final objetivo de la renta (VF)
                </label>
                <input
                  id="rvf4-vf"
                  type="number"
                  step="any"
                  value={VFObjetivo}
                  onChange={(e) => setVFObjetivo(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="rvf4-i" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Tasa efectiva periódica (i %)
                </label>
                <input
                  id="rvf4-i"
                  type="number"
                  step="any"
                  value={iPct}
                  onChange={(e) => setIPct(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="rvf4-n" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Cantidad total de cuotas (n)
                </label>
                <input
                  id="rvf4-n"
                  type="number"
                  step="any"
                  value={nCuotas}
                  onChange={(e) => setNCuotas(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </>
          )}

          {pregunta === 5 && (
            <>
              <div>
                <label htmlFor="rvf5-vf" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Valor Final objetivo de la renta (VF)
                </label>
                <input
                  id="rvf5-vf"
                  type="number"
                  step="any"
                  value={VFObjetivo}
                  onChange={(e) => setVFObjetivo(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="rvf5-c" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Valor de las cuotas constantes vencidas (C)
                </label>
                <input
                  id="rvf5-c"
                  type="number"
                  step="any"
                  value={C}
                  onChange={(e) => setC(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="rvf5-n" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Cantidad total de cuotas (n &gt; 1)
                </label>
                <input
                  id="rvf5-n"
                  type="number"
                  step="any"
                  value={nCuotas}
                  onChange={(e) => setNCuotas(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </>
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
              titulo="Desglose Financiero de la Renta Final"
              subtitulo="Relación entre capital aportado e intereses capitalizados"
              etiquetaSeriePrincipal="Monto"
              datos={calculo.grafico}
              formato={formato}
            />
          )}
        </div>
      </div>
    </div>
  );
};
