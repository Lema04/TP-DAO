# --- Archivo: Crud/mantenimiento_crud.py ---

from orm_base import ORMBase
from clases.mantenimiento import Mantenimiento
from Crud.vehiculo_crud import VehiculoCRUD # Necesitamos la "fábrica" de Vehiculos
from datetime import date

class MantenimientoCRUD(ORMBase):
    tabla = "MANTENIMIENTO"
    campos = ["patente", "fecha_inicio", "fecha_fin", "tipo_servicio", "costo"]
    clave_primaria = "id_mantenimiento"

    def __init__(self):
        super().__init__()
        # El DAO de Mantenimiento necesita el DAO de Vehiculo para "ensamblar"
        self.vehiculo_dao = VehiculoCRUD()

    # --- ¡MEJOR PRÁCTICA: El Ensamblador! ---
    def _build_mantenimiento(self, tupla):
        """
        Método privado para "ensamblar" un objeto Mantenimiento COMPLETO.
        """
        if not tupla:
            return None
        
        try:
            # 1. El ORMBase devuelve (pk, campo1, campo2, ...)
            # (id_mantenimiento, patente, fecha_inicio_str, fecha_fin_str, tipo, costo)
            id_mantenimiento = tupla[0]
            patente = tupla[1]
            fecha_inicio = date.fromisoformat(tupla[2]) # Convertimos str a date
            fecha_fin = date.fromisoformat(tupla[3]) # Convertimos str a date
            tipo_servicio = tupla[4]
            costo = float(tupla[5]) # Convertimos a float
            
            # 2. Ensamblamos la parte "Vehiculo"
            vehiculo = self.vehiculo_dao.buscar_por_id(patente)
            if not vehiculo:
                # El vehículo fue borrado, es un dato huérfano
                print(f"Error de integridad: No se encontró Vehiculo {patente} para Mantenimiento {id_mantenimiento}")
                return None

            # 3. Ensamblamos el Mantenimiento
            return Mantenimiento(
                id_mantenimiento=id_mantenimiento,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                tipo_servicio=tipo_servicio,
                costo=costo,
                vehiculo=vehiculo # Pasamos el objeto Vehiculo completo
            )
        except Exception as e:
            print(f"Error ensamblando Mantenimiento {tupla[0]}: {e}")
            return None
    # -----------------------------------------------

    def crear_mantenimiento(self, mantenimiento: Mantenimiento):
        """
        Usa el método 'insertar' de ORMBase (Heredado).
        """
        valores = [
            mantenimiento.vehiculo.patente, # Extraemos la FK del objeto
            mantenimiento.fecha_inicio,
            mantenimiento.fecha_fin,
            mantenimiento.tipo_servicio,
            mantenimiento.costo
        ]
        # self.insertar (de ORMBase) debe devolver el nuevo ID
        return self.insertar(valores)

    # --- ¡MÉTODOS FALTANTES AÑADIDOS Y ARREGLADOS! ---

    def listar_mantenimientos(self):
        """ Retorna una LISTA DE OBJETOS Mantenimiento. """
        tuplas = self.obtener_todos()
        return [self._build_mantenimiento(t) for t in tuplas if self._build_mantenimiento(t)]

    def buscar_por_id(self, id_mantenimiento):
        """ Retorna UN OBJETO Mantenimiento o None. """
        tupla = self.obtener_por_id(id_mantenimiento)
        return self._build_mantenimiento(tupla)
    
    def buscar_por_patente(self, patente):
        """ Retorna una LISTA de Mantenimientos para un vehículo. """
        condicion = f"patente = '{patente}'" # Cuidado con la Inyección SQL si no confías en la patente
        tuplas = self.obtener_por_condicion(condicion)
        return [self._build_mantenimiento(t) for t in tuplas if self._build_mantenimiento(t)]

    def actualizar_mantenimiento(self, mantenimiento: Mantenimiento):
        """ Actualiza un mantenimiento usando ORMBase. """
        valores = [
            mantenimiento.vehiculo.patente,
            mantenimiento.fecha_inicio,
            mantenimiento.fecha_fin,
            mantenimiento.tipo_servicio,
            mantenimiento.costo
        ]
        self.actualizar(mantenimiento.id_mantenimiento, valores)

    def eliminar_mantenimiento(self, id_mantenimiento):
        self.eliminar(id_mantenimiento)