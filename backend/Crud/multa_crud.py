# --- Archivo: Crud/multa_crud.py ---

from orm_base import ORMBase
from clases.multa import MultaDano
from Crud.alquiler_crud import AlquilerCRUD # ¡Necesitamos la fábrica de Alquileres!
from datetime import date

class MultaCRUD(ORMBase):
    tabla = "MULTA_DANO"
    campos = ["id_alquiler", "descripcion", "monto", "fecha_incidente"]
    clave_primaria = "id_multa"

    def __init__(self):
        super().__init__()
        # El DAO de Multa necesita el DAO de Alquiler para "ensamblar"
        self.alquiler_dao = AlquilerCRUD() # Asumimos que AlquilerCRUD ya fue refactorizado

    # --- ¡MEJOR PRÁCTICA: El Ensamblador! ---
    def _build_multa(self, tupla):
        """
        Método privado para "ensamblar" un objeto MultaDano COMPLETO.
        """
        if not tupla:
            return None
        
        try:
            # 1. El ORMBase devuelve (pk, campo1, campo2, ...)
            # (id_multa, id_alquiler, descripcion, monto, fecha_incidente_str)
            id_multa = tupla[0]
            id_alquiler = tupla[1]
            descripcion = tupla[2]
            monto = float(tupla[3]) # Convertimos
            fecha_incidente = date.fromisoformat(tupla[4]) # Convertimos str a date
            
            # 2. Ensamblamos la parte "Alquiler"
            # ¡Usamos el DAO de Alquiler, que ya sabe cómo construir un objeto Alquiler!
            alquiler_obj = self.alquiler_dao.buscar_por_id(id_alquiler)
            
            if not alquiler_obj:
                print(f"Error de integridad: No se encontró Alquiler {id_alquiler} para Multa {id_multa}")
                return None

            # 3. Ensamblamos la Multa
            return MultaDano(
                id_multa=id_multa,
                descripcion=descripcion,
                monto=monto,
                fecha_incidente=fecha_incidente,
                alquiler=alquiler_obj # Pasamos el objeto completo
            )
        except Exception as e:
            print(f"Error ensamblando Multa {tupla[0]}: {e}")
            return None
    # -----------------------------------------------

    def crear_multa(self, multa: MultaDano):
        # (Tu código está perfecto)
        valores = [
            multa.alquiler.id_alquiler,
            multa.descripcion,
            multa.monto,
            multa.fecha_incidente
        ]
        return self.insertar(valores)
    
    # --- ¡ARREGLADO! ---
    def buscar_por_id_cliente(self, id_cliente: int):
        """ Retorna una LISTA DE OBJETOS MultaDano. """
        sql = f"""
            SELECT m.{self.clave_primaria}, {', '.join(['m.'+c for c in self.campos])}
            FROM {self.tabla} m
            JOIN ALQUILER a ON m.id_alquiler = a.id_alquiler
            WHERE a.id_cliente = ?
        """
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, (id_cliente,))
            tuplas = cursor.fetchall()
            # Usamos el ensamblador
            return [self._build_multa(t) for t in tuplas if self._build_multa(t)]
    
    # --- ¡ARREGLADO! ---
    def buscar_por_patente(self, patente: str):
        """ Retorna una LISTA DE OBJETOS MultaDano. """
        sql = f"""
            SELECT m.{self.clave_primaria}, {', '.join(['m.'+c for c in self.campos])}
            FROM {self.tabla} m
            JOIN ALQUILER a ON m.id_alquiler = a.id_alquiler
            WHERE a.patente = ?
        """
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, (patente,))
            tuplas = cursor.fetchall()
            # Usamos el ensamblador
            return [self._build_multa(t) for t in tuplas if self._build_multa(t)]
    
    # --- ¡ARREGLADO! ---
    def buscar_por_id(self, id_multa: int):
        """ Retorna UN OBJETO MultaDano o None. """
        tupla = self.obtener_por_id(id_multa)
        return self._build_multa(tupla)
    
    def actualizar_multa(self, multa: MultaDano):
        # (Tu código está perfecto)
        valores = [
            multa.alquiler.id_alquiler,
            multa.descripcion,
            multa.monto,
            multa.fecha_incidente
        ]
        self.actualizar(multa.id_multa, valores)

    def eliminar_multa(self, id_multa: int):
        # (Tu código está perfecto)
        self.eliminar(id_multa)