from orm_base import ORMBase
from clases.mantenimiento import Mantenimiento
from Crud.vehiculo_crud import VehiculoCRUD
from datetime import date

class MantenimientoCRUD(ORMBase):
    tabla = "MANTENIMIENTO"
    campos = ["patente", "fecha_inicio", "fecha_fin", "tipo_servicio", "costo", "estado"]
    clave_primaria = "id_mantenimiento"

    def __init__(self):
        super().__init__()
        self.vehiculo_dao = VehiculoCRUD()

    def _build_mantenimiento(self, tupla):
        """
        Método privado para "ensamblar" un objeto Mantenimiento COMPLETO.
        """
        if not tupla:
            return None
        
        try:
            id_mantenimiento = tupla[0]
            patente = tupla[1]
            fecha_inicio = date.fromisoformat(tupla[2])
            fecha_fin = date.fromisoformat(tupla[3])
            tipo_servicio = tupla[4]
            costo = float(tupla[5])
            estado = tupla[6]
            
            vehiculo = self.vehiculo_dao.buscar_por_id(patente)
            if not vehiculo:
                print(f"Error de integridad: No se encontró Vehiculo {patente} para Mantenimiento {id_mantenimiento}")
                return None

            return Mantenimiento(
                id_mantenimiento=id_mantenimiento,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                tipo_servicio=tipo_servicio,
                costo=costo,
                vehiculo=vehiculo,
                estado=estado
            )
        except Exception as e:
            print(f"Error ensamblando Mantenimiento {tupla[0]}: {e}")
            return None

    def crear_mantenimiento(self, mantenimiento: Mantenimiento):
        """
        Usa el método 'insertar' de ORMBase (Heredado).
        """
        valores = [
            mantenimiento.vehiculo.patente,
            mantenimiento.fecha_inicio,
            mantenimiento.fecha_fin,
            mantenimiento.tipo_servicio,
            mantenimiento.costo,
            mantenimiento.estado
        ]
        return self.insertar(valores)

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
        condicion = f"patente = '{patente}'"
        tuplas = self.obtener_por_condicion(condicion)
        return [self._build_mantenimiento(t) for t in tuplas if self._build_mantenimiento(t)]

    def actualizar_mantenimiento(self, mantenimiento: Mantenimiento):
        """ Actualiza un mantenimiento usando ORMBase. """
        valores = [
            mantenimiento.vehiculo.patente,
            mantenimiento.fecha_inicio,
            mantenimiento.fecha_fin,
            mantenimiento.tipo_servicio,
            mantenimiento.costo,
            mantenimiento.estado
        ]
        self.actualizar(mantenimiento.id_mantenimiento, valores)

    def eliminar_mantenimiento(self, id_mantenimiento):
        self.eliminar(id_mantenimiento)

    def buscar_conflictos(self, patente, fecha_inicio, fecha_fin):
        """
        Busca si existe algún mantenimiento para el vehículo (patente)
        que se solape con el rango [fecha_inicio, fecha_fin].
        Retorna una lista de mantenimientos conflictivos (o vacía).
        """
        # Condición de solapamiento:
        # (InicioExistente <= FinNuevo) AND (FinExistente >= InicioNuevo)
        condicion = f"""
            patente = '{patente}' AND
            fecha_inicio <= '{fecha_fin}' AND
            fecha_fin >= '{fecha_inicio}'
        """
        tuplas = self.obtener_por_condicion(condicion)
        return [self._build_mantenimiento(t) for t in tuplas if self._build_mantenimiento(t)]