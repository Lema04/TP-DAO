# servicios/vehiculo_service.py

from Crud.vehiculo_crud import VehiculoCRUD
from clases.vehiculo import Vehiculo

class VehiculoService:
    def __init__(self):
        self.dao = VehiculoCRUD()

    # Crear un nuevo vehículo
    def crear_vehiculo(self, datos):
        """
        datos: dict con claves
        { 'patente', 'marca', 'modelo', 'anio', 'precio_diario', 'estado' }
        """
        try:
            vehiculo = Vehiculo(
                patente=datos.get('patente', '').strip().upper(),
                marca=datos.get('marca', '').strip(),
                modelo=datos.get('modelo', '').strip(),
                anio=int(datos.get('anio', 0)),
                precio_diario=float(datos.get('precio_diario', 0.0)),
                estado=datos.get('estado', 'Disponible').strip()
            )
            
            patente_creada = self.dao.crear_vehiculo(vehiculo)
            return {"estado": "ok", "mensaje": f"Vehículo creado con patente {patente_creada}."}
        
        except ValueError as e: 
            return {"estado": "error", "mensaje": str(e)}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al crear vehículo: {e}"}
        
    def buscar_vehiculo(self, patente):
        try:
            vehiculo = self.dao.buscar_por_id(patente)
            if vehiculo:
                return {"estado": "ok", "data": vehiculo}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al buscar vehículo: {e}"}

    # Listar todos los vehículos existentes
    def listar_vehiculos(self):
        try:
            vehiculos = self.dao.listar_vehiculos()
            return {"estado": "ok", "data": vehiculos}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al listar vehículos: {e}"}
    
    # Buscar un vehículo por su patente
    def buscar_por_id(self, patente: str):
        # El 'id_valor' ahora es la patente
        try:
            vehiculo = self.dao.buscar_por_id(patente.strip().upper())
            if vehiculo:
                return {"estado": "ok", "data": vehiculo}
            else:
                return {"estado": "error", "mensaje": "Vehículo no encontrado."}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al buscar vehículo: {e}"}

    # Actualizar los datos de un vehículo existente
    def actualizar_vehiculo(self, patente, nuevos_datos):
        try:
            vehiculo = self.dao.buscar_por_id(patente)
            if not vehiculo:
                return {"estado": "error", "mensaje": "Vehículo no encontrado."}

            for clave, valor in nuevos_datos.items():
                if hasattr(vehiculo, clave):
                    if clave == 'anio':
                        valor = int(valor)
                    if clave == 'precio_diario':
                        valor = float(valor)
                    setattr(vehiculo, clave, valor) 

            self.dao.actualizar_vehiculo(vehiculo)
            return {"estado": "ok", "mensaje": "Vehículo actualizado."}
        
        except ValueError as e:
            return {"estado": "error", "mensaje": str(e)}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al actualizar vehículo: {e}"}
        
    # Eliminar un vehículo existente por su patente
    def eliminar_vehiculo(self, patente):
        try:
            vehiculo = self.dao.buscar_por_id(patente)
            if not vehiculo:
                return {"estado": "error", "mensaje": "Vehiculo no encontrado."}
            self.dao.eliminar_vehiculo(patente)
            return {"estado": "ok", "mensaje": "Vehículo eliminado."}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al eliminar vehículo: {e}"}