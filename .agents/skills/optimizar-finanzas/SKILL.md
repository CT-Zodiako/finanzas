---
name: optimizar-finanzas
description: Esta skill proporciona un motor determinístico para la gestión, análisis y optimización del pago de deudas personales. Evalúa ingresos, gastos, cuotas, intereses y fechas límite para generar un plan de pagos óptimo, reproducible y basado en reglas matemáticas. No utiliza inferencia probabilística. Todas las decisiones son determinísticas.
---


---
El motor de optimización de finanzas personales se basa en un conjunto de reglas matemáticas y algoritmos determinísticos para analizar la situación financiera del usuario y generar un plan de pagos óptimo. A continuación, se describen los componentes clave del sistema:
1. **Entrada de Datos**: El usuario proporciona información detallada sobre sus ingresos, gastos, deudas (incluyendo montos, cuotas y fechas de corte y de pago), y cualquier otro dato financiero relevante.
2. **Análisis de Deudas**: El sistema evalúa cada deuda en función de su monto, fecha de corte y fecha de pago. Se calcula el costo total de cada deuda a lo largo del tiempo, considerando los intereses acumulados.
3. **Priorización de Deudas**: Basándose en el análisis, el sistema prioriza las deudas según criterios como el costo total, la fecha de corte más próxima,. Esto permite identificar cuáles deudas deben ser pagadas primero para minimizar los costos.
4. **Generación de Plan de Pagos**: El sistema genera un plan de pagos detallado que especifica cuánto debe pagar el usuario cada mes para cada deuda, asegurando que se cumplan las fechas de corte y pago. El plan se optimiza para minimizar los costos totales y evitar cargos por pagos atrasados.
5. **Revisión y Ajuste**: El usuario puede revisar el plan de pagos generado y realizar ajustes si es necesario. El sistema recalcula el plan de pagos en función de cualquier cambio en los datos de entrada, asegurando que el plan siga siendo óptimo.
6. **Reportes y Seguimiento**: El sistema proporciona reportes periódicos sobre el progreso del usuario en el pago de sus deudas, destacando cualquier desviación del plan original y ofreciendo recomendaciones para mantenerse en el camino correcto.
7. **Reproducibilidad**: Dado que el sistema es completamente determinístico, cualquier usuario con la misma información de entrada obtendrá el mismo plan de pagos, garantizando la transparencia y la confianza en las recomendaciones proporcionadas.
8. **Sin Inferencia Probabilística**: Todas las decisiones y recomendaciones se basan exclusivamente en reglas matemáticas y algorit
mos determinísticos, sin utilizar técnicas de inferencia probabilística o aprendizaje automático. Esto asegura que el sistema sea predecible y confiable en sus recomendaciones.
9. **Interfaz de Usuario**: El sistema contará con una interfaz de usuario intuitiva
que permitirá a los usuarios ingresar sus datos financieros, revisar el plan de pagos generado y realizar ajustes según sea necesario. La interfaz también proporcionará visualizaciones claras del progreso y las recomendaciones.
10. **Seguridad y Privacidad**: El sistema implementará medidas de seguridad robustas
para proteger la información financiera del usuario, asegurando que los datos sean manejados de manera confidencial y segura en todo momento.
11. **Cálculo del Costo Total**: Aquí en Colombia, las cuotas mensuales ya incluyen el interés mensual, por lo tanto el costo total de cada deuda se calcula simplemente multiplicando la cuota mensual por el número de meses restantes hasta la fecha de pago final, sin necesidad de calcular intereses adicionales.
En resumen, el motor de optimización de finanzas personales es una herramienta poderosa y determinística que ayuda a los usuarios a gestionar y optimizar el pago de sus deudas personales, proporcionando un plan de pagos claro, detallado y basado en reglas matemáticas para minimizar los costos y evitar cargos por pagos atrasados.
