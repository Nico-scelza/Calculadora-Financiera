import React, { useState, useEffect } from 'react';
import {
  Calculator,
  TrendingUp,
  Percent,
  PiggyBank,
  Wallet,
  Landmark,
  Sun,
  Moon,
  SlidersHorizontal,
} from 'lucide-react';
import { FormatoNumericoConfig, FORMATO_POR_DEFECTO } from './utils/formatters';
import { RegimenSimpleView } from './components/RegimenSimpleView';
import { RegimenCompuestoView } from './components/RegimenCompuestoView';
import { EquivalenciasView } from './components/EquivalenciasView';
import { RentasValorFinalView } from './components/RentasValorFinalView';
import { RentasValorActualView } from './components/RentasValorActualView';
import { AmortizacionView } from './components/AmortizacionView';

type ModuloId =
  | 'simple'
  | 'compuesto'
  | 'equivalencias'
  | 'rentas_vf'
  | 'rentas_va'
  | 'amortizacion';

interface ModuloMenu {
  id: ModuloId;
  numero: string;
  titulo: string;
  categoria: string;
  descripcion: string;
  icono: React.ComponentType<{ className?: string }>;
}

const MODULOS: ModuloMenu[] = [
  {
    id: 'simple',
    numero: '01',
    titulo: 'Régimen Simple',
    categoria: 'Capitalización y Descuento Lineal',
    descripcion:
      'Cálculo de monto final (con tasa fija, variable o capitalizaciones intermedias), interés devengado, capital inicial, tasa periódica y total, descuento comercial, valor actual racional y resultado financiero.',
    icono: Calculator,
  },
  {
    id: 'compuesto',
    numero: '02',
    titulo: 'Régimen Compuesto',
    categoria: 'Capitalización y Actualización Exponencial',
    descripcion:
      'Cálculo de monto compuesto (a tasa constante o variable por tramos), capital inicial, tasa efectiva periódica, valor descontado comercial, valor actual racional y descuento compuesto.',
    icono: TrendingUp,
  },
  {
    id: 'equivalencias',
    numero: '03',
    titulo: 'Equivalencia de Tasas',
    categoria: 'Conversión de Tasas de Interés y Descuento',
    descripcion:
      'Las 12 conversiones financieras entre tasas efectivas y tasas nominales, tanto vencidas como adelantadas, para cualquier unidad de tiempo y frecuencia de subcapitalización.',
    icono: Percent,
  },
  {
    id: 'rentas_vf',
    numero: '04',
    titulo: 'Rentas — Valor Final',
    categoria: 'Imposiciones y Constitución de Capitales',
    descripcion:
      'Valor final de rentas de pagos vencidos (constantes o con variación de cuota y/o tasa), pagos adelantados, intereses totales acumulados, cuota periódica necesaria y tasa efectiva implícita.',
    icono: PiggyBank,
  },
  {
    id: 'rentas_va',
    numero: '05',
    titulo: 'Rentas — Valor Actual',
    categoria: 'Actualización de Flujos Periódicos',
    descripcion:
      'Valor actual de rentas de pagos vencidos constantes y determinación del saldo de deuda prospectivo luego de haber abonado una cantidad determinada de cuotas.',
    icono: Wallet,
  },
  {
    id: 'amortizacion',
    numero: '06',
    titulo: 'Sistemas de Amortización',
    categoria: 'Análisis Integral de Préstamos',
    descripcion:
      'Sistemas Francés (cuota constante), Alemán (amortización constante) y Americano (reembolso al vencimiento), con cálculo puntual de magnitudes y cuadro de marcha completo período por período.',
    icono: Landmark,
  },
];

