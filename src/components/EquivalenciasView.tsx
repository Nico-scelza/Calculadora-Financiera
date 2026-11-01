import React, { useState } from 'react';
import {
  eq1EfectivaVencidaAEfectivaVencida,
  eq2NominalVencidaAEfectivaVencida,
  eq3EfectivaVencidaANominalVencida,
  eq4NominalVencidaANominalVencida,
  eq5EfectivaAdelantadaAEfectivaAdelantada,
  eq6EfectivaAdelantadaANominalAdelantada,
  eq7NominalAdelantadaAEfectivaAdelantada,
  eq8NominalAdelantadaANominalAdelantada,
  eq9EfectivaVencidaAEfectivaAdelantada,
  eq10EfectivaAdelantadaAEfectivaVencida,
  eq11NominalVencidaANominalAdelantada,
  eq12NominalAdelantadaANominalVencida,
} from '../engine/financialEngine';
import { VariableExplicacion } from '../engine/traceabilityMatrix';
import { FormatoNumericoConfig, formatearTantoPorUno } from '../utils/formatters';
import { ResultBanner } from './ResultBanner';

interface EquivalenciasViewProps {
  formato: FormatoNumericoConfig;
}

interface DefinicionEquivalencia {
  id: number;
  nombre: string;
  simboloSalida: string;
  etiquetaSalida: string;
  formulaMatematica: string;
  explicacionEconomica: string;
  esAdelantadaEntrada: boolean;
}

