# ☕ Mirai Café

Sistema web para la gestión integral de una cafetería institucional. Permite administrar productos, registrar pedidos, controlar inventario y generar reportes de ventas.

Proyecto desarrollado con **Java + Spring Boot** para el backend y **React** para el frontend, bajo una arquitectura de API REST.

---

## 📖 Descripción

Mirai Café digitaliza los procesos de una cafetería, desde la consulta del menú y la toma de pedidos hasta el control de inventario y la generación de reportes.

El sistema está pensado para tres tipos de usuarios:

- **Administrador:** gestiona usuarios, productos, inventario y reportes.
- **Cajero:** registra pedidos, procesa ventas y actualiza estados.
- **Cliente:** consulta el menú y realiza pedidos.

---

## 🎯 Objetivos

### Objetivo general

Desarrollar un sistema web que automatice los procesos de pedido, venta y control de inventario de la cafetería Mirai Café.

### Objetivos específicos

- Reducir el tiempo de atención de los pedidos.
- Controlar el stock de productos e insumos.
- Registrar las ventas de forma organizada.
- Generar reportes diarios, semanales y mensuales.
- Permitir que los clientes consulten el menú y realicen pedidos.
- Centralizar la administración de usuarios, productos e inventario.

---

## 🚀 Tecnologías

### Backend

- Java 21
- Spring Boot 3.3.x
- Spring Web
- Spring Data JPA
- Hibernate
- Spring Security
- JWT
- MySQL 8
- Swagger / OpenAPI
- Maven

### Frontend

- React
- Vite
- Axios
- React Router
- TailwindCSS

### Herramientas

- Git y GitHub
- Postman
- IntelliJ IDEA o Visual Studio Code
- MySQL Workbench

---

## 👥 Equipo y distribución de módulos

| Integrante | Módulo | Responsabilidad |
|---|---|---|
| Dev A | 🔐 Autenticación y usuarios | Registro, login, JWT, roles y perfiles |
| Dev B | 📋 Productos y menú | CRUD de productos, categorías y disponibilidad |
| Dev C | 🧾 Pedidos y ventas | Carrito, pedidos, totales y estados |
| Dev D | 📦 Inventario | Insumos, stock, movimientos y recetas |
| Dev E | 📊 Reportes | Dashboard, ventas y estadísticas |

Cada integrante debe desarrollar:

- Entidades.
- DTOs.
- Repositorios.
- Servicios.
- Controladores.
- Validaciones.
- Manejo de errores.
- Pruebas de su módulo.
- Documentación de sus endpoints.

---

# 🧩 Módulos del sistema

## 1. 🔐 Autenticación y usuarios

- Registro de clientes.
- Inicio de sesión con JWT.
- Control de acceso por roles.
- CRUD de usuarios para el administrador.
- Consulta y edición del perfil propio.
- Activación y desactivación de usuarios.

Roles disponibles:

```text
ADMIN
CAJERO
CLIENTE
```

## 2. 📋 Productos y menú

- CRUD de productos.
- CRUD de categorías.
- Registro de nombre, descripción, precio e imagen.
- Activación y desactivación de productos.
- Consulta del menú público.
- Filtros por categoría, disponibilidad y nombre.

Categorías iniciales:

- Bebidas.
- Comidas.
- Postres.
- Snacks.

## 3. 🧾 Pedidos y ventas

- Creación de pedidos con varios productos.
- Cálculo automático de subtotales.
- Cálculo automático del total.
- Historial de pedidos por cliente.
- Consulta de pedidos para cajeros y administradores.
- Actualización del estado del pedido.
- Cancelación de pedidos.
- Confirmación de pago.

Estados permitidos:

```text
PENDIENTE
EN_PROCESO
LISTO
PAGADO
CANCELADO
```

Flujo recomendado:

```text
PENDIENTE → EN_PROCESO → LISTO → PAGADO
PENDIENTE → CANCELADO
EN_PROCESO → CANCELADO
```

No se deben permitir transiciones como:

```text
CANCELADO → PAGADO
PAGADO → EN_PROCESO
```

> En esta primera versión, `PAGADO` representa la confirmación del pago. Si posteriormente se integra una pasarela de pagos, se recomienda separar el estado del pedido y el estado del pago.

## 4. 📦 Inventario

- Registro de insumos.
- Consulta del stock actual.
- Registro de movimientos de entrada y salida.
- Alertas de stock bajo.
- Registro de recetas.
- Relación entre productos e insumos.
- Descuento de insumos al vender productos preparados mediante receta.

