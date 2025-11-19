# --- Archivo: Crud/alquiler_crud.py ---

from orm_base import ORMBase
from clases.alquiler import Alquiler

# --- CAMBIO 1: Importar las otras "fábricas" (CRUDs)! ---
# El AlquilerCRUD necesita los otros DAOs para "ensamblar" sus partes.
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
        # --- CAMBIO 2: Crear instancias de los otros DAOs! ---
        # Los usaremos para "hidratar" (ensamblar) los objetos Cliente, Empleado y Vehiculo.
        self.cliente_dao = ClienteCRUD()
        self.empleado_dao = EmpleadoCRUD()
        self.vehiculo_dao = VehiculoCRUD()

    # --- CAMBIO 3: El Método Ensamblador (MEJOR PRÁCTICA)! ---
    def _build_alquiler(self, tupla):
        """
        Método privado para "ensamblar" un objeto Alquiler COMPLETO
        a partir de una tupla de la BDD.
        """
        if not tupla:
            return None
        
        try:
            # 1. Extraer los datos simples y las claves foráneas
            id_alquiler = tupla[0]
            
            # --- PASO 2: EL ARREGLO ESTÁ AQUÍ! ---
            # La BDD nos da strings (ej: "2025-11-15").
            # Debemos convertirlos a objetos `date`.
            fecha_inicio_str = tupla[1]
            fecha_fin_str = tupla[2]
            costo_total = tupla[3]
            fecha_registro_str = tupla[4]
            
            fecha_inicio = date.fromisoformat(fecha_inicio_str)
            fecha_fin = date.fromisoformat(fecha_fin_str)
            fecha_registro = date.fromisoformat(fecha_registro_str)
            # ----------------------------------------

            id_empleado = tupla[5]
            patente = tupla[6]
            id_cliente = tupla[7]
            estado = tupla[8] if len(tupla) > 8 else "Activo"  # Handle old records
            id_reserva = tupla[9] if len(tupla) > 9 else None

            # 3. Usamos los otros DAOs para obtener los OBJETOS completos
            cliente = self.cliente_dao.buscar_por_id(id_cliente)
            empleado = self.empleado_dao.buscar_por_id(id_empleado)
            vehiculo = self.vehiculo_dao.buscar_por_id(patente) 

            if not cliente or not empleado or not vehiculo:
                print(f"Error de integridad de datos en Alquiler ID: {id_alquiler}. Objeto no ensamblado.")
                return None

            # 4. Ensamblar y devolver el objeto Alquiler con los tipos correctos
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
            # Captura errores si el formato de fecha en la BDD es incorrecto
            print(f"Error al convertir tipos en _build_alquiler: {e}")
            return None
        except Exception as e:
            print(f"Error ensamblando alquiler: {e}")
            return None
    # -----------------------------------------------

    def crear_alquiler(self, alquiler: Alquiler):
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