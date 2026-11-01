import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
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
  rcInteresTotal,
  rcCapitalInvertido,
  rcTasaInteres,
  rcMontoFinal,
  rcValorDescontado,
  rcValorActual,
  rcDescuentoTotal,
  rcResultadoFinanciero,
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
  rvf1VencidaConstante,
  rvf1VencidaVarCapitalYTasa,
  rvf1VencidaVarSoloTasa,
  rvf1VencidaVarSoloCuota,
  rvf2Adelantada,
  rvf3InteresesTotales,
  rvf4CapitalNecesario,
  rvf5TasaInteresImplicita,
  rva1ValorActualVencida,
  rva2SaldoDeuda,
  sf1ValorPrestamo,
  sf2ValorCuota,
  sf3CuotaAmortizacion,
  sf4CuotaInteres,
  sf4CuotaInteresPorPeriodo,
  sf5AmortizacionAcumulada,
  sf6SaldoDeuda,
  sf7InteresesPagados,
  sf8InteresesTotales,
  sa1ValorPrestamo,
  sa2ValorCuota,
  sa3CuotaAmortizacion,
  sa4CuotaInteres,
  sa4CuotaInteresPorPeriodo,
  sa5AmortizacionAcumulada,
  sa6SaldoDeuda,
  sa7InteresesPagados,
  sa8InteresesTotales,
  sam1ValorCuota,
  sam2InteresesPagados,
  sam3InteresesTotales,
  generarTablaAmortizacion,
} from './financialEngine';

function assertClose(actual: number, expected: number, tol = 1e-10, message?: string) {
  const diff = Math.abs(actual - expected);
  assert.ok(
    Number.isFinite(actual) && diff <= tol,
    `${message ? message + ': ' : ''}Expected ${expected}, got ${actual} (diff ${diff} > ${tol})`
  );
}

// ============================================================================
// 1. RÉGIMEN SIMPLE — TODAS LAS VARIANTES Y TASAS PERIÓDICAS/TOTALES
// ============================================================================

test('Régimen Simple — todas las operaciones, 4 ramas de monto y distinción tasa periódica vs total', () => {
  assertClose(rsInteresTotal(10000, 12500), 2500);

  // Rama 1: sin cambio de tasa y sin capitalización
  const mNoNo = rsMontoFinal({
    C: 10000,
    cambioTasa: false,
    capitalizacion: false,
    iPorcentaje: 5,
    n: 4,
  });
  assertClose(mNoNo.montoFinal, 12000);
  assertClose(mNoNo.interesTotalGenerado, 2000);

  // Rama 2: con cambio de tasa y sin capitalización
  const mSiNo = rsMontoFinal({
    C: 10000,
    cambioTasa: true,
    capitalizacion: false,
    tramosIniciales: [
      { tasaPorcentaje: 5, periodos: 2 },
      { tasaPorcentaje: 8, periodos: 3 },
    ],
  });
  assertClose(mSiNo.montoFinal, 13400);

  // Rama 3: sin cambio de tasa inicial y con capitalización intermedia
  const mNoSi = rsMontoFinal({
    C: 10000,
    cambioTasa: false,
    capitalizacion: true,
    iPorcentaje: 5,
    n: 2,
    etapasCapitalizacion: [
      { cambioTasa: false, tasaPorcentaje: 10, periodos: 1 },
      {
        cambioTasa: true,
        tramos: [
          { tasaPorcentaje: 5, periodos: 2 },
          { tasaPorcentaje: 5, periodos: 2 },
        ],
      },
    ],
  });
  assertClose(mNoSi.montoFinal, 14520);

  // Rama 4: con cambio de tasa inicial y con capitalización intermedia
  const mSiSi = rsMontoFinal({
    C: 10000,
    cambioTasa: true,
    capitalizacion: true,
    tramosIniciales: [
      { tasaPorcentaje: 4, periodos: 2 },
      { tasaPorcentaje: 6, periodos: 2 },
    ],
    etapasCapitalizacion: [
      { cambioTasa: false, tasaPorcentaje: 5, periodos: 2 },
    ],
  });
  assertClose(mSiSi.montoFinal, 13200);

  // Inversa: Capital invertido
  assertClose(rsCapitalInvertido(12000, 5, 4), 10000);

  // Tasa periódica vs Rendimiento total de la operación (Fase 1.2.B)
  assertClose(rsTasaInteres(12000, 10000, 4), 5); // 5% por período durante 4 períodos
  assertClose(rsTasaTotalOperacion(12000, 10000), 20); // 20% total en la punta
  assertClose(rsTasaInteres(12500, 10000, 1), 25);

  // Descuento comercial, racional y resultado financiero
  assertClose(rsValorDescontado(10000, 3, 4), 8800);
  assertClose(rsValorActual(12000, 5, 4), 10000);
  assertClose(rsDescuentoTotal(10000, 3, 4), 1200);
  assertClose(rsResultadoFinanciero(9200, 8500), 700);
});