Reglas principales:

- No se permiten cantidades negativas.
- No se puede registrar una salida mayor al stock disponible.
- Todo ajuste de inventario debe generar un movimiento.
- El precio y el total del pedido siempre deben calcularse en el backend.
- El equipo debe definir si se descuenta stock de productos, insumos o ambos, evitando descontar dos veces.

## 5. 📊 Reportes

- Ventas del día.
- Ventas semanales.
- Ventas mensuales.
- Ingresos totales.
- Cantidad de pedidos.
- Producto más vendido.
- Productos con bajo stock.
- Dashboard con indicadores estadísticos.

---

# 🌐 API REST

## Configuración general

Todos los endpoints utilizarán el siguiente prefijo:

```text
/api/v1
```

Las rutas protegidas utilizarán JWT:

```http
Authorization: Bearer TOKEN
```

Roles:

- `PUBLICO`: no requiere autenticación.
- `CLIENTE`: cliente autenticado.
- `CAJERO`: usuario con rol cajero.
- `ADMIN`: administrador.
- `ADMIN, CAJERO`: cualquiera de los dos roles.

---

## 1. Endpoints de autenticación

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Público | Registrar un nuevo cliente |
| `POST` | `/api/v1/auth/login` | Público | Iniciar sesión |
| `GET` | `/api/v1/auth/me` | Autenticado | Consultar usuario actual |
| `PATCH` | `/api/v1/auth/me` | Autenticado | Actualizar perfil propio |
| `PATCH` | `/api/v1/auth/me/password` | Autenticado | Cambiar contraseña |
| `POST` | `/api/v1/auth/refresh` | Autenticado | Renovar token |
| `POST` | `/api/v1/auth/logout` | Autenticado | Cerrar sesión |

`refresh` y `logout` son opcionales si el proyecto utiliza únicamente tokens de corta duración.

### Ejemplo de registro

```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123"
}
```

### Ejemplo de login

```json
{
  "email": "juan@example.com",
  "password": "Password123"
}
```

---

## 2. Endpoints de usuarios

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/users` | ADMIN | Listar usuarios |
| `GET` | `/api/v1/users/{id}` | ADMIN | Consultar usuario |
| `POST` | `/api/v1/users` | ADMIN | Crear usuario administrativo |
| `PATCH` | `/api/v1/users/{id}` | ADMIN | Actualizar usuario |
| `PATCH` | `/api/v1/users/{id}/role` | ADMIN | Cambiar rol |
| `PATCH` | `/api/v1/users/{id}/status` | ADMIN | Activar o desactivar usuario |

Se recomienda desactivar usuarios en lugar de eliminarlos físicamente, para conservar el historial de pedidos.

---

## 3. Endpoints de categorías

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/categories` | Público | Listar categorías |
| `GET` | `/api/v1/categories/{id}` | Público | Consultar categoría |
| `POST` | `/api/v1/categories` | ADMIN | Crear categoría |
| `PUT` | `/api/v1/categories/{id}` | ADMIN | Actualizar categoría |
| `DELETE` | `/api/v1/categories/{id}` | ADMIN | Eliminar categoría |

No se debe eliminar una categoría que tenga productos asociados. En ese caso, debe desactivarse o impedirse la eliminación.

---

## 4. Endpoints de productos

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/products` | Público | Listar productos disponibles |
| `GET` | `/api/v1/products/{id}` | Público | Consultar producto |
| `POST` | `/api/v1/products` | ADMIN | Crear producto |
| `PUT` | `/api/v1/products/{id}` | ADMIN | Actualizar producto |
| `PATCH` | `/api/v1/products/{id}/availability` | ADMIN | Activar o desactivar producto |
| `DELETE` | `/api/v1/products/{id}` | ADMIN | Desactivar producto |

Filtros disponibles:

```text
GET /api/v1/products?categoryId=1&available=true&search=cafe&page=0&size=10
```

El cliente solo debe visualizar productos disponibles.

---

## 5. Endpoints de pedidos

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/orders` | CLIENTE, CAJERO | Crear pedido |
| `GET` | `/api/v1/orders/my-orders` | CLIENTE | Consultar pedidos propios |
| `GET` | `/api/v1/orders` | ADMIN, CAJERO | Listar pedidos |
| `GET` | `/api/v1/orders/{id}` | Propietario, ADMIN, CAJERO | Consultar pedido |
| `PATCH` | `/api/v1/orders/{id}/status` | ADMIN, CAJERO | Cambiar estado |
| `POST` | `/api/v1/orders/{id}/cancel` | Propietario, ADMIN, CAJERO | Cancelar pedido |
| `POST` | `/api/v1/orders/{id}/pay` | ADMIN, CAJERO | Confirmar pago |

