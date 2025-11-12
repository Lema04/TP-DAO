# Pasos para ejecutar los tests:
# cd backend
# python3 -m scripts.test_reportes

import os
import traceback
from servicios.reporte_service import ReporteService

def test_alquileres_por_cliente():
    print("\n===== 🧾 TEST: ALQUILERES POR CLIENTE =====")
    reporte = ReporteService()

    try:
        pdf = reporte.generar_reporte_alquileres_por_cliente(cliente_id=1, formato="pdf")
        assert os.path.exists(pdf), "No se generó el PDF correctamente"
        print(f"✅ PDF generado correctamente: {pdf}")
    except Exception as e:
        print(f"❌ Error en PDF cliente válido: {e}")
        traceback.print_exc()

    try:
        excel = reporte.generar_reporte_alquileres_por_cliente(cliente_id=1, formato="excel")
        assert os.path.exists(excel), "No se generó el Excel correctamente"
        print(f"✅ Excel generado correctamente: {excel}")
    except Exception as e:
        print(f"❌ Error en Excel cliente válido: {e}")
        traceback.print_exc()

    try:
        reporte.generar_reporte_alquileres_por_cliente(cliente_id=9999, formato="pdf")
        print("❌ ERROR: No lanzó excepción con cliente inexistente")
    except Exception as e:
        print(f"✅ Excepción esperada capturada: {e}")

    try:
        reporte.generar_reporte_alquileres_por_cliente(cliente_id=1, formato="txt")
        print("❌ ERROR: No lanzó excepción con formato inválido")
    except Exception as e:
        print(f"✅ Excepción esperada (formato inválido): {e}")


def test_alquileres_por_periodo():
    print("\n===== 📊 TEST: ALQUILERES POR PERIODO =====")
    reporte = ReporteService()

    try:
        pdf_mensual = reporte.generar_reporte_alquileres_por_periodo(frecuencia="M", anio=2025)
        assert os.path.exists(pdf_mensual), "No se generó el PDF mensual correctamente"
        print(f"✅ PDF mensual generado correctamente: {pdf_mensual}")
    except Exception as e:
        print(f"❌ Error en reporte mensual: {e}")
        traceback.print_exc()

    try:
        pdf_trimestral = reporte.generar_reporte_alquileres_por_periodo(frecuencia="Q", anio=2025)
        assert os.path.exists(pdf_trimestral), "No se generó el PDF trimestral correctamente"
        print(f"✅ PDF trimestral generado correctamente: {pdf_trimestral}")
    except Exception as e:
        print(f"❌ Error en reporte trimestral: {e}")
        traceback.print_exc()

    try:
        reporte.generar_reporte_alquileres_por_periodo(frecuencia="M", anio=1999)
        print("❌ ERROR: debería lanzar excepción para año sin datos.")
    except Exception as e:
        print(f"✅ Excepción esperada para año sin datos: {e}")

    try:
        reporte.generar_reporte_alquileres_por_periodo(frecuencia="X", anio=2025)
        print("❌ ERROR: No lanzó excepción para frecuencia inválida")
    except Exception as e:
        print(f"✅ Excepción esperada (frecuencia inválida): {e}")


def test_facturacion_mensual():
    print("\n===== 💰 TEST: FACTURACIÓN MENSUAL =====")
    reporte = ReporteService()

    try:
        pdf = reporte.generar_reporte_facturacion_mensual(anio=2025)
        assert os.path.exists(pdf), "No se generó el PDF correctamente"
        print(f"✅ PDF generado correctamente: {pdf}")
    except Exception as e:
        print(f"❌ Error en facturación mensual (año actual): {e}")
        traceback.print_exc()

    try:
        reporte.generar_reporte_facturacion_mensual(anio=1999)
        print("❌ ERROR: No lanzó excepción con año sin datos")
    except Exception as e:
        print(f"✅ Excepción esperada (año sin datos): {e}")

    try:
        reporte.generar_reporte_facturacion_mensual(anio=2050)
        print("❌ ERROR: No lanzó excepción con año futuro")
    except Exception as e:
        print(f"✅ Excepción esperada (año futuro): {e}")


def test_vehiculos_mas_alquilados():
    print("\n===== 🚘 TEST: VEHÍCULOS MÁS ALQUILADOS =====")
    reporte = ReporteService()

    try:
        # Caso 1: Top 3 vehículos
        pdf_top3 = reporte.generar_reporte_vehiculos_mas_alquilados(limite=3)
        assert os.path.exists(pdf_top3), "No se generó el PDF del top 3"
        print(f"✅ PDF Top 3 generado correctamente: {pdf_top3}")
    except Exception as e:
        print(f"❌ Error en top 3: {e}")
        traceback.print_exc()

    try:
        # Caso 2: Todos los vehículos
        pdf_todos = reporte.generar_reporte_vehiculos_mas_alquilados()
        assert os.path.exists(pdf_todos), "No se generó el PDF con todos los vehículos"
        print(f"✅ PDF con todos los vehículos generado correctamente: {pdf_todos}")
    except Exception as e:
        print(f"❌ Error en todos los vehículos: {e}")
        traceback.print_exc()

    try:
        # Caso 3: Sin datos (simulado)
        # Forzamos una excepción eliminando temporalmente el método del servicio
        original = reporte.alquiler_service.listar_alquileres
        reporte.alquiler_service.listar_alquileres = lambda: {"estado": "ok", "data": []}
        try:
            reporte.generar_reporte_vehiculos_mas_alquilados()
            print("❌ ERROR: No lanzó excepción cuando no hay alquileres")
        except Exception as e:
            print(f"✅ Excepción esperada (sin datos): {e}")
        finally:
            reporte.alquiler_service.listar_alquileres = original
    except Exception as e:
        print(f"❌ Error al probar caso sin datos: {e}")
        traceback.print_exc()


if __name__ == "__main__":
    print("===== 🚀 INICIANDO TESTS DE REPORTES =====")
    test_alquileres_por_cliente()
    test_alquileres_por_periodo()
    test_facturacion_mensual()
    test_vehiculos_mas_alquilados()
    print("\n===== ✅ TESTS FINALIZADOS =====")