const OPCIONES_EQ: DefinicionEquivalencia[] = [
  {
    id: 1,
    nombre: '1. Tasa efectiva vencida → Tasa efectiva vencida',
    simboloSalida: 'i(ut1)',
    etiquetaSalida: 'Tasa Efectiva Vencida Equivalente',
    formulaMatematica: 'i(ut1) = (1 + i(ut2))^(ut1 / ut2) − 1',
    explicacionEconomica:
      'Convierte una tasa efectiva vencida conocida en el plazo ut2 a su tasa efectiva vencida financieramente equivalente para el plazo ut1, manteniendo idéntico factor de capitalización compuesta.',
    esAdelantadaEntrada: false,
  },
  {
    id: 2,
    nombre: '2. Tasa nominal vencida → Tasa efectiva vencida',
    simboloSalida: 'i(ut1)',
    etiquetaSalida: 'Tasa Efectiva Vencida Equivalente',
    formulaMatematica: 'i(ut1) = (1 + j(ut2) · (fs / ut2))^(ut1 / fs) − 1',
    explicacionEconomica:
      'Obtiene primero la tasa efectiva del subperíodo de capitalización fs (proporcionando la tasa nominal vencida) y luego capitaliza hacia la unidad de tiempo objetivo ut1.',
    esAdelantadaEntrada: false,
  },
  {
    id: 3,
    nombre: '3. Tasa efectiva vencida → Tasa nominal vencida',
    simboloSalida: 'j(ut2)',
    etiquetaSalida: 'Tasa Nominal Vencida Equivalente',
    formulaMatematica: 'j(ut2) = ((1 + i(ut1))^(fs / ut1) − 1) · (ut2 / fs)',
    explicacionEconomica:
      'Calcula la tasa efectiva para el subperíodo fs a partir de la tasa efectiva vencida dada y la multiplica por la cantidad de subperíodos contenidos en el plazo nominal ut2.',
    esAdelantadaEntrada: false,
  },
  {
    id: 4,
    nombre: '4. Tasa nominal vencida → Tasa nominal vencida',
    simboloSalida: 'j(ut1)',
    etiquetaSalida: 'Tasa Nominal Vencida Equivalente',
    formulaMatematica: 'j(ut1) = ((1 + j(ut2) · (fs2 / ut2))^(fs1 / fs2) − 1) · (ut1 / fs1)',
    explicacionEconomica:
      'Transforma una tasa nominal vencida con frecuencia de capitalización fs2 en otra tasa nominal vencida con unidad de tiempo ut1 y frecuencia de capitalización fs1.',
    esAdelantadaEntrada: false,
  },
  {
    id: 5,
    nombre: '5. Tasa efectiva adelantada → Tasa efectiva adelantada',
    simboloSalida: 'd(ut1)',
    etiquetaSalida: 'Tasa Efectiva Adelantada Equivalente',
    formulaMatematica: 'd(ut1) = 1 − (1 − d(ut2))^(ut1 / ut2)',
    explicacionEconomica:
      'Convierte una tasa efectiva de descuento (adelantada) del plazo ut2 a su equivalente efectiva adelantada en el plazo ut1 bajo régimen de descuento compuesto.',
    esAdelantadaEntrada: true,
  },
  {
    id: 6,
    nombre: '6. Tasa efectiva adelantada → Tasa nominal adelantada',
    simboloSalida: 'f(ut2)',
    etiquetaSalida: 'Tasa Nominal Adelantada Equivalente',
    formulaMatematica: 'f(ut2) = (1 − (1 − d(ut1))^(fs / ut1)) · (ut2 / fs)',
    explicacionEconomica:
      'Determina la tasa nominal adelantada para la unidad de tiempo ut2 con subperíodo de descuento fs a partir de una tasa efectiva adelantada conocida.',
    esAdelantadaEntrada: true,
  },
  {
    id: 7,
    nombre: '7. Tasa nominal adelantada → Tasa efectiva adelantada',
    simboloSalida: 'd(ut1)',
    etiquetaSalida: 'Tasa Efectiva Adelantada Equivalente',
    formulaMatematica: 'd(ut1) = 1 − (1 − f(ut2) · (fs / ut2))^(ut1 / fs)',
    explicacionEconomica:
      'Calcula la tasa efectiva adelantada para el plazo ut1 partiendo de una tasa nominal adelantada con frecuencia de subactualización fs.',
    esAdelantadaEntrada: true,
  },
  {
    id: 8,
    nombre: '8. Tasa nominal adelantada → Tasa nominal adelantada',
    simboloSalida: 'f(ut1)',
    etiquetaSalida: 'Tasa Nominal Adelantada Equivalente',
    formulaMatematica: 'f(ut1) = (1 − (1 − f(ut2) · (fs2 / ut2))^(fs1 / fs2)) · (ut1 / fs1)',
    explicacionEconomica:
      'Convierte una tasa nominal adelantada con subperíodo fs2 y plazo ut2 en otra tasa nominal adelantada equivalente con subperíodo fs1 y plazo ut1.',
    esAdelantadaEntrada: true,
  },
  {
    id: 9,
    nombre: '9. Tasa efectiva vencida → Tasa efectiva adelantada',
    simboloSalida: 'd(ut1)',
    etiquetaSalida: 'Tasa Efectiva Adelantada Equivalente',
    formulaMatematica: 'i_eq = (1 + i(ut2))^(ut1 / ut2) − 1   →   d(ut1) = i_eq / (1 + i_eq)',
    explicacionEconomica:
      'Relaciona el régimen de capitalización vencida con el de actualización adelantada: halla la tasa efectiva de descuento d que genera el mismo factor financiero que la tasa efectiva vencida i.',
    esAdelantadaEntrada: false,
  },
  {
    id: 10,
    nombre: '10. Tasa efectiva adelantada → Tasa efectiva vencida',
    simboloSalida: 'i(ut1)',
    etiquetaSalida: 'Tasa Efectiva Vencida Equivalente',
    formulaMatematica: 'd_eq = 1 − (1 − d(ut2))^(ut1 / ut2)   →   i(ut1) = d_eq / (1 − d_eq)',
    explicacionEconomica:
      'Determina el costo financiero o rendimiento efectivo vencido (i) implícito en una operación pactada con tasa efectiva de descuento adelantada (d).',
    esAdelantadaEntrada: true,
  },
  {
    id: 11,
    nombre: '11. Tasa nominal vencida → Tasa nominal adelantada',
    simboloSalida: 'f(ut1)',
    etiquetaSalida: 'Tasa Nominal Adelantada Equivalente',
    formulaMatematica: 'i_sub = (1 + j(ut2) · (fs2 / ut2))^(fs1 / fs2) − 1   →   f(ut1) = (i_sub / (1 + i_sub)) · (ut1 / fs1)',
    explicacionEconomica:
      'Convierte una tasa nominal vencida (TNA vencida) con capitalización cada fs2 días en la tasa nominal adelantada (TNA adelantada) financieramente equivalente para subperíodos fs1.',
    esAdelantadaEntrada: false,
  },
  {
    id: 12,
    nombre: '12. Tasa nominal adelantada → Tasa nominal vencida',
    simboloSalida: 'j(ut1)',
    etiquetaSalida: 'Tasa Nominal Vencida Equivalente',
    formulaMatematica: 'd_sub = 1 − (1 − f(ut2) · (fs2 / ut2))^(fs1 / fs2)   →   j(ut1) = (d_sub / (1 − d_sub)) · (ut1 / fs1)',
    explicacionEconomica:
      'Transforma una tasa nominal de descuento adelantada en su tasa nominal vencida equivalente con unidad de tiempo ut1 y frecuencia de capitalización fs1.',
    esAdelantadaEntrada: true,
  },
];


