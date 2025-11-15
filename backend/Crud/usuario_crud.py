# --- Archivo: Crud/usuario_crud.py ---

from clases.usuario import Usuario
from orm_base import ORMBase

class UsuarioCRUD(ORMBase):
    """
    Clase responsable de realizar las operaciones CRUD (y "ensamblaje")
    sobre la tabla USUARIO.
    """
    tabla = "USUARIO"
    campos = ["nombre_usuario", "contraseña", "rol", "id_cliente", "id_empleado"]
    clave_primaria = "id_usuario"

    def __init__(self):
        super().__init__()

    # --- ¡MEJOR PRÁCTICA: El Ensamblador! ---
    def _build_usuario(self, tupla):
        """
        Método privado para "ensamblar" un objeto Usuario desde una tupla.
        """
        if not tupla:
            return None
        
        # (id_usuario, nombre_usuario, contraseña, rol, id_cliente, id_empleado)
        try:
            return Usuario(
                id_usuario=tupla[0],
                nombre_usuario=tupla[1],
                contraseña=tupla[2],
                rol=tupla[3],
                id_cliente=tupla[4],
                id_empleado=tupla[5]
            )
        except Exception as e:
            print(f"Error ensamblando Usuario: {e}")
            return None
    # -----------------------------------------------

    def existe_usuario(self, nombre_usuario: str) -> bool:
        # (Tu código está perfecto)
        sql = f"SELECT COUNT(*) FROM {self.tabla} WHERE nombre_usuario=?"
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, (nombre_usuario,))
            cantidad = cursor.fetchone()[0]
            return cantidad > 0

    # --- ¡ARREGLADO! ---
    def buscar_por_nombre(self, nombre_usuario: str):
        """ Retorna UN OBJETO Usuario o None. """
        sql = f"SELECT {self.clave_primaria}, {', '.join(self.campos)} FROM {self.tabla} WHERE nombre_usuario = ?"
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, (nombre_usuario,))
            tupla = cursor.fetchone()
            return self._build_usuario(tupla) # Usamos el ensamblador

    def crear_usuario(self, usuario: Usuario):
        # (Tu código está perfecto)
        if self.existe_usuario(usuario.nombre_usuario):
            raise ValueError("Ya existe un usuario con ese nombre.")
        return self.insertar([
            usuario.nombre_usuario,
            usuario.contraseña, # (Guardando contraseña plana, como en tu diseño original)
            usuario.rol,
            usuario.id_cliente,
            usuario.id_empleado
        ])

    # --- ¡ARREGLADO! ---
    def listar_usuarios(self):
        """ Retorna una LISTA DE OBJETOS Usuario. """
        tuplas = self.obtener_todos()
        return [self._build_usuario(t) for t in tuplas if self._build_usuario(t)]

    # --- ¡ARREGLADO! ---
    def buscar_por_id(self, id_usuario: int):
        """ Retorna UN OBJETO Usuario o None. """
        tupla = self.obtener_por_id(id_usuario)
        return self._build_usuario(tupla) # Usamos el ensamblador

    def actualizar_usuario(self, usuario: Usuario):
        # (Tu código está perfecto)
        self.actualizar(usuario.id_usuario, [
            usuario.nombre_usuario,
            usuario.contraseña,
            usuario.rol,
            usuario.id_cliente,
            usuario.id_empleado
        ])

    def eliminar_usuario(self, id_usuario: int):
        # (Tu código está perfecto)
        self.eliminar(id_usuario)