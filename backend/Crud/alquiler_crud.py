# servicios/alquiler_crud.py

from ..servicios import ORMBase
from ..clases.alquiler import Alquiler

class AlquilerCRUD(ORMBase):
    tabla = "ALQUILER"
    campos = ["fecha_inicio", "fecha_fin", "costo_total", "fecha_registro", 
              "id_empleado", "patente", "id_cliente"]
    clave_primaria = "id_alquiler"

    def __init__(self):
        super().__init__()

    def crear_alquiler(self, alquiler: Alquiler):
        # Extraemos los IDs de los objetos anidados
        valores = [
            alquiler.fecha_inicio,
            alquiler.fecha_fin,
            alquiler.costo_total,
            alquiler.fecha_registro,
            alquiler.empleado.id_empleado,
            alquiler.vehiculo.patente,
            alquiler.cliente.id_cliente
        ]
        return self.insertar(valores)

    def listar_alquileres(self):
        return self.obtener_todos()

    def buscar_por_id_simple(self, id_alquiler):
        # Este método solo devuelve la fila (con los IDs)
        # El "ensamblaje" lo hará el Service
        return self.obtener_por_id(id_alquiler)
        
    def actualizar_alquiler(self, alquiler: Alquiler):
        self.actualizar(alquiler.id_alquiler, [
            alquiler.fecha_inicio,
            alquiler.fecha_fin,
            alquiler.costo_total,
            alquiler.fecha_registro,
            alquiler.empleado.id_empleado,
            alquiler.vehiculo.patente,
            alquiler.cliente.id_cliente
        ])

    def eliminar_alquiler(self, id_alquiler):
        self.eliminar(id_alquiler)