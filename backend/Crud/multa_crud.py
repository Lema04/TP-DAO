from servicios.orm_base import ORMBase
from clases.multa import MultaDano

class MultaCRUD(ORMBase):
    tabla = "MULTA_DANO"
    campos = ["id_alquiler", "descripcion", "monto", "fecha_incidente"]
    clave_primaria = "id_multa"

    def __init__(self):
        super().__init__()

    # Crear una nueva multa por daño
    def crear_multa(self, multa: MultaDano):
        valores = [
            multa.alquiler.id_alquiler,
            multa.descripcion,
            multa.monto,
            multa.fecha_incidente
        ]
        return self.insertar(valores)
    
    # Buscar multas por daño existentes por el ID de un cliente
    def buscar_por_id_cliente(self, id_cliente: int):
        sql = f"""
            SELECT m.{self.clave_primaria}, m.id_alquiler, m.descripcion, 
                   m.monto, m.fecha_incidente
            FROM {self.tabla} m
            JOIN ALQUILER a ON m.id_alquiler = a.id_alquiler
            WHERE a.id_cliente = ?
        """
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, (id_cliente,))
            filas = cursor.fetchall()
            multas = []
            for fila in filas:
                multas.append(MultaDano(*fila))
            return multas
    
    # Buscar multas por daño existentes por la patente de un vehículo
    def buscar_por_patente(self, patente: str):
        sql = f"""
            SELECT m.{self.clave_primaria}, m.id_alquiler, m.descripcion, 
                   m.monto, m.fecha_incidente
            FROM {self.tabla} m
            JOIN ALQUILER a ON m.id_alquiler = a.id_alquiler
            WHERE a.patente = ?
        """
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, (patente,))
            filas = cursor.fetchall()
            multas = []
            for fila in filas:
                multas.append(MultaDano(*fila))
            return multas