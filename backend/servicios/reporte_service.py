import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib import rcParams
from datetime import datetime
from servicios.alquiler_service import AlquilerService
from servicios.vehiculo_service import VehiculoService

# Configuración global de tipogradías y colores
rcParams["font.family"] = "sans-serif"
rcParams["font.sans-serif"] = ["Arial", "Helvetica", "DejaVu Sans"]
COLOR_PRINCIPAL = "#e41a1c"   # Rojo
COLOR_SECUNDARIO = "#4d4d4d"  # Gris oscuro
COLOR_TERCERARIO = "#f2f2f2"  # Gris claro
COLOR_BORDES = "#cccccc"      # Bordes

class ReporteService:
    def __init__(self):
        """Inicializa los servicios necesarios para la generación de reportes."""
        self.alquiler_service = AlquilerService()
        self.vehiculo_service = VehiculoService()

    # Reporte de alquileres por cliente
    def generar_reporte_alquileres_por_cliente(self, cliente_id: int, formato: str = "pdf"):
        """
        Genera un reporte con todos los alquileres realizados por un cliente.
        Puede exportarse en formato PDF o Excel.
        """
        # Obtener datos
        resultado = self.alquiler_service.buscar_por_cliente(cliente_id)
        if resultado["estado"] != "ok":
            raise Exception(resultado["mensaje"])
        alquileres = resultado["data"]

        if not alquileres:
            raise Exception(f"No se encontraron alquileres para el cliente con ID {cliente_id}.")

        # Crear DataFrame
        columnas = [
            "id_alquiler", "fecha_inicio", "fecha_fin", "costo_total",
            "fecha_registro", "id_empleado", "patente", "id_cliente"
        ]
        df = pd.DataFrame(alquileres, columns=columnas)

        # Formatear fechas
        for col in ["fecha_inicio", "fecha_fin", "fecha_registro"]:
            df[col] = pd.to_datetime(df[col]).dt.strftime("%d/%m/%Y")

        # Renombrar columnas para el reporte
        df.rename(columns={
            "id_alquiler": "ID Alquiler",
            "fecha_inicio": "Fecha Inicio",
            "fecha_fin": "Fecha Fin",
            "costo_total": "Costo Total ($)",
            "fecha_registro": "Fecha Registro",
            "id_empleado": "ID Empleado",
            "patente": "Patente Vehículo",
            "id_cliente": "ID Cliente"
        }, inplace=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        nombre_base = f"reporte_alquileres_cliente_{cliente_id}_{timestamp}"

        # Exportar PDF
        if formato.lower() == "pdf":
            archivo_pdf = f"{nombre_base}.pdf"
            fig, ax = plt.subplots(figsize=(11, 6))
            fig.patch.set_facecolor("white")
            ax.axis("off")

            # Título
            fig.text(0.5, 0.93, f"REPORTE DE ALQUILERES DEL CLIENTE {cliente_id}",
                     ha="center", fontsize=18, color=COLOR_PRINCIPAL, fontweight="bold")

            # Tabla
            tabla = ax.table(cellText=df.values, colLabels=df.columns,
                             cellLoc="center", loc="center")

            tabla.auto_set_font_size(False)
            tabla.set_fontsize(10)
            tabla.scale(1.2, 1.3)

            for (row, _), cell in tabla.get_celld().items():
                if row == 0:
                    cell.set_facecolor(COLOR_PRINCIPAL)
                    cell.set_text_props(color="white", fontweight="bold")
                elif row % 2 == 0:
                    cell.set_facecolor(COLOR_TERCERARIO)
                cell.set_edgecolor(COLOR_BORDES)

            # Guardar PDF
            with PdfPages(archivo_pdf) as pdf:
                pdf.savefig(fig, bbox_inches="tight", facecolor="white")
            plt.close(fig)
            return archivo_pdf

        # Exportar Excel
        elif formato.lower() == "excel":
            archivo_excel = f"{nombre_base}.xlsx"
            df.to_excel(archivo_excel, index=False)
            return archivo_excel

        else:
            raise Exception("Formato no soportado. Use 'pdf' o 'excel'.")

    # Reporte alquileres por periodo
    def generar_reporte_alquileres_por_periodo(self, frecuencia="M", anio=None):
        """
        Genera un gráfico en PDF mostrando la cantidad de alquileres agrupados por
        período mensual o trimestral para el año indicado.
        """
        # Validación de año
        if anio is None:
            anio = datetime.now().year
        elif anio > datetime.now().year:
            raise Exception("Año inválido. Debe ser igual o anterior al actual.")

        # Obtener datos
        resultado = self.alquiler_service.listar_alquileres()
        df = pd.DataFrame(resultado["data"], columns=[
            "id_alquiler", "fecha_inicio", "fecha_fin", "costo_total",
            "fecha_registro", "id_empleado", "patente", "id_cliente"
        ])
        df["fecha_inicio"] = pd.to_datetime(df["fecha_inicio"])
        df = df[df["fecha_inicio"].dt.year == anio]

        if df.empty:
            raise Exception(f"No hay alquileres registrados en {anio}.")

        # Agrupar según frecuencia
        if frecuencia.upper() == "M":
            conteo = df.groupby(df["fecha_inicio"].dt.month)["id_alquiler"].count().reindex(range(1, 13), fill_value=0)
            etiquetas_x = [str(i) for i in range(1, 13)]
            titulo_freq = "Mensual"
        elif frecuencia.upper() == "Q":
            df["trimestre"] = df["fecha_inicio"].dt.to_period("Q")
            conteo = df.groupby(df["trimestre"])["id_alquiler"].count()
            etiquetas_x = ["Q1", "Q2", "Q3", "Q4"]
            titulo_freq = "Trimestral"
        else:
            raise Exception("Frecuencia inválida. Use 'M' o 'Q'.")

        # Gráfico
        fig, ax = plt.subplots(figsize=(12, 6))
        ax.plot(etiquetas_x, conteo.values, marker="o", linewidth=3,
                color=COLOR_PRINCIPAL, markeredgecolor="white")

        ax.set_title(f"ALQUILERES POR PERÍODO ({titulo_freq}) - {anio}",
                     fontsize=18, color=COLOR_PRINCIPAL, pad=20)
        ax.set_xlabel("Período", fontsize=14)
        ax.set_ylabel("Cantidad de alquileres", fontsize=14)
        ax.grid(axis="y", linestyle="--", color=COLOR_BORDES, alpha=0.6)

        for spine in ["right", "top"]:
            ax.spines[spine].set_visible(False)
        plt.tight_layout()

        # Guardar PDF
        archivo_pdf = f"reporte_alquileres_periodo_{titulo_freq.lower()}_{anio}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        with PdfPages(archivo_pdf) as pdf:
            pdf.savefig(fig, bbox_inches="tight", facecolor="white")
        plt.close(fig)
        return archivo_pdf

    # Reporte de facturación mensual
    def generar_reporte_facturacion_mensual(self, anio):
        """
        Genera un histograma en PDF mostrando la facturación mensual
        de los alquileres para el año indicado.
        """
        # Validación de año
        if anio > datetime.now().year:
            raise Exception("Año inválido. Debe ser igual o anterior al actual.")

        # Obtener datos
        resultado = self.alquiler_service.listar_alquileres()
        alquileres = resultado["data"]

        if not alquileres:
            raise Exception("No hay alquileres registrados.")

        df = pd.DataFrame(alquileres, columns=[
            "id_alquiler", "fecha_inicio", "fecha_fin", "costo_total",
            "fecha_registro", "id_empleado", "patente", "id_cliente"
        ])
        df["fecha_inicio"] = pd.to_datetime(df["fecha_inicio"])
        df["anio"] = df["fecha_inicio"].dt.year
        df["mes"] = df["fecha_inicio"].dt.month
        df = df[df["anio"] == anio]

        if df.empty:
            raise Exception(f"No se registraron alquileres durante {anio}.")

        facturacion = df.groupby("mes")["costo_total"].sum().reindex(range(1, 13), fill_value=0)

        # Gráfico 
        fig, ax = plt.subplots(figsize=(11, 6))
        fig.patch.set_facecolor("white")

        fig.text(0.5, 0.93, f"FACTURACIÓN MENSUAL DE ALQUILERES - {anio}",
                 ha="center", fontsize=18, color=COLOR_PRINCIPAL, fontweight="bold")

        barras = ax.bar(range(1, 13), facturacion.values,
                        color=COLOR_PRINCIPAL, edgecolor=COLOR_BORDES, alpha=0.85)

        ax.set_xticks(range(1, 13))
        ax.set_xticklabels(["Ene", "Feb", "Mar", "Abr", "May", "Jun",
                            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"])
        ax.set_ylabel("Facturación ($)", fontsize=13, color=COLOR_SECUNDARIO)
        ax.set_xlabel("Mes", fontsize=13, color=COLOR_SECUNDARIO)
        ax.grid(axis="y", linestyle="--", alpha=0.6, color=COLOR_BORDES)

        for rect in barras:
            altura = rect.get_height()
            ax.text(rect.get_x() + rect.get_width() / 2, altura + 0.02 * max(facturacion.values),
                    f"${altura:,.0f}", ha="center", va="bottom", fontsize=10, color=COLOR_SECUNDARIO)

        for spine in ["right", "top"]:
            ax.spines[spine].set_visible(False)

        plt.tight_layout(rect=[0, 0, 1, 0.92])

        # Guardar PDF
        archivo_pdf = f"reporte_facturacion_mensual_{anio}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        with PdfPages(archivo_pdf) as pdf:
            pdf.savefig(fig, bbox_inches="tight", facecolor="white")
        plt.close(fig)
        return archivo_pdf

    # Reporte de vehículos más alquilados
    def generar_reporte_vehiculos_mas_alquilados(self, limite=None):
        """
        Genera un gráfico de torta con los vehículos más alquilados.
        Si se indica `limite`, se muestran los primeros N.
        Caso contrario, se muestran todos.
        """
        # Obtener datos
        resultado = self.alquiler_service.listar_alquileres()
        if resultado["estado"] != "ok" or not resultado["data"]:
            raise Exception("No se encontraron alquileres en el sistema.")

        alquileres = resultado["data"]
        patentes = [a["patente"] if isinstance(a, dict) else a[6] for a in alquileres]
        conteo = pd.Series(patentes).value_counts().reset_index()
        conteo.columns = ["patente", "cantidad"]

        vehiculos_info = []
        for _, fila in conteo.iterrows():
            patente, cantidad = fila["patente"], fila["cantidad"]
            v_res = self.vehiculo_service.buscar_por_id(patente)

            if v_res["estado"] == "ok" and v_res["data"]:
                vehiculo = v_res["data"][0] if isinstance(v_res["data"], list) else v_res["data"]
                nombre = f"{getattr(vehiculo, 'marca', 'Desconocida')} {getattr(vehiculo, 'modelo', 'Desconocido')} ({patente})"
            else:
                nombre = f"Desconocido ({patente})"

            vehiculos_info.append({"Vehículo": nombre, "Cantidad": cantidad})

        df = pd.DataFrame(vehiculos_info)
        if limite:
            df = df.head(limite)

        # Gráfico
        fig, ax = plt.subplots(figsize=(9, 7))
        wedges, _, autotexts = ax.pie(df["Cantidad"], labels=df["Vehículo"],
                                      autopct="%1.1f%%", startangle=90,
                                      textprops={"color": COLOR_SECUNDARIO, "fontsize": 11})

        for t in autotexts:
            t.set_color("white")
            t.set_fontweight("bold")

        ax.set_title("VEHÍCULOS MÁS ALQUILADOS", fontsize=18,
                     fontweight="bold", color=COLOR_PRINCIPAL, pad=20)

        fig.patch.set_facecolor("white")
        plt.tight_layout()

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Guardar PDF
        archivo_pdf = (f"reporte_vehiculos_mas_alquilados_top{limite}_{timestamp}.pdf"
                       if limite else f"reporte_vehiculos_mas_alquilados_todos_{timestamp}.pdf")
        with PdfPages(archivo_pdf) as pdf:
            pdf.savefig(fig, bbox_inches="tight", facecolor="white")
        plt.close(fig)
        return archivo_pdf