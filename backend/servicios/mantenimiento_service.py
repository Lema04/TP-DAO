from Crud.mantenimiento_crud import MantenimientoCRUD
from clases.mantenimiento import Mantenimiento
from datetime import date

class MantenimientoService:
    def __init__(self):
        self.dao = MantenimientoCRUD()

    # Crear un nuevo mantenimiento
    def crear_mantenimiento(self, datos):
        try:
            vehiculo = datos.get("vehiculo")
            if vehiculo is None:
                return {"estado": "error", "mensaje": "Debe asociarse un vehículo al mantenimiento."}

            # Validar fechas
            fecha_inicio = datos.get("fecha_inicio")
            fecha_fin = datos.get("fecha_fin")
            if not isinstance(fecha_inicio, date) or not isinstance(fecha_fin, date):
                return {"estado": "error", "mensaje": "Las fechas deben ser objetos date válidos."}

            # Crear objeto Mantenimiento
            mantenimiento = Mantenimiento(
                id_mantenimiento=int(datos.get("id_mantenimiento")),
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                tipo_servicio=datos.get("tipo_servicio", ""),
                costo=float(datos.get("costo", 0)),
                vehiculo=vehiculo
            )

            self.dao.crear_mantenimiento(mantenimiento)
            return {"estado": "ok", "mensaje": f"Mantenimiento creado para vehículo {vehiculo.patente}."}

        except ValueError as e:
            return {"estado": "error", "mensaje": str(e)}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al crear mantenimiento: {e}"}