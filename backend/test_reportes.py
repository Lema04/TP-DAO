# test_reportes.py
from servicios.reporte_service import ReporteService

def probar_reportes():
    reporte_service = ReporteService()  # Ya no necesitamos logo_path

    print("Generando PDF de alquileres por cliente...")
    try:
        archivo1 = reporte_service.alquileres_por_cliente()
        print("✅ Archivo generado:", archivo1)
    except Exception as e:
        print("❌ Error en alquileres por cliente:", e)

    print("Generando PDF de vehículos más alquilados...")
    try:
        archivo2 = reporte_service.vehiculos_mas_alquilados()
        print("✅ Archivo generado:", archivo2)
    except Exception as e:
        print("❌ Error en vehículos más alquilados:", e)

    print("Generando PDF de alquileres por período...")
    try:
        archivo3 = reporte_service.alquileres_por_periodo()
        print("✅ Archivo generado:", archivo3)
    except Exception as e:
        print("❌ Error en alquileres por período:", e)

    print("Generando PDF de facturación mensual...")
    try:
        archivo4 = reporte_service.facturacion_mensual()
        print("✅ Archivo generado:", archivo4)
    except Exception as e:
        print("❌ Error en facturación mensual:", e)

if __name__ == "__main__":
    probar_reportes()