// ============================================================================
// 2. RÉGIMEN COMPUESTO — OPERACIONES E IDENTIDADES INVERSAS
// ============================================================================

test('Régimen Compuesto — operaciones, tramos variables e identidades financieras', () => {
  const C = 10000;
  const iPct = 5;
  const n = 6;
  const mRes = rcMontoFinal({ C, cambioTasa: false, iPorcentaje: iPct, n });
  const M = mRes.montoFinal;

  // Identidades inversas: Capital(M, i, n) === C, Tasa(M, C, n) === i, Interes === M - C
  assertClose(rcCapitalInvertido(M, iPct, n), C);
  assertClose(rcTasaInteres(M, C, n), iPct);
  assertClose(rcInteresTotal(C, M), M - C);
  assertClose(rcValorActual(M, iPct, n), C);

  // Identidad de descuento compuesto: VD + D === N
  const N = 25000;
  const dPct = 4.5;
  const vd = rcValorDescontado(N, dPct, 5);
  const desc = rcDescuentoTotal(N, dPct, 5);
  assertClose(vd + desc, N);

  assertClose(rcResultadoFinanciero(9500, 9000), 500);
});

// ============================================================================
// 3. EQUIVALENCIAS DE TASAS — LAS 12 CONVERSIONES Y PROPIEDADES DE INVERSIÓN
// ============================================================================

test('Equivalencias de Tasas — 12 conversiones y consistencia de transformaciones inversas', () => {
  // 1: Efectiva vencida <-> Efectiva vencida (mensual 30 días <-> anual 365 días)
  const tem = 4.5;
  const teaDecimal = eq1EfectivaVencidaAEfectivaVencida(tem, 30, 365);
  const temRecuperada = eq1EfectivaVencidaAEfectivaVencida(teaDecimal * 100, 365, 30) * 100;
  assertClose(temRecuperada, tem);

  // 2 y 3: Nominal vencida <-> Efectiva vencida
  const tna = 60;
  const effMensual = eq2NominalVencidaAEfectivaVencida(tna, 365, 30, 30);
  const tnaRecuperada = eq3EfectivaVencidaANominalVencida(effMensual * 100, 30, 365, 30) * 100;
  assertClose(tnaRecuperada, tna);

  // 4: Nominal vencida (cap 30) <-> Nominal vencida (cap 60)
  const tna60 = eq4NominalVencidaANominalVencida(tna, 365, 30, 365, 60);
  const tna30Rec = eq4NominalVencidaANominalVencida(tna60 * 100, 365, 60, 365, 30) * 100;
  assertClose(tna30Rec, tna);

  // 5: Efectiva adelantada <-> Efectiva adelantada
  const d30 = 3.8;
  const d90 = eq5EfectivaAdelantadaAEfectivaAdelantada(d30, 30, 90);
  const d30Rec = eq5EfectivaAdelantadaAEfectivaAdelantada(d90 * 100, 90, 30) * 100;
  assertClose(d30Rec, d30);

  // 6 y 7: Efectiva adelantada <-> Nominal adelantada
  const fna = eq6EfectivaAdelantadaANominalAdelantada(d30, 30, 365, 30);
  const d30FromFna = eq7NominalAdelantadaAEfectivaAdelantada(fna * 100, 365, 30, 30) * 100;
  assertClose(d30FromFna, d30);

  // 8: Nominal adelantada <-> Nominal adelantada
  const fna60 = eq8NominalAdelantadaANominalAdelantada(48, 365, 30, 365, 60);
  const fna30Rec = eq8NominalAdelantadaANominalAdelantada(fna60 * 100, 365, 60, 365, 30) * 100;
  assertClose(fna30Rec, 48);

  // 9 y 10: Efectiva vencida <-> Efectiva adelantada (identidad d = i / (1 + i))
  const iVenc = 5;
  const dAdel = eq9EfectivaVencidaAEfectivaAdelantada(iVenc, 30, 30);
  assertClose(dAdel, 0.05 / 1.05);
  const iVencRec = eq10EfectivaAdelantadaAEfectivaVencida(dAdel * 100, 30, 30) * 100;
  assertClose(iVencRec, iVenc);

  // 11 y 12: Nominal vencida <-> Nominal adelantada
  const fnaEquiv = eq11NominalVencidaANominalAdelantada(60, 365, 30, 365, 60);
  const jnaRec = eq12NominalAdelantadaANominalVencida(fnaEquiv * 100, 365, 60, 365, 30) * 100;
  assertClose(jnaRec, 60);
});

