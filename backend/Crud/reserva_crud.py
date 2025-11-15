# --- Archivo: Crud/reserva_crud.py ---

from orm_base import ORMBase
from clases.reserva import Reserva
# ¡Necesitamos las "fábricas" de Cliente y Vehiculo!
from Crud.cliente_crud import ClienteCRUD
from Crud.vehiculo_crud import VehiculoCRUD
from datetime import date

class ReservaCRUD(ORMBase):
    tabla = "RESERVA"
    campos = ["patente", "id_cliente", "fecha_reserva", 
              "fecha_inicio_deseada", "fecha_fin_deseada"]
    clave_primaria = "id_reserva"

    def __init__(self):
        super().__init__()
        # El DAO de Reserva necesita los otros DAOs para "ensamblar"
        self.cliente_dao = ClienteCRUD()
        self.vehiculo_dao = VehiculoCRUD()

    # --- ¡MEJOR PRÁCTICA: El Ensamblador! ---
    def _build_reserva(self, tupla):
        """
        Método privado para "ensamblar" un objeto Reserva COMPLETO.
        """
        if not tupla:
            return None
        
        try:
            # 1. El ORMBase devuelve (pk, campo1, campo2, ...)
            # (id_reserva, patente, id_cliente, fecha_reserva_str, fecha_inicio_str, fecha_fin_str)
            id_reserva = tupla[0]
            patente = tupla[1]      # Puede ser None
            id_cliente = tupla[2]
            fecha_reserva = date.fromisoformat(tupla[3])
            fecha_inicio = date.fromisoformat(tupla[4])
            fecha_fin = date.fromisoformat(tupla[5])
            
            # 2. Ensamblamos el Cliente (obligatorio)
            cliente = self.cliente_dao.buscar_por_id(id_cliente)
            if not cliente:
                print(f"Error de integridad: No se encontró Cliente {id_cliente} para Reserva {id_reserva}")
                return None

            # 3. Ensamblamos el Vehiculo (opcional)
            vehiculo = None
            if patente:
                vehiculo = self.vehiculo_dao.buscar_por_id(patente)
                # No es un error de integridad si el vehículo es None,
                # pero sí lo es si la patente existe y el vehículo fue borrado.
                if not vehiculo:
                     print(f"Advertencia: No se encontró Vehiculo {patente} para Reserva {id_reserva}")

            # 4. Ensamblamos la Reserva
            return Reserva(
                id_reserva=id_reserva,
                fecha_reserva=fecha_reserva,
                fecha_inicio_deseada=fecha_inicio,
                fecha_fin_deseada=fecha_fin,
                cliente=cliente,  # Pasamos el objeto Cliente
                vehiculo=vehiculo # Pasamos el objeto Vehiculo (o None)
            )
        except Exception as e:
            print(f"Error ensamblando Reserva {tupla[0]}: {e}")
            return None
    # -----------------------------------------------

    def crear_reserva(self, reserva: Reserva):
        # (Tu código está perfecto)
        valores = [
            reserva.vehiculo.patente if reserva.vehiculo else None,
            reserva.cliente.id_cliente,
            reserva.fecha_reserva,
            reserva.fecha_inicio_deseada,
            reserva.fecha_fin_deseada
        ]
        return self.insertar(valores)
    
    # --- ¡ARREGLADO! ---
    def listar_reservas(self):
        """ Retorna una LISTA DE OBJETOS Reserva. """
        tuplas = self.obtener_todos()
        return [self._build_reserva(t) for t in tuplas if self._build_reserva(t)]

    # --- ¡ARREGLADO! ---
    def buscar_por_id(self, id_reserva):
        """ Retorna UN OBJETO Reserva o None. """
        tupla = self.obtener_por_id(id_reserva)
        return self._build_reserva(tupla)
    
    # --- ¡ARREGLADO! ---
    def buscar_por_cliente(self, id_cliente):
        """ Retorna una LISTA DE OBJETOS Reserva. """
        condicion = f"id_cliente = {id_cliente}"
        tuplas = self.obtener_por_condicion(condicion)
        return [self._build_reserva(t) for t in tuplas if self._build_reserva(t)]
    
    def actualizar_reserva(self, reserva: Reserva):
        # (Tu código está perfecto)
        valores = [
            reserva.vehiculo.patente if reserva.vehiculo else None,
            # ... (etc) ...
            reserva.fecha_fin_deseada
        ]
        self.actualizar(reserva.id_reserva, valores)

    def eliminar_reserva(self, id_reserva):
        # (Tu código está perfecto)
        self.eliminar(id_reserva)