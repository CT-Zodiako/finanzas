from datetime import date, timedelta
from typing import List
from app.schemas.optimize import (
    OptimizeInput, OptimizeResult, PaymentPlan, 
    DebtInput, Alert, AlertsResult
)


class OptimizeService:
    def __init__(self):
        pass

    def calculate_priority_score(self, debt: DebtInput, today: date) -> float:
        dias_hasta = (debt.fecha_limite - today).days
        
        if dias_hasta <= 3:
            urgencia = 10
        elif dias_hasta <= 7:
            urgencia = 8
        elif dias_hasta <= 15:
            urgencia = 5
        elif dias_hasta <= 30:
            urgencia = 3
        else:
            urgencia = 1
        
        peso_cuota = (debt.cuota_minima / debt.saldo_total * 10) if debt.saldo_total > 0 else 0
        
        if debt.saldo_total < 5000:
            peso_saldo = 10
        elif debt.saldo_total < 20000:
            peso_saldo = 5
        else:
            peso_saldo = 2
        
        score = (urgencia * 10) + (peso_cuota * 5) + (peso_saldo * 2)
        return score

    def calculate(self, input_data: OptimizeInput) -> OptimizeResult:
        today = date.today()
        
        ingreso = input_data.ingreso_mensual
        gastos = input_data.gastos_fijos
        ahorro = input_data.ahorro_minimo
        deudas = input_data.deudas
        
        total_minimos = sum(d.cuota_minima for d in deudas)
        capacidad_pago = ingreso - gastos
        disponible = capacidad_pago - total_minimos
        carga = total_minimos / ingreso if ingreso > 0 else 0
        
        if capacidad_pago < total_minimos:
            estado = "CRISIS"
            puede_pagar = False
            payment_plan = []
            mensajes = ["Capacidad de pago insuficiente - no reachas para cuotas mínimas"]
        elif disponible < 0:
            estado = "INSUFICIENTE"
            puede_pagar = False
            mensajes = ["No alcanza para pagar todas las cuotas mínimas"]
            
            sorted_deudas = sorted(deudas, key=lambda d: d.fecha_limite)
            payment_plan = []
            remaining = disponible
            
            for d in sorted_deudas:
                if remaining <= 0:
                    break
                pago = min(d.cuota_minima, remaining)
                payment_plan.append(PaymentPlan(
                    nombre=d.nombre,
                    pago_minimo=pago,
                    pago_extra=0,
                    pago_total=pago
                ))
                remaining -= pago
        else:
            estado = "ESTABLE"
            puede_pagar = True
            mensajes = ["Capacidad de pago suficiente"]
            
            scored_deudas = []

            for d in deudas:
                score = self.calculate_priority_score(d, today)
                scored_deudas.append((d, score))
            
            scored_deudas.sort(key=lambda x: x[1], reverse=True)
            sorted_deudas = [d for d, _ in scored_deudas]
            
            payment_plan = []
            remaining = capacidad_pago - total_minimos
            
            for d in sorted_deudas:
                if remaining <= 0:
                    payment_plan.append(PaymentPlan(
                        nombre=d.nombre,
                        pago_minimo=d.cuota_minima,
                        pago_extra=0,
                        pago_total=d.cuota_minima
                    ))
                else:
                    extra = min(remaining, d.saldo_total - d.cuota_minima) if d.saldo_total > d.cuota_minima else 0
                    payment_plan.append(PaymentPlan(
                        nombre=d.nombre,
                        pago_minimo=d.cuota_minima,
                        pago_extra=extra,
                        pago_total=d.cuota_minima + extra
                    ))
                    remaining -= extra
        
        return OptimizeResult(
            estado=estado,
            capacidad_pago=capacidad_pago,
            disponible=disponible,
            extra_disponible=disponible,
            total_cuotas_minimas=total_minimos,
            carga_financiera=carga,
            puede_pagar_todo=puede_pagar,
            payment_plan=payment_plan,
            mensajes=mensajes
        )

    def get_alerts(self, input_data: OptimizeInput) -> AlertsResult:
        result = self.calculate(input_data)
        alertas = []
        
        if result.disponible <= 0:
            alertas.append(Alert(
                tipo="capacidad",
                nivel="critico",
                mensaje="Capacidad de pago en危机的 - no puedes pagar nada"
            ))
        
        if result.disponible < result.total_cuotas_minimas and result.total_cuotas_minimas > 0:
            alertas.append(Alert(
                tipo="cuotas",
                nivel="alto",
                mensaje="No alcanza para pagar todas las cuotas mínimas"
            ))
        
        if result.carga_financiera > 0.5:
            alertas.append(Alert(
                tipo="carga",
                nivel="alto",
                mensaje=f"Carga financiera muy alta: {result.carga_financiera*100:.1f}%"
            ))
        elif result.carga_financiera > 0.3:
            alertas.append(Alert(
                tipo="carga",
                nivel="medio",
                mensaje=f"Carga financiera moderada: {result.carga_financiera*100:.1f}%"
            ))
        
        today = date.today()
        for debt in input_data.deudas:
            dias = (debt.fecha_limite - today).days
            if dias <= 3:
                alertas.append(Alert(
                    tipo="vencimiento",
                    nivel="critico",
                    mensaje=f"Deuda '{debt.nombre}' vence en {dias} días"
                ))
        
        necesita_accion = len([a for a in alertas if a.nivel in ["critico", "alto"]]) > 0
        
        return AlertsResult(
            alertas=alertas,
            necesita_accion=necesita_accion
        )