type TipoTasa = 'Tasa efectiva vencida' | 'Tasa nominal vencida' | 'Tasa efectiva adelantada' | 'Tasa nominal adelantada';

const TIPOS_TASA: TipoTasa[] = [
  'Tasa efectiva vencida',
  'Tasa nominal vencida',
  'Tasa efectiva adelantada',
  'Tasa nominal adelantada',
];

const PARES_EQUIVALENCIA: Record<number, { origen: TipoTasa; destino: TipoTasa }> = {
  1: { origen: 'Tasa efectiva vencida', destino: 'Tasa efectiva vencida' },
  2: { origen: 'Tasa nominal vencida', destino: 'Tasa efectiva vencida' },
  3: { origen: 'Tasa efectiva vencida', destino: 'Tasa nominal vencida' },
  4: { origen: 'Tasa nominal vencida', destino: 'Tasa nominal vencida' },
  5: { origen: 'Tasa efectiva adelantada', destino: 'Tasa efectiva adelantada' },
  6: { origen: 'Tasa efectiva adelantada', destino: 'Tasa nominal adelantada' },
  7: { origen: 'Tasa nominal adelantada', destino: 'Tasa efectiva adelantada' },
  8: { origen: 'Tasa nominal adelantada', destino: 'Tasa nominal adelantada' },
  9: { origen: 'Tasa efectiva vencida', destino: 'Tasa efectiva adelantada' },
  10: { origen: 'Tasa efectiva adelantada', destino: 'Tasa efectiva vencida' },
  11: { origen: 'Tasa nominal vencida', destino: 'Tasa nominal adelantada' },
  12: { origen: 'Tasa nominal adelantada', destino: 'Tasa nominal vencida' },
};

