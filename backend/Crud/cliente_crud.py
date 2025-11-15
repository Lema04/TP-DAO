from clases.cliente import Cliente
from orm_base import ORMBase

class ClienteCRUD(ORMBase):
    tabla = "CLIENTE"
    campos = ["nombre", "apellido", "dni", "direccion", "telefono", "email"]
    clave_primaria = "id_cliente"

    def __init__(self):
        super().__init__()


    def _build_cliente(self, tupla):
        """
        Método privado para "ensamblar" un objeto Cliente desde una tupla.
        Esto centraliza la lógica de creación.
        """
        if not tupla:
            return None
        
        # Asume que tu ORMBase devuelve la tupla con la clave primaria al inicio
        # (id_cliente, nombre, apellido, dni, direccion, telefono, email)
        try:
            return Cliente(
                id_cliente=tupla[0],
                nombre=tupla[1],
                apellido=tupla[2],
                dni=tupla[3],
                direccion=tupla[4],
                telefono=tupla[5],
                email=tupla[6]
            )
        except IndexError:
            # Error por si la tupla no es la esperada
            print(f"Error: La tupla {tupla} no coincide con la estructura de Cliente.")
            return None
    

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
        """ Retorna una LISTA DE OBJETOS Cliente. """
        # 1. Obtenemos la lista de tuplas crudas del ORM
        tuplas = self.obtener_todos() 
        
        # 2. "Ensamblamos" cada tupla en un objeto Cliente
        return [self._build_cliente(tupla) for tupla in tuplas]

    def buscar_por_id(self, id_cliente):
        """ Retorna UN OBJETO Cliente o None. """
        # 1. Obtenemos la tupla cruda
        tupla = self.obtener_por_id(id_cliente)
        
        # 2. "Ensamblamos" el objeto
        return self._build_cliente(tupla)

    # --- ¡ARREGLADO! ---
    def buscar_por_nombre_o_dni(self, valor_busqueda):
        """ Retorna una LISTA DE OBJETOS Cliente. """
        sql = f"""
            SELECT {self.clave_primaria}, {', '.join(self.campos)}
            FROM {self.tabla}
            WHERE nombre LIKE ? OR apellido LIKE ? OR dni = ?
        """
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            patron = f"%{valor_busqueda}%"
            cursor.execute(sql, (patron, patron, valor_busqueda))
            
            # 1. Obtenemos las tuplas crudas
            tuplas = cursor.fetchall()
            
            # 2. "Ensamblamos" cada tupla en un objeto Cliente
            return [self._build_cliente(tupla) for tupla in tuplas]

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