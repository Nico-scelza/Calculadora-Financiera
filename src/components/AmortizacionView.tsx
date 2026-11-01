import React, { useState } from 'react';
import {
  sf1ValorPrestamo,
  sf2ValorCuota,
  sf3CuotaAmortizacion,
  sf4CuotaInteres,
  sf5AmortizacionAcumulada,
  sf6SaldoDeuda,
  sf7InteresesPagados,
  sf8InteresesTotales,
  sa1ValorPrestamo,
  sa2ValorCuota,
  sa3CuotaAmortizacion,
  sa4CuotaInteres,
  sa5AmortizacionAcumulada,
  sa6SaldoDeuda,
  sa7InteresesPagados,
  sa8InteresesTotales,
  sam1ValorCuota,
  sam2InteresesPagados,
  sam3InteresesTotales,
  generarTablaAmortizacion,
  LIMITE_MAXIMO_PERIODOS_TABLA,
} from '../engine/financialEngine';
import { FormatoNumericoConfig, formatearMoneda } from '../utils/formatters';
import { ResultBanner } from './ResultBanner';
import { FinancialChart } from './FinancialChart';

interface AmortizacionViewProps {
  formato: FormatoNumericoConfig;
}

type SistemaTipo = 'frances' | 'aleman' | 'americano';

const OPCIONES_FRANCES_ALEMAN = [
  { id: 1, nombre: '1. Valor del préstamo (V)' },
  { id: 2, nombre: '2. Valor de la cuota (ch)' },
  { id: 3, nombre: '3. Cuota de amortización (th)' },
  { id: 4, nombre: '4. Cuota de interés (Ih)' },
  { id: 5, nombre: '5. Amortización acumulada' },
  { id: 6, nombre: '6. Saldo de deuda (SD)' },
  { id: 7, nombre: '7. Intereses pagados acumulados' },
  { id: 8, nombre: '8. Intereses totales (TI)' },
];

const OPCIONES_AMERICANO = [
  { id: 1, nombre: '1. Valor de la cuota periódica (ch)' },
  { id: 2, nombre: '2. Intereses pagados hasta h (Ih)' },
  { id: 3, nombre: '3. Intereses totales (IT)' },
];