// ============================================================================
// 4. RENTAS (VALOR FINAL Y ACTUAL) — CASOS LÍMITE i=0, TASAS IMPLÍCITAS
// ============================================================================

test('Rentas Valor Final y Actual — variantes, tasa cero y resolución de tasa implícita', () => {
  // Caso límite tasa cero (i = 0%): VF = C * n y VA = C * n
  assertClose(rvf1VencidaConstante(1000, 0, 12), 12000);
  assertClose(rvf2Adelantada(1000, 0, 12), 12000);
  assertClose(rvf4CapitalNecesario(12000, 0, 12), 1000);
  assertClose(rva1ValorActualVencida(1000, 0, 12), 12000);
  assertClose(rva2SaldoDeuda(1000, 0, 12, 5), 7000);

  // Identidad fundamental: VF_vencida === VA_vencida * (1 + i)^n
  const C = 1500;
  const iPct = 4.25;
  const n = 18;
  const vf = rvf1VencidaConstante(C, iPct, n);
  const va = rva1ValorActualVencida(C, iPct, n);
  assertClose(va * Math.pow(1 + iPct / 100, n), vf);

  // Identidad renta adelantada: VFA === VF * (1 + i)
  const vfa = rvf2Adelantada(C, iPct, n);
  assertClose(vfa, vf * (1 + iPct / 100));

  // Subramas con variación de tasa y cuota
  const vfAmbos = rvf1VencidaVarCapitalYTasa([
    {
      C: 1000,
      cambioTasaDuranteCuota: true,
      subTramos: [
        { tasaPorcentaje: 3, cantidadCuotas: 3, tasasPosteriores: [{ tasaPorcentaje: 4, periodosFaltantes: 3 }] },
        { tasaPorcentaje: 4, cantidadCuotas: 3, tasasPosteriores: [] },
      ],
    },
  ]);
  const vfSoloTasa = rvf1VencidaVarSoloTasa(1000, [
    { tasaPorcentaje: 3, periodos: 3 },
    { tasaPorcentaje: 4, periodos: 3 },
  ]);
  assertClose(vfAmbos.valorFinal, vfSoloTasa.valorFinal);

  const vfSoloCuota = rvf1VencidaVarSoloCuota(5, [
    { C: 1000, n: 6, h: 6 },
    { C: 1000, n: 6, h: 0 },
  ]);
  assertClose(vfSoloCuota.valorFinal, rvf1VencidaConstante(1000, 5, 12));

  // Intereses totales (incluyendo resultado negativo cuando An < capital aportado)
  const itNeg = rvf3InteresesTotales(10500, [{ C: 1000, n: 12 }]);
  assertClose(itNeg.interesesTotales, -1500);

  // Solver de tasa implícita:
  // 1) Tasa positiva normal (5%)
  const impPos = rvf5TasaInteresImplicita(rvf1VencidaConstante(1000, 5, 24), 1000, 24);
  assert.equal(impPos.convergio, true);
  assertClose(impPos.tasaPorcentaje, 5, 1e-9);

  // 2) Tasa muy baja cercana a cero (0.01%)
  const vfCasiCero = rvf1VencidaConstante(1000, 0.01, 36);
  const impCasiCero = rvf5TasaInteresImplicita(vfCasiCero, 1000, 36);
  assert.equal(impCasiCero.convergio, true);
  assertClose(impCasiCero.tasaPorcentaje, 0.01, 1e-8);

  // 3) Tasa exactamente cero (VF === C * n)
  const impCero = rvf5TasaInteresImplicita(12000, 1000, 12);
  assert.equal(impCero.convergio, true);
  assertClose(impCero.tasaPorcentaje, 0, 1e-12);

  // 4) Tasa negativa admisible (-2% por período, cuando VF < C * n)
  const vfNeg = rvf1VencidaConstante(1000, -2, 12);
  const impNeg = rvf5TasaInteresImplicita(vfNeg, 1000, 12);
  assert.equal(impNeg.convergio, true);
  assertClose(impNeg.tasaPorcentaje, -2, 1e-9);

  // 5) Plazo extenso (n = 240 períodos)
  const vfLargo = rvf1VencidaConstante(500, 1.5, 240);
  const impLargo = rvf5TasaInteresImplicita(vfLargo, 500, 240);
  assert.equal(impLargo.convergio, true);
  assertClose(impLargo.tasaPorcentaje, 1.5, 1e-9);
});

