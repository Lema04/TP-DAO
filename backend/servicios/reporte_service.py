# --- Archivo: servicios/reporte_service.py (¡ARREGLADO!) ---

import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib import rcParams
from datetime import datetime
from servicios.alquiler_service import AlquilerService
from servicios.vehiculo_service import VehiculoService
# Importamos las excepciones que nuestros servicios pueden levantar
from servicios.excepciones import RecursoNoEncontradoError, ErrorDeAplicacion

# ... (Tu configuración de rcParams y colores está perfecta) ...
COLOR_PRINCIPAL = "#e41a1c"
COLOR_SECUNDARIO = "#4d4d4d" 
COLOR_TERCERARIO = "#f2f2f2"
COLOR_BORDES = "#cccccc"

class ReporteService:
    def __init__(self):
        """Inicializa los servicios necesarios (¡esto ya estaba perfecto!)."""
        self.alquiler_service = AlquilerService()
        self.vehiculo_service = VehiculoService()

    def _get_alquileres_list(self):
        """
        Método helper para obtener la lista de objetos Alquiler.
        Maneja la lógica de POO en un solo lugar.
        """
        try:
            # El servicio refactorizado devuelve una lista[Alquiler]
            alquileres_obj_list = self.alquiler_service.listar_alquileres()
            if not alquileres_obj_list:
                raise Exception("No se encontraron alquileres en el sistema.")
            return alquileres_obj_list
        except ErrorDeAplicacion as e:
            # Re-lanza el error para que el controlador lo atrape
            raise Exception(f"Error al obtener alquileres: {e}")

    # Reporte de alquileres por cliente
    def generar_reporte_alquileres_por_cliente(self, cliente_id: int, formato: str = "pdf"):
        try:
            # 1. Obtener datos (¡forma POO!)
            # El servicio ya levanta RecursoNoEncontradoError si el cliente no existe
            # (o podemos añadir esa validación si es necesario)
            alquileres_obj_list = self.alquiler_service.buscar_por_cliente(cliente_id)

            if not alquileres_obj_list:
                raise RecursoNoEncontradoError(f"No se encontraron alquileres para el cliente con ID {cliente_id}.")

            # 2. "Aplanar" los objetos para el DataFrame
            # Convertimos la lista[Alquiler] en una lista[dict] plana
            data_para_df = []
            for alq in alquileres_obj_list:
                data_para_df.append({
                    "id_alquiler": alq.id_alquiler,
                    "fecha_inicio": alq.fecha_inicio,
                    "fecha_fin": alq.fecha_fin,
                    "costo_total": alq.costo_total,
                    "fecha_registro": alq.fecha_registro,
                    # Accedemos a los atributos de los objetos compuestos
                    "id_empleado": alq.empleado.id_empleado,
                    "patente": alq.vehiculo.patente,
                    "id_cliente": alq.cliente.id_cliente
                })
            
            # 3. Crear DataFrame desde la lista de diccionarios
            df = pd.DataFrame(data_para_df)

            # 4. Formatear fechas (tu lógica estaba bien, solo ajustamos el `to_datetime`)
            for col in ["fecha_inicio", "fecha_fin", "fecha_registro"]:
                df[col] = pd.to_datetime(df[col]).dt.strftime("%d/%m/%Y")
            
            # ... (El resto de tu lógica de renombrar columnas y generar PDF/Excel está perfecta) ...
            
            df.rename(columns={
                 "id_alquiler": "ID Alquiler",
                 # ... (etc) ...
            }, inplace=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            nombre_base = f"reporte_alquileres_cliente_{cliente_id}_{timestamp}"

            if formato.lower() == "pdf":
                # ... (Tu lógica de Matplotlib es correcta) ...
                archivo_pdf = f"{nombre_base}.pdf"
                fig, ax = plt.subplots(figsize=(11, 6))
                # ...
                with PdfPages(archivo_pdf) as pdf:
                   pdf.savefig(fig, bbox_inches="tight", facecolor="white")
                plt.close(fig)
                return archivo_pdf
            # ... (Lógica de Excel) ...
            
        except (RecursoNoEncontradoError, Exception) as e:
            # Pasa la excepción al controlador
            raise e


    # Reporte alquileres por periodo
    def generar_reporte_alquileres_por_periodo(self, frecuencia="M", anio=None):
        if anio is None:
            anio = datetime.now().year
        elif anio > datetime.now().year:
            # ¡Mejor POO! Levantar una excepción que el controlador entienda.
            raise DatosInvalidosError("Año inválido. Debe ser igual o anterior al actual.")
        
        # 1. Obtener datos (¡forma POO!)
        alquileres_obj_list = self._get_alquileres_list()

        # 2. "Aplanar" los datos para el DataFrame (solo lo que necesitamos)
        data_para_df = [{
            "id_alquiler": alq.id_alquiler,
            "fecha_inicio": alq.fecha_inicio # Ya es un objeto 'date'
        } for alq in alquileres_obj_list]
        
        df = pd.DataFrame(data_para_df)
        
        # 3. Procesar DataFrame (tu lógica es correcta)
        df["fecha_inicio"] = pd.to_datetime(df["fecha_inicio"])
        df = df[df["fecha_inicio"].dt.year == anio]

        if df.empty:
            raise RecursoNoEncontradoError(f"No hay alquileres registrados en {anio}.")

        # ... (El resto de tu lógica de groupby y Matplotlib está perfecta) ...
        # ...
        archivo_pdf = f"reporte_alquileres_periodo_{frecuencia.lower()}_{anio}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        # ...
        return archivo_pdf


    # Reporte de facturación mensual
    def generar_reporte_facturacion_mensual(self, anio):
        if anio > datetime.now().year:
            raise DatosInvalidosError("Año inválido. Debe ser igual o anterior al actual.")

        # 1. Obtener datos (¡forma POO!)
        alquileres_obj_list = self._get_alquileres_list()

        # 2. "Aplanar" los datos para el DataFrame
        data_para_df = [{
            "fecha_inicio": alq.fecha_inicio, # Ya es 'date'
            "costo_total": alq.costo_total   # Ya es 'float'
        } for alq in alquileres_obj_list]

        df = pd.DataFrame(data_para_df)
        
        # 3. Procesar DataFrame (tu lógica es correcta)
        df["fecha_inicio"] = pd.to_datetime(df["fecha_inicio"])
        df["anio"] = df["fecha_inicio"].dt.year
        df["mes"] = df["fecha_inicio"].dt.month
        df = df[df["anio"] == anio]

        if df.empty:
            raise RecursoNoEncontradoError(f"No se registraron alquileres durante {anio}.")

        # ... (El resto de tu lógica de groupby y Matplotlib está perfecta) ...
        # ...
        archivo_pdf = f"reporte_facturacion_mensual_{anio}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        # ...
        return archivo_pdf


    # Reporte de vehículos más alquilados
    def generar_reporte_vehiculos_mas_alquilados(self, limite=None):
        
        # 1. Obtener datos (¡forma POO!)
        alquileres_obj_list = self._get_alquileres_list()
        
        # 2. Acceso POO limpio a los datos
        # Accedemos al objeto 'vehiculo' dentro de 'alquiler'
        patentes = [alq.vehiculo.patente for alq in alquileres_obj_list]
        conteo = pd.Series(patentes).value_counts().reset_index()
        conteo.columns = ["patente", "cantidad"]

        vehiculos_info = []
        for _, fila in conteo.iterrows():
            patente, cantidad = fila["patente"], fila["cantidad"]
            
            # 3. Usar el VehiculoService refactorizado
            try:
                # El servicio devuelve un objeto Vehiculo
                vehiculo = self.vehiculo_service.buscar_vehiculo(patente)
                # Acceso directo a atributos (¡POO!)
                nombre = f"{vehiculo.marca} {vehiculo.modelo} ({patente})"
            except RecursoNoEncontradoError:
                # El vehículo fue alquilado pero ya no existe en la BDD
                nombre = f"Desconocido ({patente})"

            vehiculos_info.append({"Vehículo": nombre, "Cantidad": cantidad})

        # ... (El resto de tu lógica de DataFrame, límite y Matplotlib está perfecta) ...
        # ...
        archivo_pdf = f"reporte_vehiculos_mas_alquilados_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        # ...
        return archivo_pdf