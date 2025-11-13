from clases.cliente import Cliente
from orm_base import ORMBase

class ClienteCRUD(ORMBase):
    tabla = "CLIENTE"
    campos = ["nombre", "apellido", "dni", "direccion", "telefono", "email"]
    clave_primaria = "id_cliente"

    def __init__(self):
        super().__init__()

    # Verificar si ya existe un cliente con el mismo DNI o email
    def existe_duplicado(self, dni, email):
        sql = f"SELECT COUNT(*) FROM {self.tabla} WHERE dni=? OR email=?"
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, (dni, email))
            cantidad = cursor.fetchone()[0]
            return cantidad > 0

    # Crear un nuevo cliente
    def crear_cliente(self, cliente: Cliente):
        if self.existe_duplicado(cliente.dni, cliente.email):
            raise ValueError("Ya existe un cliente con el mismo DNI o email.")
        return self.insertar([
            cliente.nombre,
            cliente.apellido,
            cliente.dni,
            cliente.direccion,
            cliente.telefono,
            cliente.email
        ])

    # Listar todos los clientes existentes
    def listar_clientes(self):
        return self.obtener_todos()

    # Buscar un cliente existente por ID
    def buscar_por_id(self, id_cliente):
        fila = self.obtener_por_id(id_cliente)
        if fila:
            return Cliente(*fila)
        return None

    # Buscar clientes existentes por nombre, apellido o DNI
    def buscar_por_nombre_o_dni(self, valor_busqueda):
        sql = f"""
            SELECT {self.clave_primaria}, {', '.join(self.campos)}
            FROM {self.tabla}
            WHERE nombre LIKE ? OR apellido LIKE ? OR dni = ?
        """
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            patron = f"%{valor_busqueda}%"
            cursor.execute(sql, (patron, patron, valor_busqueda))
            return cursor.fetchall()

    # Actualizar un cliente existente
    def actualizar_cliente(self, cliente: Cliente):
        self.actualizar(cliente.id_cliente, [
            cliente.nombre,
            cliente.apellido,
            cliente.dni,
            cliente.direccion,
            cliente.telefono,
            cliente.email
        ])

    # Eliminar un cliente existente por ID
    def eliminar_cliente(self, id_cliente):
        self.eliminar(id_cliente)