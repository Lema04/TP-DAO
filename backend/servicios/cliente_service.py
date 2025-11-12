from clases.cliente import Cliente
from Crud.cliente_crud import ClienteCRUD

class ClienteService:
    def __init__(self):
        self.dao = ClienteCRUD()

    # Crear un nuevo cliente
    def crear_cliente(self, datos):
        """
        datos: dict con claves
        { 'nombre', 'apellido', 'dni', 'direccion', 'telefono', 'email' }
        """
        try:
            cliente = Cliente(
                id_cliente=None,
                nombre=datos.get('nombre', '').strip(),
                apellido=datos.get('apellido', '').strip(),
                dni=datos.get('dni', '').strip(),
                direccion=datos.get('direccion', '').strip(),
                telefono=datos.get('telefono', '').strip(),
                email=datos.get('email', '').strip()
            )
            nuevo_id = self.dao.crear_cliente(cliente)
            return {"estado": "ok", "mensaje": f"Cliente creado con ID {nuevo_id}."}
        
        except ValueError as e:
            return {"estado": "error", "mensaje": str(e)}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al crear cliente: {e}"}

    # Listar todos los clientes existentes
    def listar_clientes(self):
        try:
            clientes = self.dao.listar_clientes()
            return {"estado": "ok", "data": clientes}
        
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al listar clientes: {e}"}

    # Buscar un cliente existente por ID
    def buscar_cliente(self, id_cliente):
        try:
            cliente = self.dao.buscar_por_id(id_cliente)
            if cliente:
                return {"estado": "ok", "data": cliente}
            return {"estado": "error", "mensaje": "Cliente no encontrado."}
        
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al buscar cliente: {e}"}
    
    # Buscar clientes existentes por nombre, apellido o DNI
    def buscar_clientes(self, valor):
        try:
            resultados = self.dao.buscar_por_nombre_o_dni(valor)
            if resultados:
                return {"estado": "ok", "data": resultados}
            return {"estado": "error", "mensaje": "No se encontraron coincidencias."}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error en la búsqueda: {e}"}

    # Actualizar un cliente existente
    def actualizar_cliente(self, id_cliente, nuevos_datos):
        try:
            cliente = self.dao.buscar_por_id(id_cliente)
            if not cliente:
                return {"estado": "error", "mensaje": "Cliente no encontrado."}

            for clave, valor in nuevos_datos.items():
                if hasattr(cliente, clave):
                    setattr(cliente, clave, valor.strip())

            self.dao.actualizar_cliente(cliente)
            return {"estado": "ok", "mensaje": "Cliente actualizado correctamente."}
        
        except ValueError as e:
            return {"estado": "error", "mensaje": str(e)}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al actualizar cliente: {e}"}

    # Eliminar un cliente existente por ID
    def eliminar_cliente(self, id_cliente):
        try:
            self.dao.eliminar_cliente(id_cliente)
            return {"estado": "ok", "mensaje": "Cliente eliminado correctamente."}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al eliminar cliente: {e}"}