export const AmortizacionView: React.FC<AmortizacionViewProps> = ({ formato }) => {
  const [sistema, setSistema] = useState<SistemaTipo>('frances');
  const [opcion, setOpcion] = useState<number>(2);

  // Parámetros sincronizados
  const [V, setV] = useState<number>(100000);
  const [iPct, setIPct] = useState<number>(5);
  const [n, setN] = useState<number>(12);
  // h representa cantidad de cuotas canceladas (en op 5, 6, 7 de Francés/Alemán y op 2 de Americano)
  // o las cuotas previas canceladas en op 4 (donde el período en curso es p = h + 1).
  const [h, setH] = useState<number>(4);
  // Para Opción 3 de Francés (amortización del período p), el índice es el período p (1 <= p <= n).
  const [periodoP, setPeriodoP] = useState<number>(4);

  const [chInput, setChInput] = useState<number>(11282.541002);
  const [thInput, setThInput] = useState<number>(8333.333333);
  const [ihInput, setIhInput] = useState<number>(3000);

  const handleCambioSistema = (nuevo: SistemaTipo) => {
    setSistema(nuevo);
    setOpcion(1);
  };

  const chTeoricaFrances = React.useMemo(() => sf2ValorCuota(V, iPct, n), [V, iPct, n]);
  const thTeoricaAleman = React.useMemo(() => sa3CuotaAmortizacion(V, n), [V, n]);

  // Validaciones financieras explícitas y claras para el usuario
  const errorValidacion = React.useMemo(() => {
    if (n <= 0 || !Number.isInteger(n)) {
      return 'La cantidad total de períodos (n) debe ser un número entero mayor o igual a 1.';
    }
    if (n > LIMITE_MAXIMO_PERIODOS_TABLA) {
      return `La cantidad de períodos ingresada (n = ${n}) supera el límite máximo soportado de ${LIMITE_MAXIMO_PERIODOS_TABLA} períodos. Ingrese un plazo entre 1 y ${LIMITE_MAXIMO_PERIODOS_TABLA}.`;
    }
    if (iPct < 0) {
      return 'La tasa de interés periódica (i) debe ser mayor o igual a 0%.';
    }
    if (sistema === 'frances' && opcion === 3) {
      if (periodoP < 1 || periodoP > n) {
        return `El período de cuota a consultar (p = ${periodoP}) debe estar comprendido entre 1 y el total de períodos del préstamo (n = ${n}).`;
      }
    }
    if ((sistema === 'frances' || sistema === 'aleman') && opcion === 4) {
      if (h < 0 || h >= n) {
        return `La cantidad de cuotas ya canceladas antes del período (h = ${h}) debe estar entre 0 (para consultar el interés de la 1.ª cuota) y n − 1 = ${n - 1} (para consultar el interés de la última cuota).`;
      }
    }
    if ((sistema === 'frances' || sistema === 'aleman') && [5, 6, 7].includes(opcion)) {
      if (h < 0 || h > n) {
        return `La cantidad de cuotas canceladas (h = ${h}) debe ubicarse entre 0 y el total de cuotas del préstamo (n = ${n}).`;
      }
    }
    if (sistema === 'americano' && opcion === 2) {
      if (h < 0 || h > n) {
        return `La cantidad de cuotas abonadas (h = ${h}) debe ubicarse entre 0 y el plazo total (n = ${n}).`;
      }
    }
    return null;
  }, [sistema, opcion, n, iPct, h, periodoP]);

  // Tabla de amortización completa generada a partir de V, iPct, n
  const tablaMarcha = React.useMemo(
    () => (n > 0 && n <= LIMITE_MAXIMO_PERIODOS_TABLA && iPct >= 0 ? generarTablaAmortizacion(sistema, V, iPct, n) : []),
    [sistema, V, iPct, n]
  );

  const calculo = React.useMemo(() => {
    if (sistema === 'frances') {
      switch (opcion) {
        case 1: {
          const val = errorValidacion ? 0 : sf1ValorPrestamo(chInput, iPct, n);
          return {
            titulo: 'Sistema Francés — 1. Valor del Préstamo (V)',
            formula: 'V = ch · ((1 − (1 + i)^(−n)) / i)',
            explicacion:
              'Determina el capital inicial máximo que puede tomarse en préstamo abonando n cuotas constantes vencidas de importe ch a la tasa efectiva periódica i.',
            etiqueta: 'Valor Inicial del Préstamo',
            simbolo: 'V',
            valor: val,
            entradas: [
              { etiqueta: 'Valor de la cuota constante (ch)', valor: formatearMoneda(chInput, formato) },
              { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
              { etiqueta: 'Cantidad total de períodos (n)', valor: `${n}` },
            ],
            variables: [
              { simbolo: 'ch', nombre: 'Cuota constante', unidad: 'Moneda', descripcion: 'Cuota periódica total (capital más interés).' },
              { simbolo: 'i', nombre: 'Tasa de interés', unidad: '%', descripcion: 'Tasa efectiva del período.' },
              { simbolo: 'n', nombre: 'Cantidad de períodos', unidad: 'Períodos', descripcion: 'Total de cuotas del préstamo.' },
            ],
            secundarios: [
              {
                etiqueta: 'Total de cuotas a abonar (ch · n)',
                valorFormateado: formatearMoneda(chInput * n, formato),
                valorExacto: chInput * n,
              },
              {
                etiqueta: 'Intereses totales implícitos (ch · n − V)',
                valorFormateado: formatearMoneda(chInput * n - val, formato),
                valorExacto: chInput * n - val,
              },
            ],
          };
        }
        case 2: {
          const val = errorValidacion ? 0 : sf2ValorCuota(V, iPct, n);
          return {
            titulo: 'Sistema Francés — 2. Valor de la Cuota Constante (ch)',
            formula: 'ch = (V · i) / (1 − (1 + i)^(−n))',
            explicacion:
              'En el Sistema Francés (amortización progresiva), el deudor abona una cuota total constante ch en cada vencimiento, compuesta por una proporción creciente de capital y decreciente de interés.',
            etiqueta: 'Valor de la Cuota Constante',
            simbolo: 'ch',
            valor: val,
            entradas: [
              { etiqueta: 'Valor del préstamo (V)', valor: formatearMoneda(V, formato) },
              { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
              { etiqueta: 'Cantidad total de períodos (n)', valor: `${n}` },
            ],
            variables: [
              { simbolo: 'V', nombre: 'Valor del préstamo', unidad: 'Moneda', descripcion: 'Capital inicial otorgado.' },
              { simbolo: 'i', nombre: 'Tasa de interés', unidad: '%', descripcion: 'Tasa efectiva periódica.' },
              { simbolo: 'n', nombre: 'Cantidad de períodos', unidad: 'Períodos', descripcion: 'Plazo total en cuotas.' },
            ],
            secundarios: [
              {
                etiqueta: 'Intereses totales del préstamo (TI = ch · n − V)',
                valorFormateado: formatearMoneda(val * n - V, formato),
                valorExacto: val * n - V,
              },
            ],
          };
        }
        case 3: {
          const val = errorValidacion ? 0 : sf3CuotaAmortizacion(chInput, n, periodoP, iPct);
          return {
            titulo: `Sistema Francés — 3. Cuota de Amortización del Período p = ${periodoP}`,
            formula: 't_p = ch · (1 + i)^(−(n − p + 1))',
            explicacion:
              `Representa la porción de capital puro contenida dentro de la cuota número ${periodoP}. En el Sistema Francés las cuotas de amortización crecen en progresión geométrica de razón (1 + i).`,
            etiqueta: `Amortización de Capital del Período ${periodoP}`,
            simbolo: `t_${periodoP}`,
            valor: val,
            entradas: [
              { etiqueta: 'Valor de la cuota constante (ch)', valor: formatearMoneda(chInput, formato) },
              { etiqueta: 'Cantidad total de períodos (n)', valor: `${n}` },
              { etiqueta: 'Período consultado (p)', valor: `${periodoP}` },
              { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
            ],
            variables: [
              { simbolo: 'ch', nombre: 'Valor de la cuota', unidad: 'Moneda', descripcion: 'Cuota constante total.' },
              { simbolo: 'n', nombre: 'Total de períodos', unidad: 'Períodos', descripcion: 'Total de cuotas del préstamo.' },
              { simbolo: 'p', nombre: 'Período objetivo', unidad: 'Período', descripcion: 'Número de cuota cuyo capital amortizado se consulta (1 ≤ p ≤ n).' },
              { simbolo: 'i', nombre: 'Tasa de interés', unidad: '%', descripcion: 'Tasa efectiva periódica.' },
            ],
            secundarios: [
              {
                etiqueta: `Componente de interés de ese mismo período (I_${periodoP} = ch − t_${periodoP})`,
                valorFormateado: formatearMoneda(chInput - val, formato),
                valorExacto: chInput - val,
              },
            ],
          };
        }
        case 4: {
          const val = errorValidacion ? 0 : sf4CuotaInteres(chInput, iPct, n, h);
          const periodoActual = h + 1;
          return {
            titulo: `Sistema Francés — 4. Cuota de Interés tras ${h} cuotas canceladas (Período ${periodoActual})`,
            formula: 'SD_h = ch · ((1 − (1 + i)^(−(n − h))) / i)   →   I_{h+1} = SD_h · i',
            explicacion:
              `Calcula el interés devengado sobre el saldo de deuda vigente luego de haber cancelado h = ${h} cuotas (es decir, el componente de interés correspondiente a la cuota del período p = ${periodoActual}).`,
            etiqueta: `Cuota de Interés (Período ${periodoActual}, tras ${h} pagos)`,
            simbolo: 'Ih',
            valor: val,
            entradas: [
              { etiqueta: 'Valor de la cuota constante (ch)', valor: formatearMoneda(chInput, formato) },
              { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
              { etiqueta: 'Cantidad total de períodos (n)', valor: `${n}` },
              { etiqueta: 'Cuotas previas canceladas (h)', valor: `${h} (Período en curso: ${periodoActual})` },
            ],
            variables: [
              { simbolo: 'h', nombre: 'Períodos cancelados', unidad: 'Cuotas', descripcion: 'Cantidad de cuotas ya abonadas al inicio del período (h = 0 para el primer período).' },
              { simbolo: 'SD_h', nombre: 'Saldo de deuda en h', unidad: 'Moneda', descripcion: 'Capital adeudado sobre el cual se calcula el interés del período h + 1.' },
              { simbolo: 'Ih', nombre: 'Cuota de interés', unidad: 'Moneda', descripcion: 'Interés devengado en el período (SD_h · i).' },
            ],
          };
        }
        case 5: {
          const val = errorValidacion ? 0 : sf5AmortizacionAcumulada(V, chInput, iPct, n, h);
          return {
            titulo: `Sistema Francés — 5. Amortización Acumulada tras ${h} cuotas`,
            formula: 'SD_h = ch · ((1 − (1 + i)^(−(n − h))) / i)   →   T_h = V − SD_h',
            explicacion:
              `Mide el total de capital puro que ya ha sido devuelto luego de abonar las primeras h = ${h} cuotas, obtenido como la diferencia entre el préstamo original V y el saldo de deuda remanente SD_h.`,
            etiqueta: 'Capital Amortizado Acumulado',
            simbolo: 'T_h',
            valor: val,
            entradas: [
              { etiqueta: 'Valor del préstamo (V)', valor: formatearMoneda(V, formato) },
              { etiqueta: 'Valor de la cuota (ch)', valor: formatearMoneda(chInput, formato) },
              { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
              { etiqueta: 'Total de períodos (n)', valor: `${n}` },
              { etiqueta: 'Períodos cancelados (h)', valor: `${h}` },
            ],
            variables: [
              { simbolo: 'V', nombre: 'Valor del préstamo', unidad: 'Moneda', descripcion: 'Capital original prestado.' },
              { simbolo: 'SD_h', nombre: 'Saldo de deuda', unidad: 'Moneda', descripcion: 'Capital aún pendiente tras h pagos.' },
              { simbolo: 'T_h', nombre: 'Amortización acumulada', unidad: 'Moneda', descripcion: 'Capital ya cancelado hasta la cuota h.' },
            ],
          };
        }
        case 6: {
          const val = errorValidacion ? 0 : sf6SaldoDeuda(chInput, iPct, n, h);
          return {
            titulo: `Sistema Francés — 6. Saldo de Deuda tras ${h} cuotas (SD)`,
            formula: 'SD_h = ch · ((1 − (1 + i)^(−(n − h))) / i)',
            explicacion:
              `Representa el capital que resta amortizar inmediatamente después de pagar la cuota h = ${h}, calculado como el valor actual de las (n − h) cuotas futuras pendientes.`,
            etiqueta: 'Saldo de Deuda Pendiente',
            simbolo: 'SD_h',
            valor: val,
            entradas: [
              { etiqueta: 'Valor de la cuota constante (ch)', valor: formatearMoneda(chInput, formato) },
              { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
              { etiqueta: 'Cantidad total de períodos (n)', valor: `${n}` },
              { etiqueta: 'Períodos cancelados (h)', valor: `${h}` },
            ],
            variables: [
              { simbolo: 'ch', nombre: 'Valor de la cuota', unidad: 'Moneda', descripcion: 'Cuota constante del sistema francés.' },
              { simbolo: 'n − h', nombre: 'Cuotas por vencer', unidad: 'Períodos', descripcion: 'Cantidad de cuotas pendientes de pago.' },
            ],
          };
        }
        case 7: {
          const val = errorValidacion ? 0 : sf7InteresesPagados(V, chInput, iPct, n, h);
          return {
            titulo: `Sistema Francés — 7. Intereses Pagados Acumulados hasta la cuota ${h}`,
            formula: 'T_h = V − SD_h   →   I_{acum, h} = (h · ch) − T_h',
            explicacion:
              `Determina la suma total de intereses abonados durante las primeras h = ${h} cuotas, restando del total desembolsado (h · ch) la porción destinada a amortizar capital (T_h).`,
            etiqueta: 'Intereses Pagados Acumulados',
            simbolo: 'I_acum',
            valor: val,
            entradas: [
              { etiqueta: 'Valor del préstamo (V)', valor: formatearMoneda(V, formato) },
              { etiqueta: 'Valor de la cuota (ch)', valor: formatearMoneda(chInput, formato) },
              { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
              { etiqueta: 'Total de períodos (n)', valor: `${n}` },
              { etiqueta: 'Períodos cancelados (h)', valor: `${h}` },
            ],
            variables: [
              { simbolo: 'h · ch', nombre: 'Total desembolsado hasta h', unidad: 'Moneda', descripcion: 'Suma de las primeras h cuotas totales.' },
              { simbolo: 'T_h', nombre: 'Capital amortizado hasta h', unidad: 'Moneda', descripcion: 'Porción de capital cancelada (V − SD_h).' },
            ],
          };
        }
        default: {
          const val = errorValidacion ? 0 : sf8InteresesTotales(V, chInput, n);
          return {
            titulo: 'Sistema Francés — 8. Intereses Totales del Préstamo (TI)',
            formula: 'TI = (ch · n) − V',
            explicacion:
              'Calcula el costo financiero total nominal en concepto de intereses a lo largo de toda la vida del préstamo, comparando la suma de las n cuotas con el capital recibido V.',
            etiqueta: 'Intereses Totales',
            simbolo: 'TI',
            valor: val,
            entradas: [
              { etiqueta: 'Valor del préstamo (V)', valor: formatearMoneda(V, formato) },
              { etiqueta: 'Valor de la cuota (ch)', valor: formatearMoneda(chInput, formato) },
              { etiqueta: 'Cantidad total de períodos (n)', valor: `${n}` },
            ],
            variables: [
              { simbolo: 'V', nombre: 'Valor del préstamo', unidad: 'Moneda', descripcion: 'Capital inicial.' },
              { simbolo: 'ch', nombre: 'Valor de la cuota', unidad: 'Moneda', descripcion: 'Cuota periódica constante.' },
              { simbolo: 'n', nombre: 'Cantidad de períodos', unidad: 'Períodos', descripcion: 'Total de cuotas.' },
            ],
          };
        }
      }
    }

    if (sistema === 'aleman') {
      switch (opcion) {
        case 1: {
          const val = errorValidacion ? 0 : sa1ValorPrestamo(thInput, n);
          return {
            titulo: 'Sistema Alemán — 1. Valor del Préstamo (V)',
            formula: 'V = th · n',
            explicacion:
              'En el Sistema Alemán cada período amortiza una fracción constante del capital (th = V / n), por lo que el valor original del préstamo es el producto de la cuota de amortización constante por el número de períodos.',
            etiqueta: 'Valor del Préstamo',
            simbolo: 'V',
            valor: val,
            entradas: [
              { etiqueta: 'Cuota de amortización constante (th)', valor: formatearMoneda(thInput, formato) },
              { etiqueta: 'Cantidad total de períodos (n)', valor: `${n}` },
            ],
            variables: [
              { simbolo: 'th', nombre: 'Cuota de amortización constante', unidad: 'Moneda', descripcion: 'Capital puro amortizado en cada período.' },
              { simbolo: 'n', nombre: 'Cantidad de períodos', unidad: 'Períodos', descripcion: 'Total de cuotas del préstamo.' },
            ],
          };
        }
        case 2: {
          const val = errorValidacion ? 0 : sa2ValorCuota(thInput, ihInput);
          return {
            titulo: 'Sistema Alemán — 2. Valor de la Cuota Total del Período (ch)',
            formula: 'ch = th + ih',
            explicacion:
              'Calcula el importe total de una cuota sumando el componente de amortización constante (th) y la cuota de interés correspondiente a ese período (ih).',
            etiqueta: 'Valor de la Cuota Total',
            simbolo: 'ch',
            valor: val,
            entradas: [
              { etiqueta: 'Cuota de amortización (th)', valor: formatearMoneda(thInput, formato) },
              { etiqueta: 'Cuota de interés del período (ih)', valor: formatearMoneda(ihInput, formato) },
            ],
            variables: [
              { simbolo: 'th', nombre: 'Cuota de amortización', unidad: 'Moneda', descripcion: 'Componente constante de capital.' },
              { simbolo: 'ih', nombre: 'Cuota de interés', unidad: 'Moneda', descripcion: 'Componente de interés sobre saldo del período.' },
            ],
          };
        }
        case 3: {
          const val = errorValidacion ? 0 : sa3CuotaAmortizacion(V, n);
          return {
            titulo: 'Sistema Alemán — 3. Cuota de Amortización Constante (th)',
            formula: 'th = V / n',
            explicacion:
              'En el Sistema Alemán el capital prestado V se divide en n partes iguales, de modo que en cada vencimiento se cancela exactamente la misma cuota de amortización real th.',
            etiqueta: 'Cuota de Amortización Constante',
            simbolo: 'th',
            valor: val,
            entradas: [
              { etiqueta: 'Valor del préstamo (V)', valor: formatearMoneda(V, formato) },
              { etiqueta: 'Cantidad total de períodos (n)', valor: `${n}` },
            ],
            variables: [
              { simbolo: 'V', nombre: 'Valor del préstamo', unidad: 'Moneda', descripcion: 'Capital inicial prestado.' },
              { simbolo: 'n', nombre: 'Cantidad de períodos', unidad: 'Períodos', descripcion: 'Número total de cuotas.' },
            ],
          };
        }
        case 4: {
          const val = errorValidacion ? 0 : sa4CuotaInteres(n, h, thInput, iPct);
          const periodoActual = h + 1;
          return {
            titulo: `Sistema Alemán — 4. Cuota de Interés tras ${h} cuotas canceladas (Período ${periodoActual})`,
            formula: 'SD_h = (n − h) · th   →   I_{h+1} = SD_h · i',
            explicacion:
              `Determina el interés devengado sobre el saldo de deuda vigente luego de haber cancelado h = ${h} cuotas (correspondiente al período en curso p = ${periodoActual}).`,
            etiqueta: `Cuota de Interés (Período ${periodoActual}, tras ${h} pagos)`,
            simbolo: 'Ih',
            valor: val,
            entradas: [
              { etiqueta: 'Cantidad total de períodos (n)', valor: `${n}` },
              { etiqueta: 'Cuotas previas canceladas (h)', valor: `${h} (Período en curso: ${periodoActual})` },
              { etiqueta: 'Cuota de amortización constante (th)', valor: formatearMoneda(thInput, formato) },
              { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
            ],
            variables: [
              { simbolo: 'SD_h', nombre: 'Saldo de deuda (n − h) · th', unidad: 'Moneda', descripcion: 'Saldo vigente luego de cancelar h cuotas.' },
              { simbolo: 'Ih', nombre: 'Cuota de interés', unidad: 'Moneda', descripcion: 'Interés devengado sobre dicho saldo en el período h + 1.' },
            ],
          };
        }
        case 5: {
          const val = errorValidacion ? 0 : sa5AmortizacionAcumulada(h, thInput);
          return {
            titulo: `Sistema Alemán — 5. Amortización Acumulada tras ${h} cuotas`,
            formula: 'T_h = h · th',
            explicacion:
              `Al ser constante la amortización de capital en cada cuota, el capital acumulado amortizado tras abonar h = ${h} cuotas es el producto directo de h por la cuota de amortización th.`,
            etiqueta: 'Amortización Acumulada',
            simbolo: 'T_h',
            valor: val,
            entradas: [
              { etiqueta: 'Cuotas canceladas (h)', valor: `${h}` },
              { etiqueta: 'Cuota de amortización (th)', valor: formatearMoneda(thInput, formato) },
            ],
            variables: [
              { simbolo: 'h', nombre: 'Cantidad de cuotas canceladas', unidad: 'Cuotas', descripcion: 'Períodos ya abonados (0 ≤ h ≤ n).' },
              { simbolo: 'th', nombre: 'Cuota de amortización', unidad: 'Moneda', descripcion: 'Amortización periódica constante.' },
            ],
          };
        }
        case 6: {
          const val = errorValidacion ? 0 : sa6SaldoDeuda(n, h, thInput);
          return {
            titulo: `Sistema Alemán — 6. Saldo de Deuda tras ${h} cuotas (SD)`,
            formula: 'SD_h = (n − h) · th',
            explicacion:
              `Mide el capital aún adeudado luego de haber pagado h = ${h} cuotas, equivalente a las (n − h) cuotas de amortización constantes que restan por vencer.`,
            etiqueta: 'Saldo de Deuda Pendiente',
            simbolo: 'SD_h',
            valor: val,
            entradas: [
              { etiqueta: 'Cantidad total de períodos (n)', valor: `${n}` },
              { etiqueta: 'Cuotas canceladas (h)', valor: `${h}` },
              { etiqueta: 'Cuota de amortización (th)', valor: formatearMoneda(thInput, formato) },
            ],
            variables: [
              { simbolo: 'n − h', nombre: 'Cuotas pendientes', unidad: 'Cuotas', descripcion: 'Períodos que restan por amortizar.' },
              { simbolo: 'th', nombre: 'Cuota de amortización', unidad: 'Moneda', descripcion: 'Amortización constante por período.' },
            ],
          };
        }
        case 7: {
          const val = errorValidacion ? 0 : sa7InteresesPagados(V, n, h, iPct);
          const thReal = n > 0 ? V / n : 0;
          const i1 = V * (iPct / 100);
          const ihUltimo = h > 0 ? (n - h + 1) * thReal * (iPct / 100) : 0;
          return {
            titulo: `Sistema Alemán — 7. Intereses Pagados Acumulados en las primeras ${h} cuotas`,
            formula: 'I_1 = V · i ;  I_h = (n − h + 1) · th · i   →   I_{acum, h} = ((I_1 + I_h) / 2) · h',
            explicacion:
              `Suma en progresión aritmética los intereses devengados y pagados desde la cuota 1 hasta la cuota h = ${h} inclusive, promediando el interés del primer período (I_1 = V · i) y el interés del período h-ésimo (I_h = SD_{h−1} · i) multiplicado por h.`,
            etiqueta: 'Intereses Pagados Acumulados',
            simbolo: 'I_{acum, h}',
            valor: val,
            entradas: [
              { etiqueta: 'Valor del préstamo (V)', valor: formatearMoneda(V, formato) },
              { etiqueta: 'Cantidad total de períodos (n)', valor: `${n}` },
              { etiqueta: 'Cuotas pagadas (h)', valor: `${h}` },
              { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
            ],
            variables: [
              { simbolo: 'I_1', nombre: 'Interés del 1.º período', unidad: 'Moneda', descripcion: 'Interés calculado sobre el préstamo total inicial (V · i).' },
              { simbolo: 'I_h', nombre: 'Interés del período h', unidad: 'Moneda', descripcion: 'Interés sobre el saldo al inicio del período h: SD_{h−1} · i = (n − h + 1) · th · i.' },
              { simbolo: 'h', nombre: 'Cuotas abonadas', unidad: 'Cuotas', descripcion: 'Cantidad de períodos cuyos intereses se acumulan (0 ≤ h ≤ n).' },
            ],
            secundarios:
              h > 0
                ? [
                    {
                      etiqueta: 'Interés del 1.º período (I_1 = V · i)',
                      valorFormateado: formatearMoneda(i1, formato),
                      valorExacto: i1,
                    },
                    {
                      etiqueta: `Interés del período h = ${h} (I_${h} = SD_${h - 1} · i)`,
                      valorFormateado: formatearMoneda(ihUltimo, formato),
                      valorExacto: ihUltimo,
                    },
                  ]
                : [],
          };
        }
        default: {
          const val = errorValidacion ? 0 : sa8InteresesTotales(V, iPct, n);
          return {
            titulo: 'Sistema Alemán — 8. Intereses Totales del Préstamo (TI)',
            formula: 'TI = V · i · ((n + 1) / 2)',
            explicacion:
              'Calcula la suma total de los intereses de las n cuotas del préstamo bajo el Sistema Alemán, equivalente a evaluar los intereses acumulados en h = n.',
            etiqueta: 'Intereses Totales',
            simbolo: 'TI',
            valor: val,
            entradas: [
              { etiqueta: 'Valor del préstamo (V)', valor: formatearMoneda(V, formato) },
              { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
              { etiqueta: 'Cantidad total de períodos (n)', valor: `${n}` },
            ],
            variables: [
              { simbolo: 'V', nombre: 'Valor del préstamo', unidad: 'Moneda', descripcion: 'Capital inicial.' },
              { simbolo: 'i', nombre: 'Tasa de interés', unidad: '%', descripcion: 'Tasa efectiva periódica.' },
              { simbolo: 'n', nombre: 'Cantidad de períodos', unidad: 'Períodos', descripcion: 'Total de cuotas.' },
            ],
          };
        }
      }
    }

    // Sistema Americano
    if (opcion === 1) {
      const val = errorValidacion ? 0 : sam1ValorCuota(V, iPct);
      return {
        titulo: 'Sistema Americano — 1. Valor de la Cuota Periódica de Interés (ch)',
        formula: 'ch = V · i',
        explicacion:
          'En el Sistema Americano (Bullet), durante los primeros n − 1 períodos se abonan únicamente los intereses periódicos V · i, y en el último vencimiento n se devuelve el 100% del capital V junto con el último interés.',
        etiqueta: 'Cuota Periódica de Interés',
        simbolo: 'ch',
        valor: val,
        entradas: [
          { etiqueta: 'Valor del préstamo (V)', valor: formatearMoneda(V, formato) },
          { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
        ],
        variables: [
          { simbolo: 'V', nombre: 'Valor del préstamo', unidad: 'Moneda', descripcion: 'Capital íntegro reembolsable al vencimiento final.' },
          { simbolo: 'i', nombre: 'Tasa de interés', unidad: '%', descripcion: 'Tasa efectiva periódica.' },
        ],
        secundarios: [
          {
            etiqueta: 'Desembolso final en el último período (V + V · i)',
            valorFormateado: formatearMoneda(V + val, formato),
            valorExacto: V + val,
          },
        ],
      };
    }
    if (opcion === 2) {
      const val = errorValidacion ? 0 : sam2InteresesPagados(V, iPct, h);
      return {
        titulo: `Sistema Americano — 2. Intereses Pagados tras ${h} cuotas (Ih)`,
        formula: 'Ih = (V · i) · h',
        explicacion:
          'Como el saldo de deuda permanece constante e igual a V durante toda la vida del préstamo, el interés acumulado hasta la cuota h es directamente proporcional al número de cuotas pagadas.',
        etiqueta: `Intereses Pagados hasta la cuota ${h}`,
        simbolo: 'Ih',
        valor: val,
        entradas: [
          { etiqueta: 'Valor del préstamo (V)', valor: formatearMoneda(V, formato) },
          { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
          { etiqueta: 'Cuotas canceladas (h)', valor: `${h}` },
        ],
        variables: [
          { simbolo: 'V', nombre: 'Valor del préstamo', unidad: 'Moneda', descripcion: 'Capital constante durante la vigencia del préstamo.' },
          { simbolo: 'h', nombre: 'Cuotas canceladas', unidad: 'Cuotas', descripcion: 'Períodos de interés abonados.' },
        ],
      };
    }
    const val = errorValidacion ? 0 : sam3InteresesTotales(V, iPct, n);
    return {
      titulo: 'Sistema Americano — 3. Intereses Totales (IT)',
      formula: 'IT = (V · i) · n',
      explicacion:
        'Determina la suma total de intereses pagados a lo largo de los n períodos del préstamo bajo el Sistema Americano.',
      etiqueta: 'Intereses Totales',
      simbolo: 'IT',
      valor: val,
      entradas: [
        { etiqueta: 'Valor del préstamo (V)', valor: formatearMoneda(V, formato) },
        { etiqueta: 'Tasa efectiva periódica (i)', valor: `${iPct}%` },
        { etiqueta: 'Cantidad total de cuotas (n)', valor: `${n}` },
      ],
      variables: [
        { simbolo: 'V', nombre: 'Valor del préstamo', unidad: 'Moneda', descripcion: 'Capital prestado.' },
        { simbolo: 'i', nombre: 'Tasa de interés', unidad: '%', descripcion: 'Tasa efectiva periódica.' },
        { simbolo: 'n', nombre: 'Cantidad total de cuotas', unidad: 'Cuotas', descripcion: 'Plazo total del préstamo.' },
      ],
    };
  }, [sistema, opcion, V, iPct, n, h, periodoP, chInput, thInput, ihInput, formato, errorValidacion]);

  const listaOpciones = sistema === 'americano' ? OPCIONES_AMERICANO : OPCIONES_FRANCES_ALEMAN;

  const pideV =
    (sistema === 'frances' && [2, 5, 7, 8].includes(opcion)) ||
    (sistema === 'aleman' && [3, 7, 8].includes(opcion)) ||
    sistema === 'americano';

  const pideCh = sistema === 'frances' && [1, 3, 4, 5, 6, 7, 8].includes(opcion);
  const pideTh = sistema === 'aleman' && [1, 2, 4, 5, 6].includes(opcion);
  const pideIh = sistema === 'aleman' && opcion === 2;
  const pideI =
    (sistema === 'frances' && [1, 2, 3, 4, 5, 6, 7].includes(opcion)) ||
    (sistema === 'aleman' && [4, 7, 8].includes(opcion)) ||
    sistema === 'americano';
  const pideN =
    (sistema === 'frances' && [1, 2, 3, 4, 5, 6, 7, 8].includes(opcion)) ||
    (sistema === 'aleman' && [1, 3, 4, 6, 7, 8].includes(opcion)) ||
    (sistema === 'americano' && [2, 3].includes(opcion));
  const pidePeriodoP = sistema === 'frances' && opcion === 3;
  const pideH =
    (sistema === 'frances' && [4, 5, 6, 7].includes(opcion)) ||
    (sistema === 'aleman' && [4, 5, 6, 7].includes(opcion)) ||
    (sistema === 'americano' && opcion === 2);

  return (
    <div className="space-y-6">
      {/* Selector de Sistema (Francés, Alemán, Americano) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Sistema de Amortización de Préstamos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Seleccione el sistema de amortización y la magnitud específica que desea calcular
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(['frances', 'aleman', 'americano'] as SistemaTipo[]).map((sis) => (
              <button
                key={sis}
                type="button"
                onClick={() => handleCambioSistema(sis)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  sistema === sis
                    ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {sis === 'frances'
                  ? 'Sistema Francés'
                  : sis === 'aleman'
                  ? 'Sistema Alemán'
                  : 'Sistema Americano'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {listaOpciones.map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => setOpcion(op.id)}
              className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                opcion === op.id
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {op.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            Parámetros del préstamo
          </h3>

          {pideV && (
            <div>
              <label htmlFor="am-v" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Valor del préstamo (V)
              </label>
              <input
                id="am-v"
                type="number"
                step="any"
                value={V}
                onChange={(e) => setV(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          )}

          {pideCh && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="am-ch" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Valor de la cuota constante (ch)
                </label>
                <button
                  type="button"
                  onClick={() => setChInput(Number(chTeoricaFrances.toFixed(6)))}
                  className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Calcular ch para V={V} ({chTeoricaFrances.toFixed(2)})
                </button>
              </div>
              <input
                id="am-ch"
                type="number"
                step="any"
                value={chInput}
                onChange={(e) => setChInput(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          )}

          {pideTh && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="am-th" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Cuota de amortización constante (th)
                </label>
                <button
                  type="button"
                  onClick={() => setThInput(Number(thTeoricaAleman.toFixed(6)))}
                  className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Usar V/n ({thTeoricaAleman.toFixed(2)})
                </button>
              </div>
              <input
                id="am-th"
                type="number"
                step="any"
                value={thInput}
                onChange={(e) => setThInput(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          )}

          {pideIh && (
            <div>
              <label htmlFor="am-ih" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Cuota de interés del período (ih)
              </label>
              <input
                id="am-ih"
                type="number"
                step="any"
                value={ihInput}
                onChange={(e) => setIhInput(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          )}

          {pideI && (
            <div>
              <label htmlFor="am-i" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Tasa de interés periódica (i %)
              </label>
              <input
                id="am-i"
                type="number"
                step="any"
                value={iPct}
                onChange={(e) => setIPct(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          )}

          {pideN && (
            <div>
              <label htmlFor="am-n" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Cantidad total de períodos / cuotas (n)
              </label>
              <input
                id="am-n"
                type="number"
                step="1"
                value={n}
                onChange={(e) => setN(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          )}

          {pidePeriodoP && (
            <div>
              <label htmlFor="am-p" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Período de cuota a consultar (p, de 1 a n)
              </label>
              <input
                id="am-p"
                type="number"
                step="1"
                value={periodoP}
                onChange={(e) => setPeriodoP(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          )}

          {pideH && (
            <div>
              <label htmlFor="am-h" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {opcion === 4
                  ? 'Cuotas previas ya canceladas (h, donde 0 = 1.ª cuota)'
                  : 'Cantidad de cuotas canceladas / pagadas (h, de 0 a n)'}
              </label>
              <input
                id="am-h"
                type="number"
                step="1"
                value={h}
                onChange={(e) => setH(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
              {opcion === 4 && (
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Con h = {h} cuotas canceladas se calcula el interés del período p = {h + 1}.
                </p>
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
            tipoValorPrincipal="moneda"
            formato={formato}
            entradasResumen={calculo.entradas}
            variablesExplicacion={calculo.variables}
            resultadosSecundarios={calculo.secundarios}
            tablaAmortizacion={tablaMarcha}
            errorValidacion={errorValidacion}
          />

          {!errorValidacion && tablaMarcha.length > 0 && (
            <FinancialChart
              titulo="Composición de Cuota por Período (Amortización vs. Interés)"
              subtitulo={`Evolución sobre V = ${formatearMoneda(V, formato)}, i = ${iPct}%, n = ${n} períodos`}
              etiquetaSeriePrincipal="Amortización (th)"
              etiquetaSerieSecundaria="Interés (Ih)"
              datos={tablaMarcha.map((f) => ({
                etiqueta: `Período ${f.periodo}`,
                valorPrincipal: f.amortizacionPeriodo,
                valorSecundario: f.interesPeriodo,
              }))}
              formato={formato}
            />
          )}
        </div>
      </div>

      {/* Tabla de Amortización Completa (Cuadro de Marcha) */}
      {!errorValidacion && tablaMarcha.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Cuadro de Marcha Completo —{' '}
                {sistema === 'frances'
                  ? 'Sistema Francés'
                  : sistema === 'aleman'
                  ? 'Sistema Alemán'
                  : 'Sistema Americano'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Préstamo V = {formatearMoneda(V, formato)} · Tasa periódica i = {iPct}% · Plazo total n = {n} períodos
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="py-2.5 px-4">Período (p)</th>
                  <th className="py-2.5 px-4 text-right">Cuota Total (ch)</th>
                  <th className="py-2.5 px-4 text-right">Interés (Ih)</th>
                  <th className="py-2.5 px-4 text-right">Amortización (th)</th>
                  <th className="py-2.5 px-4 text-right">Amort. Acumulada</th>
                  <th className="py-2.5 px-4 text-right">Saldo de Deuda (SD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-mono tabular-nums">
                {tablaMarcha.map((fila) => {
                  const periodoResaltado = pidePeriodoP ? periodoP : opcion === 4 ? h + 1 : h;
                  const esFilaActiva = fila.periodo === periodoResaltado;
                  return (
                    <tr
                      key={fila.periodo}
                      className={`transition-colors ${
                        esFilaActiva
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-2.5 px-4 text-slate-900 dark:text-slate-100">
                        #{fila.periodo}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-900 dark:text-slate-100">
                        {formatearMoneda(fila.cuotaTotal, formato)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-teal-700 dark:text-teal-400">
                        {formatearMoneda(fila.interesPeriodo, formato)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-blue-700 dark:text-blue-400">
                        {formatearMoneda(fila.amortizacionPeriodo, formato)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-700 dark:text-slate-300">
                        {formatearMoneda(fila.amortizacionAcumulada, formato)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-900 dark:text-slate-100">
                        {formatearMoneda(fila.saldoDeuda, formato)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
