import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib import rcParams

import os
from datetime import datetime

from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors

from servicios.alquiler_service import AlquilerService
from servicios.vehiculo_service import VehiculoService
from servicios.excepciones import RecursoNoEncontradoError, ErrorDeAplicacion, DatosInvalidosError


# Configuración de Matplotlib
rcParams["font.family"] = "sans-serif"
rcParams["font.sans-serif"] = ["Arial", "Helvetica", "DejaVu Sans"]
COLOR_PRINCIPAL_MPL = "#e41a1c"
COLOR_SECUNDARIO_MPL = "#4d4d4d" 
COLOR_TERCERARIO_MPL = "#f2f2f2"
COLOR_BORDES_MPL = "#cccccc"

# Configuracion de ReportLab
COLOR_PRINCIPAL = colors.HexColor("#e41a1c")
COLOR_SECUNDARIO = colors.HexColor("#4d4d4d")
COLOR_TERCIARIO = colors.HexColor("#f2f2f2")
COLOR_BORDES = colors.HexColor("#cccccc")

def get_estilos_reportlab():
    estilos = getSampleStyleSheet()
    estilos.add(ParagraphStyle(
        name="TituloReporte",
        fontSize=18,
        textColor=COLOR_PRINCIPAL,
        fontName="Helvetica-Bold",
        alignment=1,
        spaceAfter=12
    ))
    estilos.add(ParagraphStyle(
        name="SubtituloReporte",
        fontSize=14,
        textColor=COLOR_SECUNDARIO,
        fontName="Helvetica",
        alignment=1,
        spaceAfter=20
    ))
    return estilos

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

        self.estilos_rl = get_estilos_reportlab()

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
        print(f"Guardando reporte en: {ruta_completa_os}")
        
        # URL web que devolveremos al frontend
        # (Usamos '/' para las URLs web, independientemente del SO)
        url_web = f"/{self.STATIC_DIR}/reportes/{nombre_archivo}"
        print(f"URL del reporte: {url_web}")
        
        return ruta_completa_os, url_web

    # Reporte de alquileres por cliente
    def generar_reporte_alquileres_por_cliente(self, cliente_id: int, formato: str = "pdf"):
        # 1. Obtener datos (forma POO)
        alquileres_obj_list = self.alquiler_service.buscar_por_cliente(cliente_id)

        if not alquileres_obj_list:
            raise RecursoNoEncontradoError(f"No se encontraron alquileres para el cliente con ID {cliente_id}.")

        # 2. "Aplanar" los objetos para el DataFrame
        data_para_df = []
        nombre_cliente = ""
        for alq in alquileres_obj_list:
            data_para_df.append({
                "Fecha Inicio": alq.fecha_inicio.strftime("%d/%m/%Y"),
                "Fecha Fin": alq.fecha_fin.strftime("%d/%m/%Y"),
                "Costo Total ($)": alq.costo_total,
                "Fecha Registro": alq.fecha_registro.strftime("%d/%m/%Y"),
                "Empleado": alq.empleado.nombre,
                "Patente": alq.vehiculo.patente,
                "Vehículo": f"{alq.vehiculo.marca} {alq.vehiculo.modelo}",
            })
            if not nombre_cliente:
                nombre_cliente = f"{alq.cliente.nombre} {alq.cliente.apellido}"
        
        df = pd.DataFrame(data_para_df)
        
        # (Aseguramos el orden de columnas deseado)
        columnas_ordenadas = [
            "Fecha Inicio", "Fecha Fin", "Patente", 
            "Vehículo", "Costo Total ($)", "Empleado", "Fecha Registro"
        ]
        df = df[columnas_ordenadas]

        # 3. Exportar PDF
        if formato.lower() == "pdf":
            ruta_guardar, url_retorno = self._generar_ruta_reporte(f"alquileres_cliente_{cliente_id}")

            doc = SimpleDocTemplate(ruta_guardar, pagesize=landscape(A4))
            elementos_pdf = []

            titulo = Paragraph(f"REPORTE DE ALQUILERES", self.estilos_rl["TituloReporte"])
            subtitulo = Paragraph(f"Cliente: {nombre_cliente}", self.estilos_rl["SubtituloReporte"])
            elementos_pdf.append(titulo)
            elementos_pdf.append(subtitulo)

            datos_tabla = [df.columns.tolist()] + df.values.tolist()

            tabla_rl = Table(datos_tabla, colWidths=[1*inch, 1*inch, 1*inch, 2*inch, 1.5*inch, 1.5*inch])
            estilo_tabla = TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), COLOR_PRINCIPAL),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke), # Header text
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), COLOR_TERCIARIO), # Zebra striping
                ('GRID', (0, 0), (-1, -1), 1, COLOR_BORDES),
            ])

            for i, row in enumerate(datos_tabla[1:], start=1):
                if i%2 == 0:
                    estilo_tabla.add("BACKGROUND", (0, i), (-1, i), colors.white)
            
            tabla_rl.setStyle(estilo_tabla)

            elementos_pdf.append(tabla_rl)

            doc.build(elementos_pdf)
            
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