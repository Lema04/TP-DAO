from orm_base import ORMBase
from clases.multa import MultaDano
from Crud.alquiler_crud import AlquilerCRUD
from datetime import date

class MultaCRUD(ORMBase):
    tabla = "MULTA_DANO"
    campos = ["id_alquiler", "descripcion", "monto", "fecha_incidente"]
    clave_primaria = "id_multa"

    def __init__(self):
        super().__init__()
        self.alquiler_dao = AlquilerCRUD()

    def _build_multa(self, tupla):
        """
        Método privado para "ensamblar" un objeto MultaDano COMPLETO.
        """
        if not tupla:
            return None
        
        try:
            id_multa = tupla[0]
            id_alquiler = tupla[1]
            descripcion = tupla[2]
            monto = float(tupla[3])
            fecha_incidente = date.fromisoformat(tupla[4])
            
            alquiler_obj = self.alquiler_dao.buscar_por_id(id_alquiler)
            
            if not alquiler_obj:
                print(f"Error de integridad: No se encontró Alquiler {id_alquiler} para Multa {id_multa}")
                return None

            return MultaDano(
                id_multa=id_multa,
                descripcion=descripcion,
                monto=monto,
                fecha_incidente=fecha_incidente,
                alquiler=alquiler_obj
            )
        except Exception as e:
            print(f"Error ensamblando Multa {tupla[0]}: {e}")
            return None

    def crear_multa(self, multa: MultaDano):
        valores = [
            multa.alquiler.id_alquiler,
            multa.descripcion,
            multa.monto,
            multa.fecha_incidente
        ]
        return self.insertar(valores)
    
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
            return [self._build_multa(t) for t in tuplas if self._build_multa(t)]
    
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
            return [self._build_multa(t) for t in tuplas if self._build_multa(t)]
    
    def buscar_por_id(self, id_multa: int):
        """ Retorna UN OBJETO MultaDano o None. """
        tupla = self.obtener_por_id(id_multa)
        return self._build_multa(tupla)
    
    def actualizar_multa(self, multa: MultaDano):
        valores = [
            multa.alquiler.id_alquiler,
            multa.descripcion,
            multa.monto,
            multa.fecha_incidente
        ]
        self.actualizar(multa.id_multa, valores)

    def eliminar_multa(self, id_multa: int):
        self.eliminar(id_multa)