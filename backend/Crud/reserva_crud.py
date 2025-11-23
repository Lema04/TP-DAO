from orm_base import ORMBase
from clases.reserva import Reserva

from Crud.cliente_crud import ClienteCRUD
from Crud.vehiculo_crud import VehiculoCRUD
from datetime import date

class ReservaCRUD(ORMBase):
    tabla = "RESERVA"
    campos = ["patente", "id_cliente", "fecha_reserva", 
              "fecha_inicio_deseada", "fecha_fin_deseada", "estado"]
    clave_primaria = "id_reserva"

    def __init__(self):
        super().__init__()
        self.cliente_dao = ClienteCRUD()
        self.vehiculo_dao = VehiculoCRUD()

    def _build_reserva(self, tupla):
        """
        Método privado para "ensamblar" un objeto Reserva COMPLETO.
        """
        if not tupla:
            return None
        
        try:
            id_reserva = tupla[0]
            patente = tupla[1]
            id_cliente = tupla[2]
            fecha_reserva = date.fromisoformat(tupla[3])
            fecha_inicio = date.fromisoformat(tupla[4])
            fecha_fin = date.fromisoformat(tupla[5])
            estado = tupla[6]

            cliente = self.cliente_dao.buscar_por_id(id_cliente)
            if not cliente:
                print(f"Error de integridad: No se encontró Cliente {id_cliente} para Reserva {id_reserva}")
                return None

            vehiculo = None
            if patente:
                vehiculo = self.vehiculo_dao.buscar_por_id(patente)
                if not vehiculo:
                     print(f"Advertencia: No se encontró Vehiculo {patente} para Reserva {id_reserva}")

            return Reserva(
                id_reserva=id_reserva,
                fecha_reserva=fecha_reserva,
                fecha_inicio_deseada=fecha_inicio,
                fecha_fin_deseada=fecha_fin,
                cliente=cliente,
                vehiculo=vehiculo,
                estado=estado
            )
        except Exception as e:
            print(f"Error ensamblando Reserva {tupla[0]}: {e}")
            return None

    def crear_reserva(self, reserva: Reserva):
        valores = [
            reserva.vehiculo.patente if reserva.vehiculo else None,
            reserva.cliente.id_cliente,
            reserva.fecha_reserva,
            reserva.fecha_inicio_deseada,
            reserva.fecha_fin_deseada,
            reserva.estado
        ]
        return self.insertar(valores)
    
    def listar_reservas(self):
        """ Retorna una LISTA DE OBJETOS Reserva. """
        tuplas = self.obtener_todos()
        return [self._build_reserva(t) for t in tuplas if self._build_reserva(t)]

    def buscar_por_id(self, id_reserva):
        """ Retorna UN OBJETO Reserva o None. """
        tupla = self.obtener_por_id(id_reserva)
        return self._build_reserva(tupla)
    
    def buscar_por_cliente(self, id_cliente):
        """ Retorna una LISTA DE OBJETOS Reserva. """
        condicion = f"id_cliente = {id_cliente}"
        tuplas = self.obtener_por_condicion(condicion)
        return [self._build_reserva(t) for t in tuplas if self._build_reserva(t)]
    
    def actualizar_reserva(self, reserva: Reserva):
        valores = [
            reserva.vehiculo.patente if reserva.vehiculo else None,
            reserva.cliente.id_cliente,
            reserva.fecha_reserva,
            reserva.fecha_inicio_deseada,
            reserva.fecha_fin_deseada,
            reserva.estado
        ]
        self.actualizar(reserva.id_reserva, valores)

    def eliminar_reserva(self, id_reserva):
        self.eliminar(id_reserva)
    
    def buscar_por_vehiculo(self, patente):
        """ Retorna una LISTA DE OBJETOS Reserva para un vehículo. """
        condicion = f"patente = '{patente}'"
        tuplas = self.obtener_por_condicion(condicion)
        return [self._build_reserva(t) for t in tuplas if self._build_reserva(t)]
    
    def buscar_pendientes_para_conversion(self):
        """ Retorna reservas pendientes donde fecha_inicio <= hoy. """
        hoy = date.today().isoformat()
        condicion = f"estado = 'Pendiente' AND fecha_inicio_deseada <= '{hoy}'"
        tuplas = self.obtener_por_condicion(condicion)
        return [self._build_reserva(t) for t in tuplas if self._build_reserva(t)]

    def buscar_conflictos(self, patente, fecha_inicio, fecha_fin):
        """
        Busca reservas activas (Pendiente, Confirmada) que se solapen con el rango dado.
        Retorna una lista de reservas conflictivas.
        """
        
        condicion = f"""
            patente = '{patente}' AND
            estado IN ('Pendiente', 'Confirmada') AND
            fecha_inicio_deseada <= '{fecha_fin}' AND
            fecha_fin_deseada >= '{fecha_inicio}'
        """
        tuplas = self.obtener_por_condicion(condicion)
        return [self._build_reserva(t) for t in tuplas if self._build_reserva(t)]