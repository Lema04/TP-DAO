# servicios/vehiculo_service.py

from Crud.vehiculo_crud import VehiculoCRUD
from clases.vehiculo import Vehiculo

class VehiculoService:
    def __init__(self):
        self.dao = VehiculoCRUD()

    def crear_vehiculo(self, datos):
        """
        datos: dict con claves
        { 'patente', 'marca', 'modelo', 'anio', 'precio_diario', 'estado' }
        """
        try:
            # Aquí se ejecutan las validaciones de @property de Vehiculo
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
            # Captura errores de BD como "UNIQUE constraint failed: VEHICULO.patente"
            return {"estado": "error", "mensaje": f"Error al crear vehículo: {e}"}

    def listar_vehiculos(self):
        try:
            vehiculos = self.dao.listar_vehiculos()
            return {"estado": "ok", "data": vehiculos}
        except Exception as e:
            return {"estado": "error", "mensaje": f"Error al listar vehículos: {e}"}

    def actualizar_vehiculo(self, patente, nuevos_datos):
        try:
            vehiculo = self.dao.buscar_por_id(patente)
            if not vehiculo:
                return {"estado": "error", "mensaje": "Vehículo no encontrado."}

            # Actualizamos datos usando los setters
            for clave, valor in nuevos_datos.items():
                if hasattr(vehiculo, clave):
                    # Convertimos tipos antes de asignar para disparar validadores
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
            
    # (Puedes añadir eliminar_vehiculo y buscar_por_id si los necesitas)