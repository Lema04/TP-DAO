-- Database Schema Migration for Reservation/Rental State Management
-- Execute these statements in your SQLite database

-- 1. Add 'estado' column to RESERVA table
-- Values: 'Pendiente', 'Confirmada', 'Cancelada', 'Convertida'
ALTER TABLE RESERVA ADD COLUMN estado TEXT DEFAULT 'Pendiente';

-- 2. Add 'estado' column to ALQUILER table
-- Values: 'Activo', 'Finalizado', 'Cancelado'
ALTER TABLE ALQUILER ADD COLUMN estado TEXT DEFAULT 'Activo';

-- 3. Add 'id_reserva' foreign key column to ALQUILER table
-- Links alquiler back to the reservation it was created from (optional/nullable)
ALTER TABLE ALQUILER ADD COLUMN id_reserva INTEGER REFERENCES RESERVA(id_reserva);

-- 4. Optional: Update existing records to have proper estados
-- Update existing reservations to 'Pendiente' (they are already set by DEFAULT)
-- UPDATE RESERVA SET estado = 'Pendiente' WHERE estado IS NULL;

-- Update existing alquileres to 'Activo' (they are already set by DEFAULT)
-- UPDATE ALQUILER SET estado = 'Activo' WHERE estado IS NULL;

-- 5. Optional: Migrate vehicle estados if needed
-- If you have vehicles with 'No disponible' that should be 'Alquilado' or 'Reservado'
-- You may need to manually check and update these based on business logic
-- Example:
-- UPDATE VEHICULO SET estado = 'Disponible' WHERE estado = 'No disponible';
