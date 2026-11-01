#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ORÁCULO FINANCIERO INDEPENDIENTE EN PYTHON
==========================================
Implementación matemática independiente que sirve como oráculo de referencia
para verificar la exactitud numérica del motor financiero de la aplicación web.

Se ejecuta desde la suite de pruebas automatizadas o directamente por CLI
recibiendo casos de prueba en JSON por entrada estándar (stdin) y devolviendo
los resultados calculados por salida estándar (stdout).
"""

import json
import math
import sys


# ============================================================================
# 1. RÉGIMEN SIMPLE
# ============================================================================

def oracle_rs_interes_total(C: float, M: float) -> float:
    return M - C


def oracle_rs_monto_final(params: dict) -> dict:
    C = float(params["C"])
    cambio_tasa = bool(params["cambioTasa"])
    capitalizacion = bool(params["capitalizacion"])

    if cambio_tasa and capitalizacion:
        tramos_pre = params.get("tramosIniciales", [])
        intereses_pre = [C * ((t["tasaPorcentaje"] / 100.0) * t["periodos"]) for t in tramos_pre]
        monto_inicial = C + sum(intereses_pre)
        capitalizaciones = [monto_inicial]

        for etapa in params.get("etapasCapitalizacion", []):
            base = capitalizaciones[-1]
            if etapa.get("cambioTasa"):
                intereses = [
                    base * ((t["tasaPorcentaje"] / 100.0) * t["periodos"])
                    for t in etapa.get("tramos", [])
                ]
                capitalizaciones.append(base + sum(intereses))
            else:
                tasa = float(etapa.get("tasaPorcentaje", 0.0)) / 100.0
                n = float(etapa.get("periodos", 0.0))
                capitalizaciones.append(base + base * (tasa * n))

        monto_final = capitalizaciones[-1]
        return {
            "montoFinal": monto_final,
            "historialCapitalizaciones": capitalizaciones,
            "interesTotalGenerado": monto_final - C,
        }

    if cambio_tasa and not capitalizacion:
        tramos = params.get("tramosIniciales", [])
        intereses = [C * ((t["tasaPorcentaje"] / 100.0) * t["periodos"]) for t in tramos]
        monto = C + sum(intereses)
        return {
            "montoFinal": monto,
            "historialCapitalizaciones": [monto],
            "interesTotalGenerado": monto - C,
        }

    if not cambio_tasa and capitalizacion:
        i = float(params.get("iPorcentaje", 0.0)) / 100.0
        n = float(params.get("n", 0.0))
        monto_inicial = C * (1.0 + i * n)
        capitalizaciones = [monto_inicial]

        for etapa in params.get("etapasCapitalizacion", []):
            base = capitalizaciones[-1]
            if etapa.get("cambioTasa"):
                intereses = [
                    base * ((t["tasaPorcentaje"] / 100.0) * t["periodos"])
                    for t in etapa.get("tramos", [])
                ]
                capitalizaciones.append(base + sum(intereses))
            else:
                tasa = float(etapa.get("tasaPorcentaje", 0.0)) / 100.0
                n_etapa = float(etapa.get("periodos", 0.0))
                capitalizaciones.append(base + base * (tasa * n_etapa))

        monto_final = capitalizaciones[-1]
        return {
            "montoFinal": monto_final,
            "historialCapitalizaciones": capitalizaciones,
            "interesTotalGenerado": monto_final - C,
        }

    i = float(params.get("iPorcentaje", 0.0)) / 100.0
    n = float(params.get("n", 0.0))
    monto = C * (1.0 + i * n)
    return {
        "montoFinal": monto,
        "historialCapitalizaciones": [monto],
        "interesTotalGenerado": monto - C,
    }


def oracle_rs_capital_invertido(M: float, i_pct: float, n: float) -> float:
    i = i_pct / 100.0
    return M / (1.0 + i * n)


def oracle_rs_tasa_interes(M: float, C: float, n: float = 1.0) -> float:
    return (((M / C) - 1.0) / n) * 100.0


def oracle_rs_valor_descontado(N: float, d_pct: float, n: float) -> float:
    d = d_pct / 100.0
    return N * (1.0 - d * n)


def oracle_rs_valor_actual(N: float, i_pct: float, n: float) -> float:
    i = i_pct / 100.0
    return N / (1.0 + i * n)


def oracle_rs_descuento_total(N: float, d_pct: float, n: float) -> float:
    d = d_pct / 100.0
    return N * d * n


def oracle_rs_resultado_financiero(VD: float, Vi: float) -> float:
    return VD - Vi


# ============================================================================
# 2. RÉGIMEN COMPUESTO
# ============================================================================

def oracle_rc_interes_total(C: float, M: float) -> float:
    return M - C


def oracle_rc_capital_invertido(M: float, i_pct: float, n: float) -> float:
    i = i_pct / 100.0
    return M / ((1.0 + i) ** n)


def oracle_rc_tasa_interes(M: float, C: float, n: float) -> float:
    return (((M / C) ** (1.0 / n)) - 1.0) * 100.0


def oracle_rc_monto_final(params: dict) -> float:
    C = float(params["C"])
    if params.get("cambioTasa"):
        monto = C
        for t in params.get("tramos", []):
            tasa = float(t["tasaPorcentaje"]) / 100.0
            n = float(t["periodos"])
            monto *= (1.0 + tasa) ** n
        return monto
    else:
        i = float(params.get("iPorcentaje", 0.0)) / 100.0
        n = float(params.get("n", 0.0))
        return C * ((1.0 + i) ** n)


def oracle_rc_valor_descontado(N: float, d_pct: float, n: float) -> float:
    d = d_pct / 100.0
    return N * ((1.0 - d) ** n)


def oracle_rc_valor_actual(N: float, i_pct: float, n: float) -> float:
    i = i_pct / 100.0
    return N / ((1.0 + i) ** n)


def oracle_rc_descuento_total(N: float, d_pct: float, n: float) -> float:
    d = d_pct / 100.0
    return N * (1.0 - ((1.0 - d) ** n))


def oracle_rc_resultado_financiero(VD: float, Vi: float) -> float:
    return VD - Vi


# ============================================================================
# 3. EQUIVALENCIA DE TASAS (12 OPERACIONES)
# ============================================================================

def oracle_eq(op: int, p: dict) -> float:
    if op == 1:
        i2 = p["tasa"] / 100.0
        return ((1.0 + i2) ** (p["ut1"] / p["ut2"])) - 1.0
    elif op == 2:
        jm = p["tasa"] / 100.0
        return ((1.0 + (jm / p["ut2"]) * p["fs"]) ** (p["ut1"] / p["fs"])) - 1.0
    elif op == 3:
        i = p["tasa"] / 100.0
        return (((1.0 + i) ** (p["fs"] / p["ut1"])) - 1.0) * (p["ut2"] / p["fs"])
    elif op == 4:
        jm2 = p["tasa"] / 100.0
        return (((1.0 + (jm2 / p["ut2"]) * p["fs2"]) ** (p["fs1"] / p["fs2"])) - 1.0) * (p["ut1"] / p["fs1"])
    elif op == 5:
        i2 = p["tasa"] / 100.0
        return 1.0 - ((1.0 - i2) ** (p["ut1"] / p["ut2"]))
    elif op == 6:
        i = p["tasa"] / 100.0
        return (p["ut2"] / p["fs"]) * (1.0 - ((1.0 - i) ** (p["fs"] / p["ut1"])))
    elif op == 7:
        jm = p["tasa"] / 100.0
        return 1.0 - ((1.0 - (jm / p["ut2"]) * p["fs"]) ** (p["ut1"] / p["fs"]))
    elif op == 8:
        jm2 = p["tasa"] / 100.0
        return (p["ut1"] / p["fs1"]) * (1.0 - ((1.0 - (jm2 / p["ut2"]) * p["fs2"]) ** (p["fs1"] / p["fs2"])))
    elif op == 9:
        i2 = p["tasa"] / 100.0
        return 1.0 - ((1.0 / (1.0 + i2)) ** (p["ut1"] / p["ut2"]))
    elif op == 10:
        i2 = p["tasa"] / 100.0
        return ((1.0 / (1.0 - i2)) ** (p["ut1"] / p["ut2"])) - 1.0
    elif op == 11:
        jm2 = p["tasa"] / 100.0
        return (p["ut1"] / p["fs1"]) * (1.0 - ((1.0 / (1.0 + (jm2 / p["ut2"]) * p["fs2"])) ** (p["fs1"] / p["fs2"])))
    elif op == 12:
        jm2 = p["tasa"] / 100.0
        return (p["ut1"] / p["fs1"]) * ((1.0 / ((1.0 - (jm2 / p["ut2"]) * p["fs2"]) ** (p["fs1"] / p["fs2"]))) - 1.0)
    raise ValueError(f"Operación de equivalencia desconocida: {op}")


# ============================================================================
# 4. RENTAS VALOR FINAL Y VALOR ACTUAL
# ============================================================================

def factor_s(i: float, n: float) -> float:
    if abs(i) < 1e-12:
        return n + (n * (n - 1.0) / 2.0) * i
    return (((1.0 + i) ** n) - 1.0) / i


def factor_a(i: float, n: float) -> float:
    if abs(i) < 1e-12:
        return n - (n * (n + 1.0) / 2.0) * i
    return (1.0 - ((1.0 + i) ** (-n))) / i


def oracle_rvf_vencida_constante(C: float, i_pct: float, n: float) -> float:
    return C * factor_s(i_pct / 100.0, n)


def oracle_rvf_adelantada(C: float, i_pct: float, n: float) -> float:
    i = i_pct / 100.0
    return C * factor_s(i, n) * (1.0 + i)


def oracle_rvf_capital_necesario(VF: float, i_pct: float, n: float) -> float:
    return VF / factor_s(i_pct / 100.0, n)


def oracle_rvf_tasa_implicita(VF: float, C: float, n: float) -> float:
    if abs(VF - C * n) <= 1e-14 * max(1.0, VF):
        return 0.0

    def f(r: float) -> float:
        if abs(r) < 1e-9:
            return C * (
                n
                + (n * (n - 1.0) / 2.0) * r
                + (n * (n - 1.0) * (n - 2.0) / 6.0) * (r ** 2)
                + (n * (n - 1.0) * (n - 2.0) * (n - 3.0) / 24.0) * (r ** 3)
            ) - VF
        return C * (((1.0 + r) ** n) - 1.0) / r - VF

    low = -0.99999999 if VF < C * n else 0.0
    high = 0.0 if VF < C * n else 0.1
    if VF > C * n:
        while f(high) < 0.0:
            low = high
            high *= 2.0

    # Bisección de alta precisión + secante en Python
    for _ in range(120):
        mid = 0.5 * (low + high)
        val = f(mid)
        if abs(val) <= 1e-14 * max(1.0, VF) or (high - low) <= 1e-15 * max(1.0, abs(mid)):
            return mid
        if val < 0.0:
            low = mid
        else:
            high = mid
    return 0.5 * (low + high)


def oracle_rva_valor_actual(C: float, i_pct: float, n: float) -> float:
    return C * factor_a(i_pct / 100.0, n)


def oracle_rva_saldo_deuda(C: float, i_pct: float, n: float, h: float) -> float:
    return C * factor_a(i_pct / 100.0, n - h)


# ============================================================================
# 5. SISTEMAS DE AMORTIZACIÓN (FRANCÉS, ALEMÁN Y AMERICANO CORREGIDOS)
# ============================================================================

def oracle_sf_cuota(V: float, i_pct: float, n: int) -> float:
    return V / factor_a(i_pct / 100.0, n)


def oracle_sf_prestamo(ch: float, i_pct: float, n: int) -> float:
    return ch * factor_a(i_pct / 100.0, n)


def oracle_sf_amortizacion_periodo(ch: float, n: int, p: int, i_pct: float) -> float:
    i = i_pct / 100.0
    return ch * ((1.0 + i) ** (-(n - p + 1)))


def oracle_sf_saldo(ch: float, i_pct: float, n: int, h: int) -> float:
    return ch * factor_a(i_pct / 100.0, n - h)


def oracle_sa_intereses_pagados(V: float, n: int, h: int, i_pct: float) -> float:
    if h == 0:
        return 0.0
    i = i_pct / 100.0
    th = V / n
    # Suma exacta de los intereses de los períodos k = 1..h
    return sum((n - k + 1) * th * i for k in range(1, h + 1))


def oracle_sa_intereses_totales(V: float, i_pct: float, n: int) -> float:
    i = i_pct / 100.0
    th = V / n
    return sum((n - k + 1) * th * i for k in range(1, n + 1))


def main():
    payload = json.loads(sys.stdin.read())
    results = {}

    for item in payload.get("queries", []):
        qid = item["id"]
        fn = item["fn"]
        args = item["args"]

        if fn == "rs_monto":
            results[qid] = oracle_rs_monto_final(args)["montoFinal"]
        elif fn == "rs_tasa":
            results[qid] = oracle_rs_tasa_interes(args["M"], args["C"], args.get("n", 1.0))
        elif fn == "rc_monto":
            results[qid] = oracle_rc_monto_final(args)
        elif fn == "eq":
            results[qid] = oracle_eq(args["op"], args)
        elif fn == "rvf_const":
            results[qid] = oracle_rvf_vencida_constante(args["C"], args["i"], args["n"])
        elif fn == "rvf_adel":
            results[qid] = oracle_rvf_adelantada(args["C"], args["i"], args["n"])
        elif fn == "rvf_tasa_imp":
            results[qid] = oracle_rvf_tasa_implicita(args["VF"], args["C"], args["n"])
        elif fn == "rva_va":
            results[qid] = oracle_rva_valor_actual(args["C"], args["i"], args["n"])
        elif fn == "rva_sd":
            results[qid] = oracle_rva_saldo_deuda(args["C"], args["i"], args["n"], args["h"])
        elif fn == "sf_cuota":
            results[qid] = oracle_sf_cuota(args["V"], args["i"], args["n"])
        elif fn == "sf_saldo":
            results[qid] = oracle_sf_saldo(args["ch"], args["i"], args["n"], args["h"])
        elif fn == "sa_int_pagados":
            results[qid] = oracle_sa_intereses_pagados(args["V"], args["n"], args["h"], args["i"])
        elif fn == "sa_int_totales":
            results[qid] = oracle_sa_intereses_totales(args["V"], args["i"], args["n"])
        else:
            raise ValueError(f"Función de oráculo no soportada: {fn}")

    sys.stdout.write(json.dumps({"results": results}))


if __name__ == "__main__":
    main()
