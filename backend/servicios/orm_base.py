from .conexion import ConexionDB

class ORMBase:
    tabla = None
    campos = []
    clave_primaria = "id"

    def __init__(self):
        self.conexion = ConexionDB()

    def insertar(self, valores):
        placeholders = ",".join(["?"] * len(valores))
        sql = f"INSERT INTO {self.tabla} ({','.join(self.campos)}) VALUES ({placeholders})"
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, valores)
            conn.commit()
            return cursor.lastrowid

    def obtener_todos(self):
        sql = f"SELECT {self.clave_primaria}, {', '.join(self.campos)} FROM {self.tabla}"
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql)
            return cursor.fetchall()

    def obtener_por_id(self, id_valor):
        sql = f"SELECT {self.clave_primaria}, {', '.join(self.campos)} FROM {self.tabla} WHERE {self.clave_primaria} = ?"
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, (id_valor,))
            return cursor.fetchone()

    def obtener_por_condicion(self, condicion):
        sql = f"SELECT {self.clave_primaria}, {', '.join(self.campos)} FROM {self.tabla} WHERE {condicion}"
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql)
            return cursor.fetchall()

    def actualizar(self, id_valor, valores):
        asignaciones = ", ".join([f"{campo}=?" for campo in self.campos])
        sql = f"UPDATE {self.tabla} SET {asignaciones} WHERE {self.clave_primaria} = ?"
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, (*valores, id_valor))
            conn.commit()

    def eliminar(self, id_valor):
        sql = f"DELETE FROM {self.tabla} WHERE {self.clave_primaria} = ?"
        with self.conexion.conectar() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, (id_valor,))
            conn.commit()