// ============================================================================
// 5. SISTEMAS DE AMORTIZACIÓN — AUDITORÍA DEL SISTEMA ALEMÁN, FRANCÉS Y AMERICANO
// ============================================================================

test('Sistema Alemán — verificación del caso testigo de auditoría (V=1200, i=10%, n=12, h=1 -> 120) e identidades', () => {
  // Caso testigo obligatorio Fase 1.2.A:
  // Capital: 1.200, Tasa periódica: 10%, Cuotas totales: 12, Cuotas pagadas: 1 -> Interés = 120
  const interesPagadoH1 = sa7InteresesPagados(1200, 12, 1, 10);
  assertClose(interesPagadoH1, 120);

  // Cuando h = n = 12, los intereses pagados acumulados coinciden exactamente con los intereses totales TI
  const intPagadosH12 = sa7InteresesPagados(1200, 12, 12, 10);
  const intTotales = sa8InteresesTotales(1200, 10, 12);
  assertClose(intPagadosH12, intTotales);
  assertClose(intTotales, 780);

  // En h = n, el saldo de deuda es 0 y la amortización acumulada es V
  const th = sa3CuotaAmortizacion(1200, 12);
  assertClose(th, 100);
  assertClose(sa6SaldoDeuda(1200 / 100, 12, th), 0);
  assertClose(sa5AmortizacionAcumulada(12, th), 1200);

  // Verificar que para todo h (1..12), sa7InteresesPagados coincide con la suma de intereses de la tabla
  const tablaAleman = generarTablaAmortizacion('aleman', 1200, 10, 12);
  assert.equal(tablaAleman.length, 12);
  let sumaIntereses = 0;
  for (let h = 1; h <= 12; h++) {
    sumaIntereses += tablaAleman[h - 1].interesPeriodo;
    assertClose(sa7InteresesPagados(1200, 12, h, 10), sumaIntereses);
    assertClose(sa4CuotaInteresPorPeriodo(12, h, th, 10), tablaAleman[h - 1].interesPeriodo);
  }
});

test('Sistema Francés y Americano — identidades, h = n, tasa cero y cuadros de marcha largos (>360)', () => {
  const V = 100000;
  const iPct = 5;
  const n = 12;
  const ch = sf2ValorCuota(V, iPct, n);
  assertClose(sf1ValorPrestamo(ch, iPct, n), V);

  // Verificar que en cada período p (1..n): ch === th + Ih
  for (let p = 1; p <= n; p++) {
    const th = sf3CuotaAmortizacion(ch, n, p, iPct);
    const ih = sf4CuotaInteresPorPeriodo(ch, iPct, n, p);
    assertClose(th + ih, ch);
  }

  // En h = n: Saldo = 0, Amortización acumulada = V, Intereses pagados = Intereses totales
  assertClose(sf6SaldoDeuda(ch, iPct, n, n), 0);
  assertClose(sf5AmortizacionAcumulada(V, ch, iPct, n, n), V);
  assertClose(sf7InteresesPagados(V, ch, iPct, n, n), sf8InteresesTotales(V, ch, n));

  // Caso tasa cero en Sistema Francés
  const chCero = sf2ValorCuota(12000, 0, 12);
  assertClose(chCero, 1000);

  // Verificar no truncamiento en tabla de 480 períodos (> 360)
  const tabla480 = generarTablaAmortizacion('frances', 240000, 0.5, 480);
  assert.equal(tabla480.length, 480);
  const sumaAmort480 = tabla480.reduce((acc, f) => acc + f.amortizacionPeriodo, 0);
  assertClose(sumaAmort480, 240000, 1e-6);
  assertClose(tabla480[479].saldoDeuda, 0, 1e-8);

  // Sistema Americano: suma de amortizaciones = V, suma de intereses = IT
  const tablaAmericano = generarTablaAmortizacion('americano', 50000, 6, 10);
  assert.equal(tablaAmericano.length, 10);
  const sumaIntAm = tablaAmericano.reduce((acc, f) => acc + f.interesPeriodo, 0);
  assertClose(sumaIntAm, sam3InteresesTotales(50000, 6, 10));
  assertClose(sam2InteresesPagados(50000, 6, 4), 12000);
});

