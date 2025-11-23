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

    def _build_usuario(self, tupla):
        """
        Método privado para "ensamblar" un objeto Usuario desde una tupla.
        """
        if not tupla:
            return None
        
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

    def existe_usuario(self, nombre_usuario: str) -> bool:
        sql = f"SELECT COUNT(*) FROM {self.tabla} WHERE nombre_usuario=?"
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, (nombre_usuario,))
            cantidad = cursor.fetchone()[0]
            return cantidad > 0

    def buscar_por_nombre(self, nombre_usuario: str):
        """ Retorna UN OBJETO Usuario o None. """
        sql = f"SELECT {self.clave_primaria}, {', '.join(self.campos)} FROM {self.tabla} WHERE nombre_usuario = ?"
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, (nombre_usuario,))
            tupla = cursor.fetchone()
            return self._build_usuario(tupla)

    def buscar_por_cliente_id(self, id_cliente):
        condicion = f"id_cliente = {id_cliente}"
        resultado = self.obtener_por_condicion(condicion)

        if not resultado:
            return None

        tupla = resultado[0]
        return self._build_usuario(tupla)


    def buscar_por_empleado_id(self, id_empleado):
        """
        Retorna un objeto Usuario o None buscando por la FK id_empleado.
        Usa el método del ORMBase para mantener consistencia.
        """
        condicion = f"id_empleado = {id_empleado}"
        resultado = self.obtener_por_condicion(condicion)

        if not resultado:
            return None

        tupla = resultado[0]
        return self._build_usuario(tupla)

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

    def listar_usuarios(self):
        """ Retorna una LISTA DE OBJETOS Usuario. """
        tuplas = self.obtener_todos()
        return [self._build_usuario(t) for t in tuplas if self._build_usuario(t)]

    def buscar_por_id(self, id_usuario: int):
        """ Retorna UN OBJETO Usuario o None. """
        tupla = self.obtener_por_id(id_usuario)
        return self._build_usuario(tupla)

    def actualizar_usuario(self, usuario: Usuario):
        self.actualizar(usuario.id_usuario, [
            usuario.nombre_usuario,
            usuario.contraseña,
            usuario.rol,
            usuario.id_cliente,
            usuario.id_empleado
        ])

    def eliminar_usuario(self, id_usuario: int):
        self.eliminar(id_usuario)