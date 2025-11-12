from servicios.orm_base import ORMBase
from clases.alquiler import Alquiler

class AlquilerCRUD(ORMBase):
    tabla = "ALQUILER"
    campos = ["fecha_inicio", "fecha_fin", "costo_total", "fecha_registro", 
              "id_empleado", "patente", "id_cliente"]
    clave_primaria = "id_alquiler"

    def __init__(self):
        super().__init__()

    # Crear un nuevo alquiler
    def crear_alquiler(self, alquiler: Alquiler):
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

    # Listar todos los alquileres existentes
    def listar_alquileres(self):
        return self.obtener_todos()

    # Buscar un alquiler existente por ID
    def buscar_por_id(self, id_alquiler):
        return self.obtener_por_id(id_alquiler)

    # Buscar alquileres por ID de cliente
    def buscar_por_cliente(self, id_cliente):
        condicion = f"id_cliente = {id_cliente}"
        return self.obtener_por_condicion(condicion)
    
    # Actualizar un alquiler existente
    def actualizar_alquiler(self, alquiler: Alquiler):
        valores = [
            alquiler.fecha_inicio,
            alquiler.fecha_fin,
            alquiler.costo_total,
            alquiler.fecha_registro,
            alquiler.empleado.id_empleado,
            alquiler.vehiculo.patente,
            alquiler.cliente.id_cliente
        ]
        self.actualizar(alquiler.id_alquiler, valores)

    # Eliminar un alquiler existente por ID
    def eliminar_alquiler(self, id_alquiler):
        self.eliminar(id_alquiler)