export const EquivalenciasView: React.FC<EquivalenciasViewProps> = ({ formato }) => {
  const [eleccion, setEleccion] = useState<number>(1);
  const parActual = PARES_EQUIVALENCIA[eleccion];

  const [tasaEntradaPct, setTasaEntradaPct] = useState<number>(5);
  const [ut1, setUt1] = useState<number>(365);
  const [ut2, setUt2] = useState<number>(30);
  const [fs, setFs] = useState<number>(30);
  const [fs1, setFs1] = useState<number>(60);
  const [fs2, setFs2] = useState<number>(30);

  const defActual = React.useMemo(
    () => OPCIONES_EQ.find((op) => op.id === eleccion) ?? OPCIONES_EQ[0],
    [eleccion]
  );

  const usaSoloDosUnidades = [1, 5, 9, 10].includes(eleccion);
  const usaFrecuenciaSimple = [2, 3, 6, 7].includes(eleccion);
  const usaDobleFrecuencia = [4, 8, 11, 12].includes(eleccion);
  const ordenUt1Primero = [3, 6].includes(eleccion);

  const errorValidacion = React.useMemo(() => {
    if (ut1 <= 0 || ut2 <= 0) {
      return 'Las unidades de tiempo (ut1 y ut2) deben ser mayores que cero (por ejemplo, 30 días o 365 días).';
    }
    if (usaFrecuenciaSimple && fs <= 0) {
      return 'La frecuencia de subcapitalización (fs) debe ser mayor que cero.';
    }
    if (usaDobleFrecuencia && (fs1 <= 0 || fs2 <= 0)) {
      return 'Las frecuencias de subcapitalización (fs1 y fs2) deben ser mayores que cero.';
    }
    if (defActual.esAdelantadaEntrada && tasaEntradaPct >= 100) {
      return 'Una tasa de descuento adelantada no puede ser mayor o igual al 100%, ya que anularía el valor líquido.';
    }
    if (!defActual.esAdelantadaEntrada && tasaEntradaPct <= -100) {
      return 'La tasa vencida ingresada debe ser mayor a −100%.';
    }
    return null;
  }, [ut1, ut2, fs, fs1, fs2, tasaEntradaPct, usaFrecuenciaSimple, usaDobleFrecuencia, defActual]);

  const resultadoTantoPorUno = React.useMemo(() => {
    if (errorValidacion) return 0;
    switch (eleccion) {
      case 1:
        return eq1EfectivaVencidaAEfectivaVencida(tasaEntradaPct, ut2, ut1);
      case 2:
        return eq2NominalVencidaAEfectivaVencida(tasaEntradaPct, ut2, fs, ut1);
      case 3:
        return eq3EfectivaVencidaANominalVencida(tasaEntradaPct, ut1, ut2, fs);
      case 4:
        return eq4NominalVencidaANominalVencida(tasaEntradaPct, ut2, fs2, ut1, fs1);
      case 5:
        return eq5EfectivaAdelantadaAEfectivaAdelantada(tasaEntradaPct, ut2, ut1);
      case 6:
        return eq6EfectivaAdelantadaANominalAdelantada(tasaEntradaPct, ut1, ut2, fs);
      case 7:
        return eq7NominalAdelantadaAEfectivaAdelantada(tasaEntradaPct, ut2, fs, ut1);
      case 8:
        return eq8NominalAdelantadaANominalAdelantada(tasaEntradaPct, ut2, fs2, ut1, fs1);
      case 9:
        return eq9EfectivaVencidaAEfectivaAdelantada(tasaEntradaPct, ut2, ut1);
      case 10:
        return eq10EfectivaAdelantadaAEfectivaVencida(tasaEntradaPct, ut2, ut1);
      case 11:
        return eq11NominalVencidaANominalAdelantada(tasaEntradaPct, ut2, fs2, ut1, fs1);
      case 12:
        return eq12NominalAdelantadaANominalVencida(tasaEntradaPct, ut2, fs2, ut1, fs1);
      default:
        return 0;
    }
  }, [eleccion, tasaEntradaPct, ut1, ut2, fs, fs1, fs2, errorValidacion]);

  const variablesExplicacion = React.useMemo<VariableExplicacion[]>(() => {
    const base: VariableExplicacion[] = [
      {
        simbolo: 'Tasa inicial',
        nombre: 'Tasa a convertir',
        unidad: '%',
        descripcion: 'Tasa conocida ingresada en porcentaje.',
      },
      {
        simbolo: 'ut2',
        nombre: 'Unidad de tiempo de origen',
        unidad: 'Días / Período',
        descripcion: 'Plazo al que está referida la tasa original (o la tasa nominal en opciones 3 y 6).',
      },
      {
        simbolo: 'ut1',
        nombre: 'Unidad de tiempo objetivo',
        unidad: 'Días / Período',
        descripcion: 'Plazo de la tasa resultante (o de la tasa efectiva inicial en opciones 3 y 6).',
      },
    ];
    if (usaFrecuenciaSimple) {
      base.push({
        simbolo: 'fs',
        nombre: 'Frecuencia de subcapitalización',
        unidad: 'Días / Subperíodo',
        descripcion: 'Duración del subperíodo de capitalización o actualización de la tasa nominal.',
      });
    }
    if (usaDobleFrecuencia) {
      base.push(
        {
          simbolo: 'fs2',
          nombre: 'Subperíodo de la tasa de origen',
          unidad: 'Días / Subperíodo',
          descripcion: 'Frecuencia de subcapitalización de la tasa nominal que se desea convertir.',
        },
        {
          simbolo: 'fs1',
          nombre: 'Subperíodo de la tasa resultante',
          unidad: 'Días / Subperíodo',
          descripcion: 'Frecuencia de subcapitalización de la nueva tasa nominal equivalente.',
        }
      );
    }
    return base;
  }, [usaFrecuenciaSimple, usaDobleFrecuencia]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">¿Qué tasa tenés y a cuál querés convertirla?</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Elegí el tipo de tasa que conocés y el tipo que necesitás calcular.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="eq-tipo-origen" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tengo una...
            </label>
            <select
              id="eq-tipo-origen"
              value={parActual.origen}
              onChange={(e) => {
                const primera = Object.entries(PARES_EQUIVALENCIA).find(([, par]) => par.origen === e.target.value);
                if (primera) setEleccion(Number(primera[0]));
              }}
              className="w-full px-3.5 py-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {TIPOS_TASA.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="eq-tipo-destino" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Quiero obtener una...
            </label>
            <select
              id="eq-tipo-destino"
              value={parActual.destino}
              onChange={(e) => {
                const siguiente = Object.entries(PARES_EQUIVALENCIA).find(
                  ([, par]) => par.origen === parActual.origen && par.destino === e.target.value
                );
                if (siguiente) setEleccion(Number(siguiente[0]));
              }}
              className="w-full px-3.5 py-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {Object.entries(PARES_EQUIVALENCIA)
                .filter(([, par]) => par.origen === parActual.origen)
                .map(([id, par]) => <option key={id} value={par.destino}>{par.destino}</option>)}
            </select>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          <strong>Efectiva:</strong> incorpora la capitalización del período. <strong>Nominal:</strong> se expresa para un plazo base y una frecuencia de capitalización.
          <strong> Vencida:</strong> los intereses se generan al final del período. <strong>Adelantada:</strong> se aplica como descuento al comienzo.
          También podés convertir una tasa al mismo tipo con otro plazo o frecuencia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            Datos para la conversión
          </h3>

          <div>
            <label htmlFor="eq-tasa-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Tasa que conocés (%)
            </label>
            <input
              id="eq-tasa-input"
              type="number"
              step="any"
              value={tasaEntradaPct}
              onChange={(e) => setTasaEntradaPct(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {usaSoloDosUnidades && (
            <>
              <div>
                <label htmlFor="eq-ut2" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Plazo de la tasa original (en días, por ejemplo 30)
                </label>
                <input
                  id="eq-ut2"
                  type="number"
                  step="1"
                  value={ut2}
                  onChange={(e) => setUt2(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="eq-ut1" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Plazo que querés calcular (en días, por ejemplo 365)
                </label>
                <input
                  id="eq-ut1"
                  type="number"
                  step="1"
                  value={ut1}
                  onChange={(e) => setUt1(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </>
          )}

          {usaFrecuenciaSimple && !ordenUt1Primero && (
            <>
              <div>
                <label htmlFor="eq-ut2-nom" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Plazo base de la tasa nominal (en días, por ejemplo 365)
                </label>
                <input
                  id="eq-ut2-nom"
                  type="number"
                  step="1"
                  value={ut2}
                  onChange={(e) => setUt2(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="eq-fs" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Cada cuántos días se capitaliza o descuenta (por ejemplo 30)
                </label>
                <input
                  id="eq-fs"
                  type="number"
                  step="1"
                  value={fs}
                  onChange={(e) => setFs(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="eq-ut1-ef" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Plazo de la tasa efectiva que querés obtener (en días)
                </label>
                <input
                  id="eq-ut1-ef"
                  type="number"
                  step="1"
                  value={ut1}
                  onChange={(e) => setUt1(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </>
          )}

          {usaFrecuenciaSimple && ordenUt1Primero && (
            <>
              <div>
                <label htmlFor="eq-ut1-first" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Plazo de la tasa efectiva original (en días)
                </label>
                <input
                  id="eq-ut1-first"
                  type="number"
                  step="1"
                  value={ut1}
                  onChange={(e) => setUt1(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="eq-ut2-sec" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Plazo base de la tasa nominal que querés obtener (en días)
                </label>
                <input
                  id="eq-ut2-sec"
                  type="number"
                  step="1"
                  value={ut2}
                  onChange={(e) => setUt2(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="eq-fs-sec" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Cada cuántos días se capitaliza o descuenta (por ejemplo 30)
                </label>
                <input
                  id="eq-fs-sec"
                  type="number"
                  step="1"
                  value={fs}
                  onChange={(e) => setFs(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </>
          )}

          {usaDobleFrecuencia && (
            <>
              <div>
                <label htmlFor="eq-ut2-d" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Plazo base de la tasa nominal original (en días)
                </label>
                <input
                  id="eq-ut2-d"
                  type="number"
                  step="1"
                  value={ut2}
                  onChange={(e) => setUt2(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="eq-fs2-d" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Capitalización o descuento original: cada cuántos días
                </label>
                <input
                  id="eq-fs2-d"
                  type="number"
                  step="1"
                  value={fs2}
                  onChange={(e) => setFs2(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="eq-ut1-d" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Plazo base de la tasa nominal resultante (en días)
                </label>
                <input
                  id="eq-ut1-d"
                  type="number"
                  step="1"
                  value={ut1}
                  onChange={(e) => setUt1(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label htmlFor="eq-fs1-d" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Nueva capitalización o descuento: cada cuántos días
                </label>
                <input
                  id="eq-fs1-d"
                  type="number"
                  step="1"
                  value={fs1}
                  onChange={(e) => setFs1(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-7">
          <ResultBanner
            tituloOperacion={`${parActual.origen} → ${parActual.destino}`}
            formulaMatematica={defActual.formulaMatematica}
            explicacionEconomica={defActual.explicacionEconomica}
            etiquetaResultadoPrincipal={defActual.etiquetaSalida}
            simboloResultado={defActual.simboloSalida}
            valorPrincipalExacto={resultadoTantoPorUno * 100}
            tipoValorPrincipal="porcentaje"
            formato={formato}
            entradasResumen={[
              { etiqueta: 'Tasa inicial ingresada', valor: `${tasaEntradaPct}%` },
              { etiqueta: 'Plazo 1 (días)', valor: `${ut1}` },
              { etiqueta: 'Plazo 2 (días)', valor: `${ut2}` },
              ...(usaFrecuenciaSimple ? [{ etiqueta: 'Intervalo de capitalización (días)', valor: `${fs}` }] : []),
              ...(usaDobleFrecuencia
                ? [
                    { etiqueta: 'Intervalo de capitalización original (días)', valor: `${fs2}` },
                    { etiqueta: 'Intervalo de capitalización resultante (días)', valor: `${fs1}` },
                  ]
                : []),
            ]}
            variablesExplicacion={variablesExplicacion}
            resultadosSecundarios={[
              {
                etiqueta: 'Expresión en Tanto por Uno (decimal)',
                valorFormateado: formatearTantoPorUno(resultadoTantoPorUno, formato),
                valorExacto: resultadoTantoPorUno,
              },
            ]}
            errorValidacion={errorValidacion}
          />
        </div>
      </div>
    </div>
  );
};