export function App() {
  const [moduloActivo, setModuloActivo] = useState<ModuloId>('simple');
  const [modoOscuro, setModoOscuro] = useState<boolean>(false);
  const [mostrarConfigFormato, setMostrarConfigFormato] = useState<boolean>(false);
  const [formato, setFormato] = useState<FormatoNumericoConfig>(FORMATO_POR_DEFECTO);

  useEffect(() => {
    const root = document.documentElement;
    if (modoOscuro) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [modoOscuro]);

  const infoModulo = MODULOS.find((m) => m.id === moduloActivo) ?? MODULOS[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Encabezado Principal */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-6 px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs no-print">
        <div className="min-w-0">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setModuloActivo('simple');
            }}
            className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap"
          >
            Calculadora Financiera
          </a>
          <p className="hidden xl:block text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Herramientas de matemática financiera para analizar inversiones, tasas, rentas y préstamos.
          </p>
        </div>

        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-600 dark:text-slate-300"
        >
          <button
            type="button"
            onClick={() => setModuloActivo('simple')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              moduloActivo === 'simple'
                ? 'text-blue-700 dark:text-blue-400 font-semibold underline underline-offset-4'
                : ''
            }`}
          >
            Régimen Simple
          </button>
          <button
            type="button"
            onClick={() => setModuloActivo('compuesto')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              moduloActivo === 'compuesto'
                ? 'text-blue-700 dark:text-blue-400 font-semibold underline underline-offset-4'
                : ''
            }`}
          >
            Régimen Compuesto
          </button>
          <button
            type="button"
            onClick={() => setModuloActivo('equivalencias')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              moduloActivo === 'equivalencias'
                ? 'text-blue-700 dark:text-blue-400 font-semibold underline underline-offset-4'
                : ''
            }`}
          >
            Equivalencia de Tasas
          </button>
          <button
            type="button"
            onClick={() => setModuloActivo('rentas_vf')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              moduloActivo === 'rentas_vf' || moduloActivo === 'rentas_va'
                ? 'text-blue-700 dark:text-blue-400 font-semibold underline underline-offset-4'
                : ''
            }`}
          >
            Rentas
          </button>
          <button
            type="button"
            onClick={() => setModuloActivo('amortizacion')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              moduloActivo === 'amortizacion'
                ? 'text-blue-700 dark:text-blue-400 font-semibold underline underline-offset-4'
                : ''
            }`}
          >
            Amortización
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setModoOscuro(!modoOscuro)}
            aria-label={modoOscuro ? 'Activar modo claro' : 'Activar modo oscuro'}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-blue-600 rounded-lg hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0"
          >
            {modoOscuro ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {modoOscuro ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
        </div>
      </header>

      {/* Contenedor Principal: Sidebar + Área de Trabajo */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 sm:px-6 py-6">
        {/* Menú de Módulos Financieros */}
        <aside className="lg:col-span-3 space-y-4 no-print">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-1">
            <div className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Módulos de Cálculo
            </div>
            <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {MODULOS.map((mod) => {
                const Icono = mod.icono;
                const activo = moduloActivo === mod.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setModuloActivo(mod.id)}
                    className={`flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-colors whitespace-nowrap lg:whitespace-normal shrink-0 lg:w-full ${
                      activo
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icono className={`w-4 h-4 shrink-0 ${activo ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">
                        {mod.numero}. {mod.titulo}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel de Configuración de Formato Numérico */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <button
              type="button"
              onClick={() => setMostrarConfigFormato(!mostrarConfigFormato)}
              aria-expanded={mostrarConfigFormato}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Preferencias de Formato
              </span>
              <span className="text-[11px] font-normal text-blue-600 dark:text-blue-400">
                {mostrarConfigFormato ? 'Ocultar' : 'Configurar'}
              </span>
            </button>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Personalice la cantidad de decimales, el separador numérico y el símbolo monetario de visualización.
            </p>

            {mostrarConfigFormato && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="fmt-dec-monto" className="block text-[11px] text-slate-500 mb-1">
                      Decimales importe
                    </label>
                    <select
                      id="fmt-dec-monto"
                      value={formato.decimalesMonto}
                      onChange={(e) =>
                        setFormato({ ...formato, decimalesMonto: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                    >
                      <option value={0}>0</option>
                      <option value={2}>2</option>
                      <option value={4}>4</option>
                      <option value={6}>6</option>
                      <option value={8}>8</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="fmt-dec-tasa" className="block text-[11px] text-slate-500 mb-1">
                      Decimales tasa
                    </label>
                    <select
                      id="fmt-dec-tasa"
                      value={formato.decimalesTasa}
                      onChange={(e) =>
                        setFormato({ ...formato, decimalesTasa: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                    >
                      <option value={2}>2</option>
                      <option value={4}>4</option>
                      <option value={6}>6</option>
                      <option value={8}>8</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="fmt-sep" className="block text-[11px] text-slate-500 mb-1">
                      Separador decimal
                    </label>
                    <select
                      id="fmt-sep"
                      value={formato.separadorDecimal}
                      onChange={(e) =>
                        setFormato({
                          ...formato,
                          separadorDecimal: e.target.value as ',' | '.',
                        })
                      }
                      className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    >
                      <option value=",">Coma (1.234,56)</option>
                      <option value=".">Punto (1,234.56)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="fmt-moneda" className="block text-[11px] text-slate-500 mb-1">
                      Símbolo monetario
                    </label>
                    <select
                      id="fmt-moneda"
                      value={formato.simboloMoneda}
                      onChange={(e) =>
                        setFormato({ ...formato, simboloMoneda: e.target.value })
                      }
                      className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                    >
                      <option value="$">$ (Peso / Dólar)</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="">Sin símbolo</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formato.mostrarPrecisionCompleta}
                    onChange={(e) =>
                      setFormato({ ...formato, mostrarPrecisionCompleta: e.target.checked })
                    }
                    className="rounded border-slate-300 text-blue-600"
                  />
                  Mostrar todos los decimales disponibles
                </label>
              </div>
            )}
          </div>
        </aside>

        {/* Área de Trabajo Principal */}
        <main className="lg:col-span-9 space-y-6">
          {/* Encabezado contextual del módulo activo */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400">
              <span>Módulo {infoModulo.numero}</span>
              <span aria-hidden="true">·</span>
              <span>{infoModulo.categoria}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              {infoModulo.titulo}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-3xl">
              {infoModulo.descripcion}
            </p>
          </div>

          {/* Vista dinámica según módulo */}
          {moduloActivo === 'simple' && <RegimenSimpleView formato={formato} />}
          {moduloActivo === 'compuesto' && <RegimenCompuestoView formato={formato} />}
          {moduloActivo === 'equivalencias' && <EquivalenciasView formato={formato} />}
          {moduloActivo === 'rentas_vf' && <RentasValorFinalView formato={formato} />}
          {moduloActivo === 'rentas_va' && <RentasValorActualView formato={formato} />}
          {moduloActivo === 'amortizacion' && <AmortizacionView formato={formato} />}
        </main>
      </div>

      {/* Pie de página institucional */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 px-6 text-xs text-slate-500 dark:text-slate-400 no-print">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-medium text-slate-700 dark:text-slate-300">
            Calculadora Financiera
          </div>
          <div>
            Herramientas de matemática financiera para analizar inversiones, tasas, rentas y préstamos.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