Filtros:

```text
GET /api/v1/orders?status=PENDIENTE&from=2026-09-01&to=2026-09-17&page=0&size=20
```

### Crear pedido

```json
{
  "items": [
    {
      "productoId": 1,
      "cantidad": 2
    },
    {
      "productoId": 3,
      "cantidad": 1
    }
  ],
  "observacion": "Sin azúcar"
}
```

El backend debe:

1. Verificar que los productos existan.
2. Verificar que estén disponibles.
3. Validar el stock.
4. Obtener los precios desde la base de datos.
5. Calcular subtotales y total.
6. Guardar el precio unitario en cada detalle.
7. Registrar el pedido dentro de una transacción.

---

## 6. Endpoints de insumos

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/ingredients` | ADMIN, CAJERO | Listar insumos |
| `GET` | `/api/v1/ingredients/{id}` | ADMIN, CAJERO | Consultar insumo |
| `POST` | `/api/v1/ingredients` | ADMIN | Crear insumo |
| `PUT` | `/api/v1/ingredients/{id}` | ADMIN | Actualizar insumo |
| `PATCH` | `/api/v1/ingredients/{id}` | ADMIN | Actualizar parcialmente |
| `PATCH` | `/api/v1/ingredients/{id}/status` | ADMIN | Activar o desactivar |
| `GET` | `/api/v1/ingredients/low-stock` | ADMIN, CAJERO | Listar insumos con bajo stock |

Los endpoints pueden utilizar `/insumos` en lugar de `/ingredients`, pero todo el equipo debe utilizar un solo idioma.

---

## 7. Endpoints de movimientos de inventario

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/inventory/movements` | ADMIN, CAJERO | Registrar entrada o salida |
| `GET` | `/api/v1/inventory/movements` | ADMIN, CAJERO | Listar movimientos |
| `GET` | `/api/v1/ingredients/{id}/movements` | ADMIN, CAJERO | Consultar movimientos de un insumo |

### Registrar movimiento

```json
{
  "insumoId": 1,
  "tipo": "ENTRADA",
  "cantidad": 10,
  "observacion": "Compra semanal"
}
```

Tipos permitidos:

```text
ENTRADA
SALIDA
```

---

## 8. Endpoints de recetas

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/products/{productId}/recipe` | ADMIN, CAJERO | Consultar receta |
| `PUT` | `/api/v1/products/{productId}/recipe` | ADMIN | Reemplazar receta |
| `DELETE` | `/api/v1/products/{productId}/recipe/{ingredientId}` | ADMIN | Eliminar ingrediente |

### Ejemplo de receta

```json
{
  "items": [
    {
      "insumoId": 1,
      "cantidad": 0.02
    },
    {
      "insumoId": 2,
      "cantidad": 0.20
    }
  ]
}
```

---

## 9. Endpoints de reportes

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/reports/dashboard` | ADMIN | Resumen general |
| `GET` | `/api/v1/reports/sales/summary` | ADMIN | Resumen de ventas |
| `GET` | `/api/v1/reports/sales/daily` | ADMIN | Ventas del día |
| `GET` | `/api/v1/reports/sales/weekly` | ADMIN | Ventas de la semana |
| `GET` | `/api/v1/reports/sales/monthly` | ADMIN | Ventas del mes |
| `GET` | `/api/v1/reports/products/top` | ADMIN | Productos más vendidos |
| `GET` | `/api/v1/reports/inventory/low-stock` | ADMIN | Insumos con bajo stock |

Ejemplo:

```text
GET /api/v1/reports/sales/summary?from=2026-09-01&to=2026-09-17
```

### Respuesta de ejemplo

```json
{
  "totalOrders": 125,
  "totalSales": 2450.50,
  "cancelledOrders": 8,
  "averageOrder": 19.60
}
```

---