// ============================================================================
// 6. PARIDAD CRUZADA INDEPENDIENTE PYTHON ORACLE <-> MOTOR TYPESCRIPT (FASE 3)
// ============================================================================

test('Paridad numérica real contra Oráculo Python Independiente (scripts/oracle_financiero.py)', () => {
  const scriptPath = path.resolve(process.cwd(), 'scripts/oracle_financiero.py');

  const queries = [
    {
      id: 'q_rs_monto_cap',
      fn: 'rs_monto',
      args: {
        C: 15000,
        cambioTasa: true,
        capitalizacion: true,
        tramosIniciales: [
          { tasaPorcentaje: 4.5, periodos: 3 },
          { tasaPorcentaje: 6.2, periodos: 2 },
        ],
        etapasCapitalizacion: [
          { cambioTasa: false, tasaPorcentaje: 5.5, periodos: 4 },
          {
            cambioTasa: true,
            tramos: [
              { tasaPorcentaje: 3.1, periodos: 2 },
              { tasaPorcentaje: 4.9, periodos: 3 },
            ],
          },
        ],
      },
      tsVal: rsMontoFinal({
        C: 15000,
        cambioTasa: true,
        capitalizacion: true,
        tramosIniciales: [
          { tasaPorcentaje: 4.5, periodos: 3 },
          { tasaPorcentaje: 6.2, periodos: 2 },
        ],
        etapasCapitalizacion: [
          { cambioTasa: false, tasaPorcentaje: 5.5, periodos: 4 },
          {
            cambioTasa: true,
            tramos: [
              { tasaPorcentaje: 3.1, periodos: 2 },
              { tasaPorcentaje: 4.9, periodos: 3 },
            ],
          },
        ],
      }).montoFinal,
    },
    {
      id: 'q_rs_tasa_per',
      fn: 'rs_tasa',
      args: { M: 13600, C: 10000, n: 6 },
      tsVal: rsTasaInteres(13600, 10000, 6),
    },
    {
      id: 'q_rc_monto_var',
      fn: 'rc_monto',
      args: {
        C: 25000,
        cambioTasa: true,
        tramos: [
          { tasaPorcentaje: 3.5, periodos: 4 },
          { tasaPorcentaje: 5.2, periodos: 6 },
          { tasaPorcentaje: 2.8, periodos: 3 },
        ],
      },
      tsVal: rcMontoFinal({
        C: 25000,
        cambioTasa: true,
        tramos: [
          { tasaPorcentaje: 3.5, periodos: 4 },
          { tasaPorcentaje: 5.2, periodos: 6 },
          { tasaPorcentaje: 2.8, periodos: 3 },
        ],
      }).montoFinal,
    },
    // Las 12 equivalencias de tasas verificadas contra Python
    {
      id: 'q_eq_1',
      fn: 'eq',
      args: { op: 1, tasa: 4.2, ut2: 30, ut1: 365 },
      tsVal: eq1EfectivaVencidaAEfectivaVencida(4.2, 30, 365),
    },
    {
      id: 'q_eq_2',
      fn: 'eq',
      args: { op: 2, tasa: 54, ut2: 365, fs: 30, ut1: 365 },
      tsVal: eq2NominalVencidaAEfectivaVencida(54, 365, 30, 365),
    },
    {
      id: 'q_eq_3',
      fn: 'eq',
      args: { op: 3, tasa: 68, ut1: 365, ut2: 365, fs: 30 },
      tsVal: eq3EfectivaVencidaANominalVencida(68, 365, 365, 30),
    },
    {
      id: 'q_eq_4',
      fn: 'eq',
      args: { op: 4, tasa: 45, ut2: 365, fs2: 30, ut1: 365, fs1: 90 },
      tsVal: eq4NominalVencidaANominalVencida(45, 365, 30, 365, 90),
    },
    {
      id: 'q_eq_5',
      fn: 'eq',
      args: { op: 5, tasa: 3.5, ut2: 30, ut1: 180 },
      tsVal: eq5EfectivaAdelantadaAEfectivaAdelantada(3.5, 30, 180),
    },
    {
      id: 'q_eq_6',
      fn: 'eq',
      args: { op: 6, tasa: 4.1, ut1: 30, ut2: 365, fs: 30 },
      tsVal: eq6EfectivaAdelantadaANominalAdelantada(4.1, 30, 365, 30),
    },
    {
      id: 'q_eq_7',
      fn: 'eq',
      args: { op: 7, tasa: 42, ut2: 365, fs: 30, ut1: 60 },
      tsVal: eq7NominalAdelantadaAEfectivaAdelantada(42, 365, 30, 60),
    },
    {
      id: 'q_eq_8',
      fn: 'eq',
      args: { op: 8, tasa: 40, ut2: 365, fs2: 30, ut1: 365, fs1: 60 },
      tsVal: eq8NominalAdelantadaANominalAdelantada(40, 365, 30, 365, 60),
    },
    {
      id: 'q_eq_9',
      fn: 'eq',
      args: { op: 9, tasa: 5.5, ut2: 30, ut1: 60 },
      tsVal: eq9EfectivaVencidaAEfectivaAdelantada(5.5, 30, 60),
    },
    {
      id: 'q_eq_10',
      fn: 'eq',
      args: { op: 10, tasa: 4.8, ut2: 30, ut1: 60 },
      tsVal: eq10EfectivaAdelantadaAEfectivaVencida(4.8, 30, 60),
    },
    {
      id: 'q_eq_11',
      fn: 'eq',
      args: { op: 11, tasa: 52, ut2: 365, fs2: 30, ut1: 365, fs1: 30 },
      tsVal: eq11NominalVencidaANominalAdelantada(52, 365, 30, 365, 30),
    },
    {
      id: 'q_eq_12',
      fn: 'eq',
      args: { op: 12, tasa: 46, ut2: 365, fs2: 30, ut1: 365, fs1: 30 },
      tsVal: eq12NominalAdelantadaANominalVencida(46, 365, 30, 365, 30),
    },
    // Rentas y Tasa Implícita
    {
      id: 'q_rvf_const',
      fn: 'rvf_const',
      args: { C: 1250, i: 3.75, n: 24 },
      tsVal: rvf1VencidaConstante(1250, 3.75, 24),
    },
    {
      id: 'q_rvf_adel',
      fn: 'rvf_adel',
      args: { C: 1250, i: 3.75, n: 24 },
      tsVal: rvf2Adelantada(1250, 3.75, 24),
    },
    {
      id: 'q_rvf_imp_pos',
      fn: 'rvf_tasa_imp',
      args: { VF: 45000, C: 1200, n: 24 },
      tsVal: rvf5TasaInteresImplicita(45000, 1200, 24).tasaDecimal,
    },
    {
      id: 'q_rvf_imp_neg',
      fn: 'rvf_tasa_imp',
      args: { VF: 10500, C: 1000, n: 12 },
      tsVal: rvf5TasaInteresImplicita(10500, 1000, 12).tasaDecimal,
    },
    // Sistemas Francés y Alemán corregido
    {
      id: 'q_sf_cuota',
      fn: 'sf_cuota',
      args: { V: 250000, i: 4.2, n: 36 },
      tsVal: sf2ValorCuota(250000, 4.2, 36),
    },
    {
      id: 'q_sa_int_h1',
      fn: 'sa_int_pagados',
      args: { V: 1200, n: 12, h: 1, i: 10 },
      tsVal: sa7InteresesPagados(1200, 12, 1, 10),
    },
    {
      id: 'q_sa_int_h5',
      fn: 'sa_int_pagados',
      args: { V: 1200, n: 12, h: 5, i: 10 },
      tsVal: sa7InteresesPagados(1200, 12, 5, 10),
    },
    {
      id: 'q_sa_int_tot',
      fn: 'sa_int_totales',
      args: { V: 1200, i: 10, n: 12 },
      tsVal: sa8InteresesTotales(1200, 10, 12),
    },
  ];

  const stdout = execFileSync('python3', [scriptPath], {
    input: JSON.stringify({
      queries: queries.map(({ id, fn, args }) => ({ id, fn, args })),
    }),
    encoding: 'utf-8',
  });

  const parsed = JSON.parse(stdout) as { results: Record<string, number> };

  for (const q of queries) {
    const pyVal = parsed.results[q.id];
    assertClose(q.tsVal, pyVal, 1e-10, `Discrepancia en consulta ${q.id}`);
  }
});

