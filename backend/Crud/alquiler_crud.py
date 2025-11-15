# --- Archivo: Crud/alquiler_crud.py ---

from orm_base import ORMBase
from clases.alquiler import Alquiler

# --- ¡CAMBIO 1: Importar las otras "fábricas" (CRUDs)! ---
# El AlquilerCRUD necesita los otros DAOs para "ensamblar" sus partes.
from Crud.cliente_crud import ClienteCRUD
from Crud.empleado_crud import EmpleadoCRUD
from Crud.vehiculo_crud import VehiculoCRUD
from datetime import date

class AlquilerCRUD(ORMBase):
    tabla = "ALQUILER"
    campos = ["fecha_inicio", "fecha_fin", "costo_total", "fecha_registro", 
              "id_empleado", "patente", "id_cliente"]
    clave_primaria = "id_alquiler"

    def __init__(self):
        super().__init__()
        # --- ¡CAMBIO 2: Crear instancias de los otros DAOs! ---
        # Los usaremos para "hidratar" (ensamblar) los objetos Cliente, Empleado y Vehiculo.
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
            # 1. Extraer los datos simples y las claves foráneas
            id_alquiler = tupla[0]
            
            # --- ¡PASO 2: EL ARREGLO ESTÁ AQUÍ! ---
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

            # 3. Usamos los otros DAOs para obtener los OBJETOS completos
            cliente = self.cliente_dao.buscar_por_id(id_cliente)
            empleado = self.empleado_dao.buscar_por_id(id_empleado)
            # (Asegúrate que tu VehiculoCRUD.buscar_por_id acepte una 'patente' o ajústalo)
            vehiculo = self.vehiculo_dao.buscar_por_id(patente) 

            if not cliente or not empleado or not vehiculo:
                print(f"Error de integridad de datos en Alquiler ID: {id_alquiler}. Objeto no ensamblado.")
                return None

            # 4. Ensamblar y devolver el objeto Alquiler con los tipos correctos
            return Alquiler(
                id_alquiler=id_alquiler,
                fecha_inicio=fecha_inicio,   # <-- Ahora es un objeto `date`
                fecha_fin=fecha_fin,         # <-- Ahora es un objeto `date`
                costo_total=costo_total,
                fecha_registro=fecha_registro, # <-- Ahora es un objeto `date`
                empleado=empleado, 
                vehiculo=vehiculo,  
                cliente=cliente     
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
        # (Tu código aquí está perfecto, ya extrae los IDs para insertar)
        valores = [
            alquiler.fecha_inicio,
            alquiler.fecha_fin,
            alquiler.costo_total,
            alquiler.fecha_registro,
            alquiler.empleado.id_empleado,
            alquiler.vehiculo.patente,
            alquiler.cliente.id_cliente
        ]
        return self.insertar(valores)

    # --- ¡ARREGLADO! ---
    def listar_alquileres(self):
        """ Retorna una LISTA DE OBJETOS Alquiler. """
        tuplas = self.obtener_todos()
        # Usamos list comprehension y el ensamblador
        return [self._build_alquiler(t) for t in tuplas if self._build_alquiler(t)]

    # --- ¡ARREGLADO! ---
    def buscar_por_id(self, id_alquiler):
        """ Retorna UN OBJETO Alquiler o None. """
        tupla = self.obtener_por_id(id_alquiler)
        return self._build_alquiler(tupla)

    # --- ¡ARREGLADO! ---
    def buscar_por_cliente(self, id_cliente):
        """ Retorna una LISTA DE OBJETOS Alquiler. """
        condicion = f"id_cliente = {id_cliente}"
        tuplas = self.obtener_por_condicion(condicion)
        return [self._build_alquiler(t) for t in tuplas if self._build_alquiler(t)]
    
# --- Archivo: Crud/alquiler_crud.py (¡CORREGIDO!) ---

# ... (imports y __init__) ...

    def actualizar_alquiler(self, alquiler: Alquiler):
        # ¡CORRECTO! Esta lista debe tener 7 valores,
        # en el mismo orden que self.campos.
        valores = [
            alquiler.fecha_inicio,
            alquiler.fecha_fin,
            alquiler.costo_total,
            alquiler.fecha_registro,
            alquiler.empleado.id_empleado,
            alquiler.vehiculo.patente,
            alquiler.cliente.id_cliente
        ]
        
        # Ahora pasas 7 valores + 1 id = 8 bindings.
        # Esto coincide con los 8 '?' del SQL.
        self.actualizar(alquiler.id_alquiler, valores)

    def eliminar_alquiler(self, id_alquiler):
        # (Tu código aquí está perfecto)
        self.eliminar(id_alquiler)