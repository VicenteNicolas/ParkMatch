-- Usar la base de datos correcta
USE parkmatch_db;

-- 1. Crear un usuario de prueba con el rol 'Propietario'
INSERT INTO Usuario (nombre, email, password, rut, telefono, tipo_usuario) 
VALUES (
  'Propietario Demo', 
  'propietario@parkmatch.cl', 
  'hash_temporal_123', 
  '19000000-0', 
  '940000000', 
  'Propietario'
);

-- Guardar el ID de este nuevo usuario en una variable temporal
SET @id_prop = LAST_INSERT_ID();

-- 2. Insertar los estacionamientos del diseño de Figma vinculados a este propietario
INSERT INTO Estacionamiento (id_propietario, direccion, latitud, longitud, precio_hora, descripcion, disponibilidad) 
VALUES 
(@id_prop, 'Cerro Alegre, Valparaíso', -33.0422, -71.6271, 3000, 'Garage Privado Cerro Alegre', 1),
(@id_prop, 'Bellavista, Valparaíso', -33.0440, -71.6230, 2500, 'Cupo Residencial Bellavista', 1),
(@id_prop, 'Playa Ancha, Valparaíso', -33.0290, -71.6350, 2800, 'Patio Seguro Playa Ancha', 1),
(@id_prop, 'Av. Argentina, Valparaíso', -33.0480, -71.6100, 2600, 'Espacio Convenio Av. Argentina', 1);