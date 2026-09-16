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
    nombre         VARCHAR(100) NOT NULL,
    unidad         VARCHAR(20) NOT NULL,
    stock_actual   DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_minimo   DECIMAL(10,2) NOT NULL DEFAULT 0,
    fecha_ingreso  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
        FOREIGN KEY (insumo_id) REFERENCES insumos(id)
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

-- Insumos iniciales
INSERT INTO insumos (nombre, unidad, stock_actual, stock_minimo) VALUES
('Café molido',  'kg',       10.0, 3.0),
('Leche',        'litros',   20.0, 5.0),
('Azúcar',       'kg',        8.0, 2.0),
('Pan integral', 'unidades', 50.0, 15.0),
('Pollo',        'kg',        6.0, 2.0),
('Harina',       'kg',       12.0, 4.0);

-- Movimientos de ejemplo
INSERT INTO movimientos_insumo (insumo_id, tipo, cantidad, observacion) VALUES
(1, 'ENTRADA', 10.0, 'Compra inicial'),
(2, 'ENTRADA', 20.0, 'Compra inicial'),
(2, 'SALIDA',   2.0, 'Uso en capuccinos');

-- Receta de ejemplo: Capuccino = 0.02 kg café + 0.20 L leche
INSERT INTO recetas (producto_id, insumo_id, cantidad) VALUES
(2, 1, 0.02),
(2, 2, 0.20);

-- Pedido de ejemplo
INSERT INTO pedidos (usuario_id, total, estado) VALUES
(3, 13.00, 'PAGADO');

-- Detalle del pedido de ejemplo
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unit, subtotal) VALUES
(1, 1, 1, 5.00, 5.00),
(1, 3, 1, 8.00, 8.00);