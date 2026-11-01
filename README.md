# Calculadora Financiera

Calculadora web de matemática financiera para estudiantes, profesionales y público general.

**Aplicación:** https://nico-scelza.github.io/Calculadora-Financiera/

## Funcionalidades

- Régimen simple y compuesto, incluyendo tasas variables y capitalización.
- Doce conversiones de tasas nominales y efectivas, vencidas y adelantadas.
- Rentas a valor final y actual, con cuotas y tasas variables.
- Sistemas de amortización francés, alemán y americano, con cuadros de marcha.
- Gráficos de resultados, exportación CSV e impresión en PDF.

## Desarrollo

Requisitos: Node.js 22 y Python 3.11 para las pruebas de equivalencia.

```bash
npm ci
npm run dev
```

Verificación y compilación:

```bash
npm run lint
npm test
npm run build
```

El motor de cálculo está en `src/engine/financialEngine.ts`. Sus pruebas están en `src/engine/financialEngine.test.ts` y usan `scripts/oracle_financiero.py` como referencia numérica independiente. Los programas Python de `Operaciones/` y `Calculadora_Financiera.py` se conservan como fuente histórica.

El despliegue automático en GitHub Pages se configura en `.github/workflows/deploy.yml`.