## 10. Endpoint de salud del sistema

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/health` | Público | Verificar que la API está activa |

Respuesta:

```json
{
  "status": "UP",
  "service": "mirai-cafe"
}
```

---

# 🗄️ Modelo de datos

Entidades principales:

- `Usuario`
- `Categoria`
- `Producto`
- `Pedido`
- `DetallePedido`
- `Insumo`
- `MovimientoInsumo`
- `Receta`

El script de la base de datos se encuentra en:

```text
docs/script.sql
```

Relaciones principales:

```text
Usuario 1 ─── N Pedido
Pedido 1 ─── N DetallePedido
Producto 1 ─── N DetallePedido
Categoria 1 ─── N Producto
Producto 1 ─── N Receta
Insumo 1 ─── N Receta
Insumo 1 ─── N MovimientoInsumo
```

---

# 📁 Estructura del proyecto

```text
mirai-cafe/
├── backend/
│   ├── src/main/java/com/cibertec/backend/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── security/
│   │   ├── config/
│   │   └── exception/
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── context/
│   │   └── routes/
│   └── package.json
├── docs/
│   ├── script.sql
│   └── postman_collection.json
└── README.md
```

---

# ⚙️ Configuración y ejecución

## Requisitos previos

- Java 21
- Node.js 18 o superior
- MySQL 8
- Maven
- Git

## Configuración de la base de datos

Crear la base de datos ejecutando:

```bash
mysql -u root -p < docs/script.sql
```

## Ejecución del backend

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

API:

```text
http://localhost:8080
```

Swagger:

```text
http://localhost:8080/swagger-ui/index.html
```

## Ejecución del frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔐 Variables de configuración

No se deben subir contraseñas reales al repositorio.

Ejemplo:

```properties
spring.application.name=mirai-cafe

spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/mirai_cafe}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

server.port=${PORT:8080}
```

Para producción se deben utilizar variables de entorno:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
```

---

# ✅ Reglas de negocio obligatorias

- Un usuario no puede registrarse directamente como `ADMIN`.
- El email de cada usuario debe ser único.
- El precio de un producto debe ser mayor que cero.
- La cantidad de un producto debe ser mayor que cero.
- El total del pedido debe calcularse en el backend.
- Un pedido cancelado no puede pagarse.
- Un pedido pagado no puede volver a estar pendiente.
- No se puede vender un producto desactivado.
- No se puede registrar una salida mayor al stock disponible.
- Todo movimiento de inventario debe quedar registrado.
- Los pedidos deben guardarse usando transacciones.
- Los usuarios desactivados no deben poder iniciar sesión.
- Los clientes solo pueden consultar sus propios pedidos.
- Solo `ADMIN` puede administrar usuarios, productos, categorías y recetas.
- `CAJERO` puede procesar pedidos y registrar movimientos autorizados.
- Los reportes deben estar disponibles únicamente para `ADMIN`.

---

# 🧪 Pruebas mínimas

Cada módulo debe incluir pruebas para:

- Casos exitosos.
- Datos inválidos.
- Usuario no autenticado.
- Usuario sin permisos.
- Recursos inexistentes.
- Errores de base de datos.
- Reglas de negocio.

Pruebas mínimas del sistema:

- Registro e inicio de sesión.
- Creación de productos.
- Creación de pedidos.
- Cálculo correcto del total.
- Cancelación de pedidos.
- Actualización de stock.
- Consulta de reportes.
- Restricción de endpoints por rol.

---

# 🌿 Flujo de trabajo con Git

No se recomienda que todo el equipo trabaje directamente sobre `main`.

Crear una rama por funcionalidad:

```bash
git checkout -b feature/auth
git checkout -b feature/products
git checkout -b feature/orders
git checkout -b feature/inventory
git checkout -b feature/reports
```

Antes de subir cambios:

```bash
git pull origin main
git add .
git commit -m "feat(auth): implementar inicio de sesión"
git push origin feature/auth
```

Luego se debe crear un Pull Request hacia `main`.

Reglas:

- No hacer `git push --force` sobre `main`.
- Probar localmente antes de subir cambios.
- No subir contraseñas ni tokens.
- No modificar archivos de otro módulo sin coordinar con su responsable.
- Mantener nombres de endpoints y DTOs consistentes.
- Revisar los Pull Requests entre todos los integrantes.

---

# 📌 Estado del proyecto

El proyecto se encuentra en etapa inicial de planificación y configuración.

La implementación se realizará por módulos:

1. Autenticación y usuarios.
2. Productos y categorías.
3. Pedidos y ventas.
4. Inventario y recetas.
5. Reportes y dashboard.
6. Integración entre backend y frontend.
7. Pruebas y documentación final.
