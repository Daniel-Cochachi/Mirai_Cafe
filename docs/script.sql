-- Base de datos del sistema Mirai Café
-- Motor: MySQL 8

DROP DATABASE IF EXISTS mirai_cafe;
CREATE DATABASE mirai_cafe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mirai_cafe;

-- Tabla de usuarios del sistema
CREATE TABLE usuarios (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    email           VARCHAR(120) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    rol             ENUM('ADMIN','CAJERO','CLIENTE') NOT NULL DEFAULT 'CLIENTE',
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Categorías del menú (Bebidas, Comidas, etc.)
CREATE TABLE categorias (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(80) NOT NULL UNIQUE,
    descripcion  VARCHAR(200)
);

-- Productos disponibles en la cafetería
CREATE TABLE productos (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(120) NOT NULL,
    descripcion     VARCHAR(255),
    precio          DECIMAL(10,2) NOT NULL,
    imagen_url      VARCHAR(300),
    disponible      BOOLEAN NOT NULL DEFAULT TRUE,
    stock           INT NOT NULL DEFAULT 0,
    categoria_id    BIGINT NOT NULL,
    fecha_creacion  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Pedidos realizados por los clientes
CREATE TABLE pedidos (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id   BIGINT NOT NULL,
    fecha        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estado       ENUM('PENDIENTE','EN_PROCESO','LISTO','PAGADO','CANCELADO')
                 NOT NULL DEFAULT 'PENDIENTE',
    observacion  VARCHAR(255),
    CONSTRAINT fk_pedido_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Detalle de cada pedido (productos incluidos)
CREATE TABLE detalle_pedido (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id    BIGINT NOT NULL,
    producto_id  BIGINT NOT NULL,
    cantidad     INT NOT NULL,
    precio_unit  DECIMAL(10,2) NOT NULL,
    subtotal     DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detalle_pedido
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Insumos usados para preparar los productos
CREATE TABLE insumos (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL UNIQUE,
    unidad         VARCHAR(20) NOT NULL,
    stock_actual   DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_minimo   DECIMAL(10,2) NOT NULL DEFAULT 0,
    activo         BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_ingreso  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_insumo_stock CHECK (stock_actual >= 0)
);

-- Movimientos de entrada y salida de insumos
CREATE TABLE movimientos_insumo (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    insumo_id    BIGINT NOT NULL,
    tipo         ENUM('ENTRADA','SALIDA') NOT NULL,
    cantidad     DECIMAL(10,2) NOT NULL,
    fecha        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacion  VARCHAR(255),
    CONSTRAINT fk_mov_insumo
        FOREIGN KEY (insumo_id) REFERENCES insumos(id)
);

-- Receta: qué insumos usa cada producto
CREATE TABLE recetas (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id  BIGINT NOT NULL,
    insumo_id    BIGINT NOT NULL,
    cantidad     DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_receta_producto
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    CONSTRAINT fk_receta_insumo
        FOREIGN KEY (insumo_id) REFERENCES insumos(id),
    CONSTRAINT uk_receta_producto_insumo
        UNIQUE (producto_id, insumo_id)
);

-- Datos de prueba

-- Usuarios iniciales con hashes BCrypt reales
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Admin General', 'admin@miraicafe.com',  '$2a$12$UY6ZZzPfS7.KNrl8bU8S9.z.lpOUkR4is25XOTQFFwatbbcJQa43i', 'ADMIN'),
('Cajero Uno',    'cajero@miraicafe.com', '$2a$12$i0/P3ZOVW8hPgiwaUQeOe.aom.yIwbo5KM/QzMRh94YVg/jMKLH12', 'CAJERO'),
('Juan Pérez',    'juan@miraicafe.com',   '$2a$12$g3NkbM66Am8yphXFKgLItuXt/0TjAXlwlHUpzMaP3ipdedNeomvty', 'CLIENTE');

-- Categorías del menú
INSERT INTO categorias (nombre, descripcion) VALUES
('Bebidas', 'Cafés, jugos y refrescos'),
('Comidas', 'Sándwiches, empanadas y menú del día'),
('Postres', 'Tortas, galletas y helados'),
('Snacks',  'Papas, chocolates y frutos secos');

-- Productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id) VALUES
('Café Americano',    'Café negro clásico',      5.00, 50, 1),
('Capuccino',         'Café con leche espumada', 7.50, 40, 1),
('Sándwich de pollo', 'Pan integral con pollo',  8.00, 30, 2),
('Empanada de carne', 'Empanada horneada',       4.50, 25, 2),
('Torta de chocolate','Porción individual',      6.00, 20, 3),
('Galleta de avena',  'Galleta artesanal',       3.00, 60, 4);

-- Insumos iniciales (stock_actual coherente con los movimientos de abajo:
-- entradas - salidas = stock_actual)
INSERT INTO insumos (nombre, unidad, stock_actual, stock_minimo) VALUES
('Café molido',       'kg',       10.0,  3.0),
('Leche',             'litros',   18.0,  5.0),
('Azúcar',            'kg',        8.0,  2.0),
('Pan integral',      'unidades', 50.0, 15.0),
('Pollo',             'kg',        6.0,  2.0),
('Harina',            'kg',       12.0,  4.0),
('Carne molida',      'kg',        5.0,  1.5),
('Chocolate en polvo','kg',        1.5,  2.0),
('Mantequilla',       'kg',        4.0,  1.0),
('Crema para batir',  'litros',    6.0,  2.0),
('Huevos',            'unidades', 36.0, 12.0),
('Queso',             'kg',        3.0,  1.0);

-- Insumo inactivo de ejemplo (para probar el filtro de movimientos y recetas)
INSERT INTO insumos (nombre, unidad, stock_actual, stock_minimo, activo) VALUES
('Jarabe de vainilla', 'litros', 2.0, 0.5, FALSE);

-- Movimientos de ejemplo (entradas - salidas = stock_actual de cada insumo)
INSERT INTO movimientos_insumo (insumo_id, tipo, cantidad, observacion) VALUES
(1,  'ENTRADA', 10.0, 'Compra inicial'),
(2,  'ENTRADA', 20.0, 'Compra inicial'),
(2,  'SALIDA',   2.0, 'Uso en capuccinos'),
(3,  'ENTRADA', 10.0, 'Compra inicial'),
(3,  'SALIDA',   2.0, 'Uso en capuccinos y galletas'),
(4,  'ENTRADA', 54.0, 'Compra inicial'),
(4,  'SALIDA',   4.0, 'Uso en sándwiches de pollo'),
(5,  'ENTRADA',  7.0, 'Compra inicial'),
(5,  'SALIDA',   1.0, 'Uso en sándwiches de pollo'),
(6,  'ENTRADA', 13.0, 'Compra inicial'),
(6,  'SALIDA',   1.0, 'Uso en galletas de avena'),
(7,  'ENTRADA',  6.0, 'Compra inicial'),
(7,  'SALIDA',   1.0, 'Uso en empanadas de carne'),
(8,  'ENTRADA',  3.0, 'Compra inicial'),
(8,  'SALIDA',   1.5, 'Uso en tortas de chocolate'),
(9,  'ENTRADA',  5.0, 'Compra inicial'),
(9,  'SALIDA',   1.0, 'Uso en galletas de avena'),
(10, 'ENTRADA',  8.0, 'Compra inicial'),
(10, 'SALIDA',   2.0, 'Uso en postres del día'),
(11, 'ENTRADA', 40.0, 'Compra inicial'),
(11, 'SALIDA',   4.0, 'Uso en galletas y empanadas'),
(12, 'ENTRADA',  4.0, 'Compra inicial'),
(12, 'SALIDA',   1.0, 'Uso en sándwiches de pollo'),
(13, 'ENTRADA',  2.0, 'Compra inicial');

-- Recetas de todos los productos (cantidades por unidad del producto)
INSERT INTO recetas (producto_id, insumo_id, cantidad) VALUES
(1, 1,  0.02),   -- Café Americano: café
(1, 3,  0.01),   -- Café Americano: azúcar
(2, 1,  0.02),   -- Capuccino: café
(2, 2,  0.20),   -- Capuccino: leche
(3, 4,  2.00),   -- Sándwich de pollo: pan integral
(3, 5,  0.12),   -- Sándwich de pollo: pollo
(3, 12, 0.04),   -- Sándwich de pollo: queso
(4, 6,  0.10),   -- Empanada de carne: harina
(4, 7,  0.09),   -- Empanada de carne: carne molida
(4, 11, 1.00),   -- Empanada de carne: huevo
(5, 6,  0.08),   -- Torta de chocolate: harina
(5, 3,  0.06),   -- Torta de chocolate: azúcar
(5, 8,  0.05),   -- Torta de chocolate: chocolate en polvo
(5, 9,  0.04),   -- Torta de chocolate: mantequilla
(5, 11, 1.00),   -- Torta de chocolate: huevo
(6, 6,  0.04),   -- Galleta de avena: harina
(6, 3,  0.03),   -- Galleta de avena: azúcar
(6, 9,  0.02),   -- Galleta de avena: mantequilla
(6, 11, 0.50);   -- Galleta de avena: huevo

-- Pedido de ejemplo
INSERT INTO pedidos (usuario_id, total, estado) VALUES
(3, 13.00, 'PAGADO');

-- Detalle del pedido de ejemplo
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unit, subtotal) VALUES
(1, 1, 1, 5.00, 5.00),
(1, 3, 1, 8.00, 8.00);

-- Migración para volúmenes Docker existentes (este script recrea la BD completa;
-- en volúmenes ya creados aplicar solo estos cambios):
-- 1) Hibernate agrega 'activo' como NULL:
--    UPDATE insumos SET activo = TRUE WHERE activo IS NULL;
-- 2) Restricción de nombre único:
--    ALTER TABLE insumos ADD CONSTRAINT uq_insumo_nombre UNIQUE (nombre);
-- 3) Datos nuevos de insumos, movimientos y recetas: ejecutar los INSERT de este
--    archivo manualmente sobre el volumen existente.