// ============================================================================
// 8. FORMATO NUMÉRICO, EXPORTACIÓN CSV Y LIMPIEZA DE INTERFAZ PÚBLICA
// ============================================================================
test('Exportación CSV y verificación de ausencia de referencias internas de desarrollo en la UI pública', async () => {
  const fs = await import('node:fs');
  const {
    FORMATO_POR_DEFECTO,
    formatearMoneda,
    formatearPorcentaje,
    formatearTantoPorUno,
    generarContenidoCSV,
  } = await import('../utils/formatters');

  assert.strictEqual(formatearMoneda(1234.5, FORMATO_POR_DEFECTO), '$ 1.234,50');
  assert.strictEqual(formatearMoneda(-120, FORMATO_POR_DEFECTO), '$ -120,00');
  assert.strictEqual(formatearPorcentaje(5, FORMATO_POR_DEFECTO), '5,0000%');
  assert.strictEqual(formatearTantoPorUno(0.05, FORMATO_POR_DEFECTO), '0,050000');

  const csv = generarContenidoCSV({
    tituloOperacion: 'Sistema Alemán — 7. Intereses Pagados Acumulados',
    formulaMatematica: 'I_{acum, h} = ((I_1 + I_h) / 2) · h',
    explicacionEconomica: 'Suma de los intereses desde el período 1 hasta h.',
    entradas: [
      { etiqueta: 'Valor del préstamo (V)', valor: '$ 1.200,00' },
      { etiqueta: 'Cuotas pagadas (h)', valor: '1' },
    ],
    salidas: [
      {
        etiqueta: 'Intereses Pagados Acumulados (Ih)',
        valorFormateado: '$ 120,00',
        valorExacto: 120,
      },
    ],
    tablaAmortizacion: generarTablaAmortizacion('aleman', 1200, 10, 12),
  });

  assert.ok(csv.includes('Operación Financiera'));
  assert.ok(csv.includes('$ 120,00'));
  assert.ok(!csv.includes('IEEE-754'));
  assert.ok(!csv.includes('Módulo Python'));
  assert.ok(!csv.includes('.py'));

  // Verificar que ningún componente de la interfaz pública exponga nombres de archivos .py, IEEE-754 o fsolve
  const archivosPublicosUI = [
    'src/App.tsx',
    'src/utils/formatters.ts',
    'src/components/ResultBanner.tsx',
    'src/components/FinancialChart.tsx',
    'src/components/RegimenSimpleView.tsx',
    'src/components/RegimenCompuestoView.tsx',
    'src/components/EquivalenciasView.tsx',
    'src/components/RentasValorFinalView.tsx',
    'src/components/RentasValorActualView.tsx',
    'src/components/AmortizacionView.tsx',
    'index.html',
  ];

  const patronesProhibidos = [
    /\.py\b/,
    /IEEE-754/i,
    /fsolve/i,
    /scipy/i,
    /Líneas\s+\d/i,
    /github\.com\/Nico-scelza/i,
    /Retorno exacto Python/i,
  ];

  for (const relPath of archivosPublicosUI) {
    const contenido = fs.readFileSync(path.resolve(process.cwd(), relPath), 'utf-8');
    for (const regex of patronesProhibidos) {
      assert.ok(
        !regex.test(contenido),
        `El archivo público ${relPath} contiene una referencia interna prohibida: ${regex}`
      );
    }
  }
});

