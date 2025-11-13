from orm_base import ORMBase
from clases.empleado import Empleado 

class EmpleadoCRUD(ORMBase):
    tabla = "EMPLEADO"
    campos = ["nombre", "apellido", "dni", "puesto", "id_supervisor"]
    clave_primaria = "id_empleado"

    def __init__(self):
        super().__init__()

    # Verificar si existe un empleado con el mismo DNI
    def existe_duplicado(self, dni):
        sql = f"SELECT COUNT(*) FROM {self.tabla} WHERE dni=?"
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, (dni,))
            cantidad = cursor.fetchone()[0]
            return cantidad > 0

    # Crear un nuevo empleado
    def crear_empleado(self, empleado: Empleado):
        if self.existe_duplicado(empleado.dni):
            raise ValueError(f"Ya existe un empleado con el DNI {empleado.dni}.")
        return self.insertar([
            empleado.nombre,
            empleado.apellido,
            empleado.dni,
            empleado.puesto,
            empleado.id_supervisor
        ])

    # Listar todos los empleados existentes
    def listar_empleados(self):
        return self.obtener_todos()

    # Buscar un empleado existente por su ID
    def buscar_por_id(self, id_empleado):
        fila = self.obtener_por_id(id_empleado)
        if fila:
            return Empleado(*fila) 
        return None

    # Actualizar los datos de un empleado existente
    def actualizar_empleado(self, empleado: Empleado):
        self.actualizar(empleado.id_empleado, [
            empleado.nombre,
            empleado.apellido,
            empleado.dni,
            empleado.puesto,
            empleado.id_supervisor
        ])

    # Eliminar un empleado existente por su ID
    def eliminar_empleado(self, id_empleado):
        self.eliminar(id_empleado)