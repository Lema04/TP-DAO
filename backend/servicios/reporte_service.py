# --- Archivo: servicios/reporte_service.py ---

import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib import rcParams
from datetime import datetime
from servicios.alquiler_service import AlquilerService
from servicios.vehiculo_service import VehiculoService
from servicios.excepciones import RecursoNoEncontradoError, ErrorDeAplicacion, DatosInvalidosError

# --- ¡NUEVO! Importamos 'os' para manejar carpetas ---
import os

# Configuración de Matplotlib
rcParams["font.family"] = "sans-serif"
rcParams["font.sans-serif"] = ["Arial", "Helvetica", "DejaVu Sans"]
COLOR_PRINCIPAL = "#e41a1c"
COLOR_SECUNDARIO = "#4d4d4d" 
COLOR_TERCERARIO = "#f2f2f2"
COLOR_BORDES = "#cccccc"

class ReporteService:
    
    # --- ¡NUEVO! Definimos las carpetas de salida ---
    # Asume que 'static' está al mismo nivel que tu 'app.py'
    STATIC_DIR = 'static' 
    REPORTES_DIR = os.path.join(STATIC_DIR, 'reportes')

    def __init__(self):
        """Inicializa los servicios necesarios."""
        self.alquiler_service = AlquilerService()
        self.vehiculo_service = VehiculoService()
        
        # --- ¡NUEVO! Aseguramos que la carpeta de reportes exista ---
        os.makedirs(self.REPORTES_DIR, exist_ok=True)

    def _get_alquileres_list(self):
        """
        Método helper para obtener la lista de OBJETOS Alquiler.
        """
        try:
            alquileres_obj_list = self.alquiler_service.listar_alquileres()
            if not alquileres_obj_list:
                raise RecursoNoEncontradoError("No se encontraron alquileres en el sistema.")
            return alquileres_obj_list
        except ErrorDeAplicacion as e:
            raise Exception(f"Error al obtener alquileres: {e}") # Re-lanza para el controlador

    def _generar_ruta_reporte(self, nombre_base):
        """Helper para crear una ruta de archivo única y una URL web."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        nombre_archivo = f"{nombre_base}_{timestamp}.pdf"
        
        # Ruta completa del sistema para guardar el archivo
        ruta_completa_os = os.path.join(self.REPORTES_DIR, nombre_archivo)
        
        # URL web que devolveremos al frontend
        # (Usamos '/' para las URLs web, independientemente del SO)
        url_web = f"{self.STATIC_DIR}/reportes/{nombre_archivo}"
        
        return ruta_completa_os, url_web

    # Reporte de alquileres por cliente
    def generar_reporte_alquileres_por_cliente(self, cliente_id: int, formato: str = "pdf"):
        # 1. Obtener datos (forma POO)
        alquileres_obj_list = self.alquiler_service.buscar_por_cliente(cliente_id)

        if not alquileres_obj_list:
            raise RecursoNoEncontradoError(f"No se encontraron alquileres para el cliente con ID {cliente_id}.")

        # 2. "Aplanar" los objetos para el DataFrame
        data_para_df = []
        for alq in alquileres_obj_list:
            data_para_df.append({
                "ID Alquiler": alq.id_alquiler,
                "Fecha Inicio": alq.fecha_inicio.strftime("%d/%m/%Y"),
                "Fecha Fin": alq.fecha_fin.strftime("%d/%m/%Y"),
                "Costo Total ($)": alq.costo_total,
                "Fecha Registro": alq.fecha_registro.strftime("%d/%m/%Y"),
                "ID Empleado": alq.empleado.id_empleado,
                "Patente Vehículo": alq.vehiculo.patente,
                "Vehículo": f"{alq.vehiculo.marca} {alq.vehiculo.modelo}",
                "ID Cliente": alq.cliente.id_cliente
            })
        
        df = pd.DataFrame(data_para_df)
        
        # (Aseguramos el orden de columnas deseado)
        columnas_ordenadas = [
            "ID Alquiler", "Fecha Inicio", "Fecha Fin", "Patente Vehículo", 
            "Vehículo", "Costo Total ($)", "ID Empleado", "Fecha Registro"
        ]
        df = df[columnas_ordenadas]

        # 3. Exportar PDF
        if formato.lower() == "pdf":
            ruta_guardar, url_retorno = self._generar_ruta_reporte(f"alquileres_cliente_{cliente_id}")
            
            fig, ax = plt.subplots(figsize=(11.7, 8.3)) # Tamaño A4 horizontal
            fig.patch.set_facecolor("white")
            ax.axis("off")

            fig.text(0.5, 0.93, f"REPORTE DE ALQUILERES - CLIENTE {cliente_id}",
                     ha="center", fontsize=18, color=COLOR_PRINCIPAL, fontweight="bold")
            
            # (Tu lógica de tabla Matplotlib)
            tabla = ax.table(cellText=df.values, colLabels=df.columns,
                             cellLoc="center", loc="center")
            tabla.auto_set_font_size(False)
            tabla.set_fontsize(9)
            tabla.scale(1, 1.2)
            
            # (Estilos de celda)
            for (row, _), cell in tabla.get_celld().items():
                 if row == 0:
                     cell.set_facecolor(COLOR_PRINCIPAL)
                     cell.set_text_props(color="white", fontweight="bold")
                 elif row % 2 == 0:
                     cell.set_facecolor(COLOR_TERCERARIO)
                 cell.set_edgecolor(COLOR_BORDES)

            with PdfPages(ruta_guardar) as pdf:
               pdf.savefig(fig, bbox_inches="tight", facecolor="white")
            plt.close(fig)
            
            return url_retorno # Devolvemos la URL web
        else:
            raise DatosInvalidosError("Formato no soportado. Use 'pdf'.")


    # Reporte alquileres por periodo
    def generar_reporte_alquileres_por_periodo(self, frecuencia="M", anio=None):
        if anio is None:
            anio = datetime.now().year
        elif anio > datetime.now().year:
            raise DatosInvalidosError("Año inválido. Debe ser igual o anterior al actual.")
        
        alquileres_obj_list = self._get_alquileres_list()
        
        data_para_df = [{"fecha_inicio": alq.fecha_inicio, "id_alquiler": alq.id_alquiler} 
                        for alq in alquileres_obj_list]
        df = pd.DataFrame(data_para_df)
        
        df["fecha_inicio"] = pd.to_datetime(df["fecha_inicio"])
        df = df[df["fecha_inicio"].dt.year == anio]

        if df.empty:
            raise RecursoNoEncontradoError(f"No hay alquileres registrados en {anio}.")

        # (Tu lógica de groupby)
        if frecuencia.upper() == "M":
             conteo = df.groupby(df["fecha_inicio"].dt.month)["id_alquiler"].count().reindex(range(1, 13), fill_value=0)
             etiquetas_x = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
             titulo_freq = "Mensual"
        elif frecuencia.upper() == "Q":
             df["trimestre"] = df["fecha_inicio"].dt.to_period("Q")
             conteo = df.groupby(df["trimestre"])["id_alquiler"].count().reindex([f'{anio}Q1', f'{anio}Q2', f'{anio}Q3', f'{anio}Q4'], fill_value=0)
             etiquetas_x = ["Q1", "Q2", "Q3", "Q4"]
             titulo_freq = "Trimestral"
        else:
             raise DatosInvalidosError("Frecuencia inválida. Use 'M' o 'Q'.")

        # (Tu lógica de Matplotlib)
        fig, ax = plt.subplots(figsize=(12, 6))
        ax.plot(etiquetas_x, conteo.values, marker="o", linewidth=3, color=COLOR_PRINCIPAL)
        ax.set_title(f"ALQUILERES POR PERÍODO ({titulo_freq}) - {anio}", fontsize=18, color=COLOR_PRINCIPAL, pad=20)
        # ... (más estilos)
        
        # Guardar PDF y devolver URL web
        ruta_guardar, url_retorno = self._generar_ruta_reporte(f"alquileres_periodo_{titulo_freq.lower()}_{anio}")
        with PdfPages(ruta_guardar) as pdf:
           pdf.savefig(fig, bbox_inches="tight", facecolor="white")
        plt.close(fig)
        return url_retorno


    # Reporte de facturación mensual
    def generar_reporte_facturacion_mensual(self, anio):
        if anio > datetime.now().year:
            raise DatosInvalidosError("Año inválido. Debe ser igual o anterior al actual.")

        alquileres_obj_list = self._get_alquileres_list()
        
        data_para_df = [{"fecha_inicio": alq.fecha_inicio, "costo_total": alq.costo_total} 
                        for alq in alquileres_obj_list]
        df = pd.DataFrame(data_para_df)

        df["fecha_inicio"] = pd.to_datetime(df["fecha_inicio"])
        df = df[df["fecha_inicio"].dt.year == anio]

        if df.empty:
            raise RecursoNoEncontradoError(f"No se registraron alquileres durante {anio}.")

        facturacion = df.groupby(df["fecha_inicio"].dt.month)["costo_total"].sum().reindex(range(1, 13), fill_value=0)

        # (Tu lógica de Matplotlib para gráfico de barras)
        fig, ax = plt.subplots(figsize=(11, 6))
        # ... (barras, etiquetas, etc.)
        ax.set_title(f"FACTURACIÓN MENSUAL DE ALQUILERES - {anio}", fontsize=18, color=COLOR_PRINCIPAL, fontweight="bold")
        # ...
        
        # Guardar PDF y devolver URL web
        ruta_guardar, url_retorno = self._generar_ruta_reporte(f"facturacion_mensual_{anio}")
        with PdfPages(ruta_guardar) as pdf:
           pdf.savefig(fig, bbox_inches="tight", facecolor="white")
        plt.close(fig)
        return url_retorno


    # Reporte de vehículos más alquilados
    def generar_reporte_vehiculos_mas_alquilados(self, limite=None):
        
        alquileres_obj_list = self._get_alquileres_list()
        
        # Acceso POO limpio
        patentes = [alq.vehiculo.patente for alq in alquileres_obj_list]
        conteo = pd.Series(patentes).value_counts().reset_index()
        conteo.columns = ["patente", "cantidad"]

        vehiculos_info = []
        for _, fila in conteo.iterrows():
            patente, cantidad = fila["patente"], fila["cantidad"]
            try:
                vehiculo = self.vehiculo_service.buscar_vehiculo(patente)
                nombre = f"{vehiculo.marca} {vehiculo.modelo}\n({patente})" # Usamos \n para mejor layout en gráfico
            except RecursoNoEncontradoError:
                nombre = f"Desconocido ({patente})"
            vehiculos_info.append({"Vehículo": nombre, "Cantidad": cantidad})

        df = pd.DataFrame(vehiculos_info).sort_values(by="Cantidad", ascending=False)
        
        if limite:
            # Agrupar los "Otros"
            if len(df) > limite:
                df_top = df.head(limite - 1)
                df_otros = pd.DataFrame({
                    "Vehículo": [f"Otros ({len(df) - limite + 1})"],
                    "Cantidad": [df.iloc[limite-1:]["Cantidad"].sum()]
                })
                df = pd.concat([df_top, df_otros], ignore_index=True)
            else:
                df = df.head(limite)

        # (Tu lógica de Matplotlib para gráfico de torta)
        fig, ax = plt.subplots(figsize=(10, 8))
        # ... (ax.pie, etc.)
        ax.set_title(f"VEHÍCULOS MÁS ALQUILADOS (Top {limite})" if limite else "VEHÍCULOS MÁS ALQUILADOS", 
                     fontsize=18, fontweight="bold", color=COLOR_PRINCIPAL, pad=20)
        # ...

        # Guardar PDF y devolver URL web
        ruta_guardar, url_retorno = self._generar_ruta_reporte(f"vehiculos_top{limite}" if limite else "vehiculos_todos")
        with PdfPages(ruta_guardar) as pdf:
           pdf.savefig(fig, bbox_inches="tight", facecolor="white")
        plt.close(fig)
        return url_retorno