import os
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib import rcParams
from servicios.alquiler_service import AlquilerService

# --- Configuración global de estilo de la marca RENTCAR ---
rcParams['font.family'] = 'sans-serif'
rcParams['font.sans-serif'] = ['Arial', 'Helvetica', 'DejaVu Sans']
rcParams['axes.titlesize'] = 18
rcParams['axes.titleweight'] = 'bold'
rcParams['axes.labelsize'] = 14
rcParams['xtick.labelsize'] = 12
rcParams['ytick.labelsize'] = 12
rcParams['text.color'] = '#4d4d4d' 
rcParams['axes.labelcolor'] = '#4d4d4d'
rcParams['xtick.color'] = '#4d4d4d'
rcParams['ytick.color'] = '#4d4d4d'

# Colores de la marca
COLOR_PRINCIPAL = "#e41a1c"  # Rojo RENTCAR
COLOR_SECUNDARIO = "#4d4d4d" # Gris oscuro
COLOR_TERCERARIO = "#f2f2f2" # Gris claro (solo en tablas)
COLOR_BORDES = "#cccccc"     # Borde de celdas de tabla

class ReporteService:
    def __init__(self):
        self.alquiler_service = AlquilerService()

    # 1. Alquileres por cliente
    def alquileres_por_cliente(self, archivo_pdf="alquileres_por_cliente.pdf"):
        alquileres = self.alquiler_service.listar_alquileres()["data"]
        df = pd.DataFrame(alquileres, columns=[
            "id_alquiler", "fecha_inicio", "fecha_fin", "costo_total",
            "fecha_registro", "id_empleado", "patente", "id_cliente"
        ])
        tabla = df.groupby("id_cliente").agg(
            cantidad_alquileres=pd.NamedAgg(column="id_alquiler", aggfunc="count"),
            total_gastado=pd.NamedAgg(column="costo_total", aggfunc="sum")
        ).reset_index()

        fig, ax = plt.subplots(figsize=(10, len(tabla)*0.35 + 3)) 
        ax.axis('off')

        cell_colors = [[COLOR_TERCERARIO if i%2==0 else 'white' for _ in range(len(tabla.columns))] 
                       for i in range(len(tabla))]
        header_colors = [COLOR_SECUNDARIO] * len(tabla.columns) 
        
        tabla_mpl = ax.table(
            cellText=tabla.values,
            colLabels=tabla.columns.str.replace('_', ' ').str.title(), 
            cellColours=cell_colors,
            colColours=header_colors,
            cellLoc="center",
            colLoc="center",
            loc="center"
        )
        
        tabla_mpl.auto_set_font_size(False)
        tabla_mpl.set_fontsize(12)
        tabla_mpl.scale(1,1.5)

        for (row, col), cell in tabla_mpl.get_celld().items():
            cell.set_edgecolor(COLOR_BORDES)
            if row == 0: 
                cell.set_fontsize(14)
                cell.set_text_props(color='white', weight='bold') 
            else:
                cell.set_text_props(color=COLOR_SECUNDARIO) 

        plt.title("ALQUILERES POR CLIENTE", fontsize=18, color=COLOR_PRINCIPAL, pad=20, loc='center') 
        plt.tight_layout()

        with PdfPages(archivo_pdf) as pp:
            pp.savefig(fig, bbox_inches='tight', facecolor='white')
        plt.close(fig)
        return archivo_pdf

    # 2. Vehículos más alquilados
    def vehiculos_mas_alquilados(self, archivo_pdf="vehiculos_mas_alquilados.pdf"):
        alquileres = self.alquiler_service.listar_alquileres()["data"]
        df = pd.DataFrame(alquileres, columns=[
            "id_alquiler", "fecha_inicio", "fecha_fin", "costo_total",
            "fecha_registro", "id_empleado", "patente", "id_cliente"
        ])
        conteo = df["patente"].value_counts()

        fig, ax = plt.subplots(figsize=(8,8)) 
        colores = [COLOR_PRINCIPAL, COLOR_SECUNDARIO, "#ff6666", "#999999", "#cccccc"] 
        
        wedges, texts, autotexts = ax.pie(
            conteo, 
            labels=conteo.index, 
            autopct="%1.1f%%", 
            startangle=90,
            colors=colores[:len(conteo)], 
            wedgeprops={'edgecolor': 'white', 'linewidth': 1.5}, 
            textprops={'fontsize':12, 'color': COLOR_SECUNDARIO} 
        )
        
        for autotext in autotexts:
            autotext.set_color('white') if autotext.get_text() != '0.0%' else autotext.set_color(COLOR_SECUNDARIO)
            autotext.set_weight('bold')

        ax.set_title("VEHÍCULOS MÁS ALQUILADOS", fontsize=18, color=COLOR_PRINCIPAL, pad=20, loc='center')
        ax.axis('equal') 
        with PdfPages(archivo_pdf) as pp:
            pp.savefig(fig, bbox_inches='tight', facecolor='white')
        plt.close(fig)
        return archivo_pdf

    # 3. Alquileres por período
    def alquileres_por_periodo(self, frecuencia="M", archivo_pdf="alquileres_por_periodo.pdf"):
        alquileres = self.alquiler_service.listar_alquileres()["data"]
        df = pd.DataFrame(alquileres, columns=[
            "id_alquiler", "fecha_inicio", "fecha_fin", "costo_total",
            "fecha_registro", "id_empleado", "patente", "id_cliente"
        ])
        df["fecha_inicio"] = pd.to_datetime(df["fecha_inicio"])
        df.set_index("fecha_inicio", inplace=True)
        conteo = df.resample(frecuencia)["id_alquiler"].count()

        fig, ax = plt.subplots(figsize=(12,6))
        
        ax.plot(conteo.index, conteo.values, marker="o", color=COLOR_PRINCIPAL, linewidth=3, 
                markersize=8, markeredgecolor='white', markerfacecolor=COLOR_PRINCIPAL)
        
        ax.set_title(f"ALQUILERES POR PERIODO ({frecuencia})", fontsize=18, color=COLOR_PRINCIPAL, pad=20, loc='center')
        ax.set_xlabel("Fecha", fontsize=14)
        ax.set_ylabel("Cantidad de alquileres", fontsize=14)
        
        ax.grid(axis='y', linestyle="-", alpha=0.7, color=COLOR_BORDES) 
        ax.spines['right'].set_visible(False) 
        ax.spines['top'].set_visible(False)
        ax.spines['left'].set_color(COLOR_BORDES)
        ax.spines['bottom'].set_color(COLOR_BORDES)
        
        plt.xticks(rotation=90, ha='center') 
        plt.tight_layout()

        with PdfPages(archivo_pdf) as pp:
            pp.savefig(fig, bbox_inches='tight', facecolor='white')
        plt.close(fig)
        return archivo_pdf

    # 4. Facturación mensual
    def facturacion_mensual(self, archivo_pdf="facturacion_mensual.pdf"):
        alquileres = self.alquiler_service.listar_alquileres()["data"]
        df = pd.DataFrame(alquileres, columns=[
            "id_alquiler", "fecha_inicio", "fecha_fin", "costo_total",
            "fecha_registro", "id_empleado", "patente", "id_cliente"
        ])
        df["fecha_inicio"] = pd.to_datetime(df["fecha_inicio"])
        df.set_index("fecha_inicio", inplace=True)
        facturacion = df.resample("M")["costo_total"].sum()

        fig, ax = plt.subplots(figsize=(12,6))
        
        etiquetas_x = facturacion.index.strftime("%Y-%m")
        barras = ax.bar(etiquetas_x, facturacion.values,
                        color=COLOR_PRINCIPAL, 
                        edgecolor=COLOR_SECUNDARIO, 
                        linewidth=1.0)
        
        ax.set_title("FACTURACIÓN MENSUAL", fontsize=18, color=COLOR_PRINCIPAL, pad=20, loc='center')
        ax.set_xlabel("Mes de facturación", fontsize=14)
        ax.set_ylabel("Ingresos en AR$", fontsize=14) 
        
        ax.grid(axis='y', linestyle="-", alpha=0.7, color=COLOR_BORDES)
        ax.spines['right'].set_visible(False)
        ax.spines['top'].set_visible(False)
        ax.spines['left'].set_color(COLOR_BORDES)
        ax.spines['bottom'].set_color(COLOR_BORDES)
        
        plt.xticks(rotation=90, ha='center') 
        plt.tight_layout()

        with PdfPages(archivo_pdf) as pp:
            pp.savefig(fig, bbox_inches='tight', facecolor='white')
        plt.close(fig)
        return archivo_pdf