import re
from orm_base import ORMBase
from ..clases.cliente import Cliente

class ClienteCRUD(ORMBase):
    tabla = "CLIENTE"
    campos = ["nombre", "apellido", "dni", "direccion", "telefono", "email"]
    clave_primaria = "id_cliente"

    def __init__(self):
        super().__init__()

    # --- VALIDACIONES ---
    def validar_datos(self, cliente: Cliente):
        # DNI: solo números, 7 u 8 dígitos
        if not re.fullmatch(r"\d{7,8}", cliente.dni):
            raise ValueError("DNI inválido. Debe contener 7 u 8 dígitos numéricos.")

        # Email: formato simple válido
        if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", cliente.email):
            raise ValueError("Email inválido.")

        # Teléfono: solo números (7 a 15 dígitos)
        if not re.fullmatch(r"\d{7,15}", cliente.telefono):
            raise ValueError("Teléfono inválido. Solo números, 7 a 15 dígitos.")

    def existe_duplicado(self, dni, email):
        sql = f"SELECT COUNT(*) FROM {self.tabla} WHERE dni=? OR email=?"
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, (dni, email))
            cantidad = cursor.fetchone()[0]
            return cantidad > 0

    # --- CRUD ---
    def crear_cliente(self, cliente: Cliente):
        self.validar_datos(cliente)
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

    def listar_clientes(self):
        return self.obtener_todos()

    def buscar_por_id(self, id_cliente):
        fila = self.obtener_por_id(id_cliente)
        if fila:
            return Cliente(*fila)
        return None

    def actualizar_cliente(self, cliente: Cliente):
        self.validar_datos(cliente)
        self.actualizar(cliente.id_cliente, [
            cliente.nombre,
            cliente.apellido,
            cliente.dni,
            cliente.direccion,
            cliente.telefono,
            cliente.email
        ])

    def eliminar_cliente(self, id_cliente):
        self.eliminar(id_cliente)

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