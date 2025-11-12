from clases.usuario import Usuario
from servicios.orm_base import ORMBase

class UsuarioCRUD(ORMBase):
    """
    Clase responsable de realizar las operaciones CRUD sobre la tabla USUARIO
    en la base de datos.
    """

    tabla = "USUARIO"
    campos = ["nombre_usuario", "contraseña", "rol", "id_cliente", "id_empleado"]
    clave_primaria = "id_usuario"

    def __init__(self):
        super().__init__()

    # Verificar si un usuario existe por su nombre de usuario
    def existe_usuario(self, nombre_usuario: str) -> bool:
        sql = f"SELECT COUNT(*) FROM {self.tabla} WHERE nombre_usuario=?"
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, (nombre_usuario,))
            cantidad = cursor.fetchone()[0]
            return cantidad > 0

    def buscar_por_nombre(self, nombre_usuario: str):
        sql = f"""
            SELECT {self.clave_primaria}, {', '.join(self.campos)}
            FROM {self.tabla}
            WHERE nombre_usuario = ?
        """
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, (nombre_usuario,))
            fila = cursor.fetchone()
            if fila:
                return Usuario(*fila)
            return None

    # Crear un nuevo usuario
    def crear_usuario(self, usuario: Usuario):
        if self.existe_usuario(usuario.nombre_usuario):
            raise ValueError("Ya existe un usuario con ese nombre.")

        return self.insertar([
            usuario.nombre_usuario,
            usuario.contraseña,
            usuario.rol,
            usuario.id_cliente,
            usuario.id_empleado
        ])

    # Listar todos los usuarios existentes
    def listar_usuarios(self):
        return self.obtener_todos()

    # Buscar un usuario existente por su ID
    def buscar_por_id(self, id_usuario: int):
        fila = self.obtener_por_id(id_usuario)
        if fila:
            return Usuario(*fila)
        return None

    # Actualizar los datos de un usuario existente
    def actualizar_usuario(self, usuario: Usuario):
        self.actualizar(usuario.id_usuario, [
            usuario.nombre_usuario,
            usuario.contraseña,
            usuario.rol,
            usuario.id_cliente,
            usuario.id_empleado
        ])

    # Eliminar un usuario existente por su ID
    def eliminar_usuario(self, id_usuario: int):
        self.eliminar(id_usuario)
