from orm_base import ORMBase
from clases.empleado import Empleado 

class EmpleadoCRUD(ORMBase):
    tabla = "EMPLEADO"
    campos = ["nombre", "apellido", "dni", "puesto", "id_supervisor"]
    clave_primaria = "id_empleado"

    def __init__(self):
        super().__init__()

    # --- ¡MEJOR PRÁCTICA: El Ensamblador! ---
    def _build_empleado(self, tupla):
        """
        Método privado para "ensamblar" un objeto Empleado desde una tupla.
        """
        if not tupla:
            return None
        
        # El ORMBase.obtener_... devuelve (pk, campo1, campo2, ...)
        # (id_empleado, nombre, apellido, dni, puesto, id_supervisor)
        try:
            return Empleado(
                id_empleado=tupla[0],
                nombre=tupla[1],
                apellido=tupla[2],
                dni=tupla[3],
                puesto=tupla[4],
                id_supervisor=tupla[5]
            )
        except Exception as e:
            print(f"Error al ensamblar Empleado desde tupla {tupla}: {e}")
            return None

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

# --- ¡ARREGLADO! ---
    def listar_empleados(self):
        """ Retorna una LISTA DE OBJETOS Empleado. """
        tuplas = self.obtener_todos()
        return [self._build_empleado(t) for t in tuplas if self._build_empleado(t)]

    # --- ¡ARREGLADO! ---
    def buscar_por_id(self, id_empleado):
        """ Retorna UN OBJETO Empleado o None. """
        tupla = self.obtener_por_id(id_empleado)
        return self._build_empleado(tupla) # Usamos el ensamblador

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