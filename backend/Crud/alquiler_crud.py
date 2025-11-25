from orm_base import ORMBase
from clases.alquiler import Alquiler

from Crud.cliente_crud import ClienteCRUD
from Crud.empleado_crud import EmpleadoCRUD
from Crud.vehiculo_crud import VehiculoCRUD
from datetime import date

class AlquilerCRUD(ORMBase):
    tabla = "ALQUILER"
    campos = ["fecha_inicio", "fecha_fin", "costo_total", "fecha_registro", 
              "id_empleado", "patente", "id_cliente", "estado", "id_reserva"]
    clave_primaria = "id_alquiler"

    def __init__(self):
        super().__init__()
        self.cliente_dao = ClienteCRUD()
        self.empleado_dao = EmpleadoCRUD()
        self.vehiculo_dao = VehiculoCRUD()

    # --- ¡CAMBIO 3: El Método Ensamblador (MEJOR PRÁCTICA)! ---
    def _build_alquiler(self, tupla):
        """
        Método privado para "ensamblar" un objeto Alquiler COMPLETO
        a partir de una tupla de la BDD.
        """
        if not tupla:
            return None
        
        try:
            id_alquiler = tupla[0]
            fecha_inicio_str = tupla[1]
            fecha_fin_str = tupla[2]
            costo_total = tupla[3]
            fecha_registro_str = tupla[4]
            
            fecha_inicio = date.fromisoformat(fecha_inicio_str)
            fecha_fin = date.fromisoformat(fecha_fin_str)
            fecha_registro = date.fromisoformat(fecha_registro_str)

            id_empleado = tupla[5]
            patente = tupla[6]
            id_cliente = tupla[7]
            estado = tupla[8] if len(tupla) > 8 else "Activo"
            id_reserva = tupla[9] if len(tupla) > 9 else None

            cliente = self.cliente_dao.buscar_por_id(id_cliente)
            empleado = self.empleado_dao.buscar_por_id(id_empleado)
            vehiculo = self.vehiculo_dao.buscar_por_id(patente) 

            if not cliente or not empleado or not vehiculo:
                print(f"Error de integridad de datos en Alquiler ID: {id_alquiler}. Objeto no ensamblado.")
                return None
            
            return Alquiler(
                id_alquiler=id_alquiler,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                costo_total=costo_total,
                fecha_registro=fecha_registro,
                empleado=empleado, 
                vehiculo=vehiculo,  
                cliente=cliente,
                id_reserva=id_reserva,
                estado=estado     
            )
        except (ValueError, TypeError) as e:
            print(f"Error al convertir tipos en _build_alquiler: {e}")
            return None
        except Exception as e:
            print(f"Error ensamblando alquiler: {e}")
            return None

    def crear_alquiler(self, alquiler: Alquiler):
        # (Tu código aquí está perfecto, ya extrae los IDs para insertar)
        valores = [
            alquiler.fecha_inicio,
            alquiler.fecha_fin,
            alquiler.costo_total,
            alquiler.fecha_registro,
            alquiler.empleado.id_empleado,
            alquiler.vehiculo.patente,
            alquiler.cliente.id_cliente,
            alquiler.estado,
            alquiler.id_reserva
        ]
        return self.insertar(valores)

    def listar_alquileres(self):
        """ Retorna una LISTA DE OBJETOS Alquiler. """
        tuplas = self.obtener_todos()
        return [self._build_alquiler(t) for t in tuplas if self._build_alquiler(t)]

    def buscar_por_id(self, id_alquiler):
        """ Retorna UN OBJETO Alquiler o None. """
        tupla = self.obtener_por_id(id_alquiler)
        return self._build_alquiler(tupla)

    def buscar_por_cliente(self, id_cliente):
        """ Retorna una LISTA DE OBJETOS Alquiler. """
        condicion = f"id_cliente = {id_cliente}"
        tuplas = self.obtener_por_condicion(condicion)
        return [self._build_alquiler(t) for t in tuplas if self._build_alquiler(t)]
    
    def actualizar_alquiler(self, alquiler: Alquiler):
        valores = [
            alquiler.fecha_inicio,
            alquiler.fecha_fin,
            alquiler.costo_total,
            alquiler.fecha_registro,
            alquiler.empleado.id_empleado,
            alquiler.vehiculo.patente,
            alquiler.cliente.id_cliente,
            alquiler.estado,
            alquiler.id_reserva
        ]
        self.actualizar(alquiler.id_alquiler, valores)

    def eliminar_alquiler(self, id_alquiler):
        self.eliminar(id_alquiler)
    
    def buscar_conflictos(self, patente, fecha_inicio, fecha_fin):
        """
        Busca alquileres activos que se solapen con el rango dado.
        Retorna una lista de alquileres conflictivos.
        """        
        condicion = f"""
            patente = '{patente}' AND
            estado = 'Activo' AND
            fecha_inicio <= '{fecha_fin}' AND
            fecha_fin >= '{fecha_inicio}'
        """
        tuplas = self.obtener_por_condicion(condicion)
        return [self._build_alquiler(t) for t in tuplas if self._build_alquiler(t)]
    
    def obtener_anios_con_alquileres(self):
        """
        Retorna una lista de años (strings) donde existen alquileres registrados.
        Ejemplo: ['2025', '2024', '2023']
        """
        sql = "SELECT DISTINCT strftime('%Y', fecha_inicio) FROM ALQUILER ORDER BY 1 DESC"
        
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql)
            return [row[0] for row in cursor.fetchall() if row[0]]