# ☕ Mirai Café

Sistema web integral para la gestión y digitalización de una cafetería institucional. Permite administrar el catálogo de productos y categorías, gestionar usuarios y roles, registrar pedidos con transaccionalidad, controlar inventario de insumos mediante recetas y generar reportes analíticos de ventas.

Proyecto construido con **Java 21 + Spring Boot 3.3.4** (con persistencia JPA, seguridad JWT y caché en Redis) en el backend y **React 19 + TypeScript + Vite + TailwindCSS v4** en el frontend, completamente orquestado con **Docker & Docker Compose**.

---

## 📌 Tabla de Contenidos

1. [Descripción y Roles](#-descripción-y-roles)
2. [Stack Tecnológico Real](#-stack-tecnológico-real)
3. [Módulos del Sistema y Tablas Utilizadas](#-módulos-del-sistema-y-tablas-utilizadas)
   - [Módulo de Insumos e Inventario](#-módulo-de-insumos-e-inventario)
   - [Módulo de Reportes y Dashboard](#-módulo-de-reportes-y-dashboard)
   - [Matriz de Tablas por Módulo](#-matriz-de-tablas-por-módulo)
4. [Estado de Implementación del Proyecto](#-estado-de-implementación-del-proyecto)
5. [Endpoints de la API REST](#-endpoints-de-la-api-rest)
6. [Estructura del Repositorio](#-estructura-del-repositorio)
7. [Guía de Ejecución y Despliegue](#-guía-de-ejecución-y-despliegue)
   - [Modo 1: Desarrollo en caliente (Recomendado día a día)](#modo-1-desarrollo-en-caliente-recomendado-para-programar)
   - [Modo 2: Entorno completo en Docker (Para sustentación/producción)](#modo-2-entorno-completo-en-docker-sustentación--producción)
8. [Cuentas y Datos de Prueba](#-cuentas-y-datos-de-prueba)
9. [Reglas de Negocio Clave](#-reglas-de-negocio-clave)

---

## 📖 Descripción y Roles

Mirai Café digitaliza y optimiza los flujos de una cafetería moderna. Está diseñado con control de acceso basado en roles (RBAC):

- **Administrador (`ADMIN`):** Control total del sistema. Gestión de usuarios (cambio de roles y activación), productos, categorías, insumos, recetas y visualización del panel administrativo y reportes.
- **Cajero (`CAJERO`):** Consulta y procesamiento de pedidos, confirmación de pagos y registro de movimientos de inventario.
- **Cliente (`CLIENTE`):** Consulta del menú digital con filtros en tiempo real, registro de cuenta, edición de perfil y creación de pedidos.

---

## 🚀 Stack Tecnológico Real

### Backend
- **Lenguaje:** Java 21 LTS
- **Framework:** Spring Boot 3.3.4
- **Seguridad:** Spring Security 6 + JJWT (Java JWT 0.12.6)
- **Persistencia:** Spring Data JPA + Hibernate
- **Base de Datos:** MySQL 8.0 (Debian)
- **Caché en Memoria:** Spring Cache + Spring Data Redis (Redis 7 Alpine) con invalidación automática (`@Cacheable`, `@CacheEvict`)
- **Documentación API:** Springdoc OpenAPI UI 2.6.0 (Swagger 3)
- **Validaciones & Utilidades:** Spring Validation (Jakarta), Lombok

### Frontend
- **Librería Core:** React 19 (`19.2.8`)
- **Lenguaje:** TypeScript (`~6.0.2`)
- **Herramienta de Construcción:** Vite (`8.3.0`)
- **Estilos:** TailwindCSS v4 (`@tailwindcss/vite 4.3.3`)
- **Enrutamiento:** React Router DOM v7 (`7.18.4`)
- **Cliente HTTP:** Axios (`1.20.0`) con interceptores para inyección de token Bearer
- **Iconografía:** Lucide React (`1.48.0`)

### Infraestructura y DevOps
- **Contenedores:** Docker & Docker Compose v2
- **Servidor Web Frontend en Producción:** Nginx Alpine
- **Almacenamiento de Datos:** Volúmenes Docker gestionados para MySQL

---

## 🗄️ Módulos del Sistema y Tablas Utilizadas

El diseño de la base de datos se encuentra estructurado en el script oficial [`docs/script.sql`](file:///c:/Cibertec/Mirai_Cafe/docs/script.sql). A continuación se detalla qué tablas utiliza cada módulo, poniendo especial énfasis en **Insumos** y **Reportes**:

### 📦 Módulo de Insumos e Inventario
Este módulo gestiona la materia prima necesaria para la preparación de los productos de la cafetería, el kardex de existencias y la formulación técnica (recetas).

#### Tablas que utiliza:
1. **`insumos` (Tabla Principal / Catálogo de Materia Prima):**
   - **Campos:** `id`, `nombre`, `unidad` (kg, litros, unidades), `stock_actual`, `stock_minimo`, `fecha_ingreso`.
   - **Uso:** Almacena el stock disponible de cada materia prima y el umbral de alerta (`stock_minimo`) para notificaciones de reabastecimiento.
2. **`movimientos_insumo` (Historial y Auditoría de Stock):**
   - **Campos:** `id`, `insumo_id` (FK a `insumos`), `tipo` (`ENUM('ENTRADA','SALIDA')`), `cantidad`, `fecha`, `observacion`.
   - **Uso:** Registra todo ingreso por compras o ajuste manual, así como salidas por merma o preparación, garantizando la trazabilidad del inventario.
3. **`recetas` (Tabla Intermedia / Formulación de Productos):**
   - **Campos:** `id`, `producto_id` (FK a `productos`), `insumo_id` (FK a `insumos`), `cantidad`.
   - **Uso:** Define la relación de cuánta cantidad de cada insumo requiere un producto final (ej. 1 Capuccino = 0.02 kg de café + 0.20 L de leche).
4. **`productos` (Tabla Relacionada):**
   - **Uso:** Es el ítem del catálogo que se enlaza a la receta para que, al venderse un pedido, el sistema pueda realizar el descuento automatizado de los insumos vinculados.

---

### 📊 Módulo de Reportes y Dashboard
Este módulo es de carácter analítico y de inteligencia de negocio. No crea entidades maestras propias, sino que realiza consultas de agregación, cruce y cálculo sobre las tablas operativas del sistema.

#### Tablas que utiliza:
1. **`pedidos`:**
   - **Campos consultados:** `id`, `fecha`, `total`, `estado`, `usuario_id`.
   - **Métricas calculadas:**
     - Ventas totales del día, de la semana y del mes (`SUM(total)` filtrando por rango de fechas y estado `PAGADO`).
     - Conteo de órdenes atendidas vs pedidos cancelados.
     - Ticket promedio de compra (`AVG(total)`).
     - Tendencias de facturación por período.
2. **`detalle_pedido`:**
   - **Campos consultados:** `pedido_id`, `producto_id`, `cantidad`, `precio_unit`, `subtotal`.
   - **Métricas calculadas:**
     - Ranking de **productos más vendidos** (Top Sellers) mediante `SUM(cantidad)` agrupado por `producto_id`.
     - Ingresos generados por cada ítem del menú (`SUM(subtotal)`).
3. **`productos`:**
   - **Campos consultados:** `id`, `nombre`, `categoria_id`, `stock`, `disponible`.
   - **Métricas calculadas:**
     - Obtención de nombres y descripciones para el ranking de ventas.
     - Alerta de productos terminados con bajo stock.
4. **`categorias`:**
   - **Campos consultados:** `id`, `nombre`.
   - **Métricas calculadas:** Distribución porcentual de ventas por categoría (bebidas, comidas, postres, snacks).
5. **`usuarios`:**
   - **Campos consultados:** `id`, `nombre`, `email`, `rol`.
   - **Métricas calculadas:** Clientes con mayor recurrencia de compra y productividad de atención por cajero.
6. **`insumos` y `movimientos_insumo`:**
   - **Campos consultados:** `nombre`, `stock_actual`, `stock_minimo`, `tipo`, `cantidad`.
   - **Métricas calculadas:** Reporte de insumos en nivel crítico (por debajo del stock mínimo) y balance de mermas/entradas por fecha.

---

### 📋 Matriz de Tablas por Módulo

| Módulo | Tablas Principales | Tablas Relacionadas / Consultadas |
|---|---|---|
| 🔐 **Autenticación y Usuarios** | `usuarios` | — |
| 📋 **Categorías y Menú** | `categorias`, `productos` | — |
| 🧾 **Pedidos y Ventas** | `pedidos`, `detalle_pedido` | `usuarios`, `productos` |
| 📦 **Insumos e Inventario** | `insumos`, `movimientos_insumo`, `recetas` | `productos` |
| 📊 **Reportes y Dashboard** | *(Consultas agregadas)* | `pedidos`, `detalle_pedido`, `productos`, `categorias`, `usuarios`, `insumos`, `movimientos_insumo` |

---

## 📈 Estado de Implementación del Proyecto

| Componente | Capa | Estado | Descripción |
|---|---|---|---|
| **Autenticación (JWT)** | Backend & Frontend | ✅ Completado | Login, registro, perfil, cambio de contraseña, roles ADMIN/CAJERO/CLIENTE. |
| **Gestión de Usuarios** | Backend | ✅ Completado | CRUD administrativo, activación/desactivación y cambio de rol. |
| **Categorías** | Backend & Frontend | ✅ Completado | CRUD en backend y módulo administrativo en frontend (`CategoryManager`). |
| **Productos** | Backend & Frontend | ✅ Completado | CRUD completo, carga/listado, filtros dinámicos, disponibilidad y gestión admin (`ProductManager`). |
| **Caché en Redis** | Backend & Docker | ✅ Completado | Caché implementado en consulta de productos con invalidación ante cambios. |
| **Pedidos (Ventas)** | Backend | ✅ Completado | Creación transaccional con validación de stock y cálculo de totales en servidor. |
| **Frontend Menú & Home** | Frontend | ✅ Completado | Página principal, catálogo dinámico con filtros, navbar responsivo, diseño oscuro moderno. |
| **Dockerización** | DevOps | ✅ Completado | `docker-compose.yml` funcional con MySQL (3307), Backend (8080), Frontend (5173) y Redis (6379). |
| **Insumos y Recetas** | Base de Datos | 🟡 Estructurado en BD | Tablas `insumos`, `movimientos_insumo` y `recetas` listas en SQL para endpoints de inventario. |
| **Reportes y Dashboard** | Base de Datos | 🟡 Estructurado en BD | Modelos y tablas operativas listas para consultas de agregación y reportes de gestión. |

---

## 🌐 Endpoints de la API REST

Prefijo base: `/api/v1`  
Documentación Swagger interactiva: `http://localhost:8080/swagger-ui.html`

### 1. Autenticación (`/api/v1/auth`)
- `POST /register`: Registro de nuevos clientes.
- `POST /login`: Inicio de sesión (devuelve token JWT y datos de usuario).
- `GET /me`: Obtener información del usuario autenticado (requiere Bearer Token).
- `PATCH /me`: Actualizar nombre del usuario autenticado.
- `PATCH /me/password`: Actualizar contraseña del usuario autenticado.

### 2. Usuarios (`/api/v1/users`) — *Solo ADMIN*
- `GET /`: Listar todos los usuarios registrados.
- `GET /{id}`: Obtener detalle de un usuario.
- `POST /`: Crear un usuario con rol asignado.
- `PATCH /{id}`: Actualizar datos de un usuario.
- `PATCH /{id}/role`: Cambiar el rol (`ADMIN`, `CAJERO`, `CLIENTE`).
- `PATCH /{id}/status`: Activar o desactivar cuenta.

### 3. Categorías (`/api/v1/categories`)
- `GET /`: Listar todas las categorías (Público).
- `GET /{id}`: Obtener categoría por ID (Público).
- `POST /`: Crear categoría (ADMIN).
- `PUT /{id}`: Modificar categoría (ADMIN).
- `DELETE /{id}`: Eliminar categoría (ADMIN).

### 4. Productos (`/api/v1/products`)
- `GET /`: Listado con filtros opcionales `categoryId`, `available`, `search` (Público, almacena en caché Redis).
- `GET /{id}`: Detalle de producto por ID (Público, caché Redis).
- `POST /`: Registrar nuevo producto (ADMIN, invalida caché Redis).
- `PUT /{id}`: Modificar producto existente (ADMIN, invalida caché Redis).
- `DELETE /{id}`: Eliminar producto (ADMIN, invalida caché Redis).
- `PATCH /{id}/availability`: Cambiar estado disponible/no disponible (ADMIN).

### 5. Pedidos (`/api/v1/orders`)
- `POST /`: Registrar pedido agrupando productos, validando stock y calculando subtotales/total (CLIENTE).

### 6. Salud del Sistema (`/api/v1/health`)
- `GET /`: Comprobación de estado (`status: UP`).

---

## 📁 Estructura del Repositorio

```text
Mirai_Cafe/
├── backend/
│   ├── src/main/java/com/cibertec/backend/
│   │   ├── config/              # Configuraciones de seguridad, CORS y OpenAPI
│   │   ├── controller/          # Controladores REST (Auth, User, Product, Category, Order, Health)
│   │   ├── dto/                 # Data Transfer Objects divididos por dominio
│   │   ├── entity/              # Entidades JPA (Usuario, Categoria, Producto, Pedido, DetallePedido, Rol, Estado)
│   │   ├── exception/           # Manejador global de excepciones (GlobalExceptionHandler)
│   │   ├── repository/          # Repositorios Spring Data JPA con consultas JPQL y EntityGraph
│   │   ├── security/            # Filtros JWT (JwtAuthenticationFilter) y JwtService
│   │   ├── service/             # Lógica de negocio (AuthService, ProductoService, PedidoService, etc.)
│   │   └── specification/      # Filtros dinámicos de consulta con JPA Specifications
│   ├── src/main/resources/
│   │   └── application.properties # Configuración de BD, Redis, JWT y Swagger
│   ├── Dockerfile               # Multi-stage build para generar imagen de Spring Boot
│   └── pom.xml                  # Dependencias Maven (Java 21, Spring Boot 3.3.4)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/           # CategoryManager, ProductManager
│   │   │   ├── brand/           # Logotipo e identidad visual
│   │   │   ├── home/            # Secciones de la landing page (Hero, Categorías, Promos, Ubicación)
│   │   │   ├── layout/          # Navbar interactivo y Footer
│   │   │   ├── menu/            # Barra de búsqueda, filtros y cuadrícula de menú
│   │   │   └── products/        # Tarjeta de producto con precio e imagen
│   │   ├── context/             # AuthContext (Estado global de sesión y token)
│   │   ├── hooks/               # Custom hooks (useMenu)
│   │   ├── pages/               # HomePage, MenuPage, LoginPage, RegisterPage, ProfilePage, AdminPage
│   │   ├── services/            # Clientes Axios (api.ts, authService, productService, categoryService)
│   │   └── types/               # Definiciones TypeScript de entidades y payloads
│   ├── Dockerfile               # Multi-stage build con Nginx para producción
│   ├── nginx.conf               # Configuración de Nginx para Single Page Application (SPA)
│   ├── package.json             # Dependencias (React 19, Tailwind v4, Vite 8)
│   └── vite.config.ts
├── docs/
│   └── script.sql               # Script DDL/DML de MySQL 8 con datos de prueba iniciales
├── docker-compose.yml           # Orquestación de MySQL 8, Backend, Frontend y Redis
├── comandos-docker.txt          # Chuleta de comandos rápidos de Docker
└── README.md                    # Documentación del proyecto
```

---

## ⚙️ Guía de Ejecución y Despliegue

Dispones de dos formas de trabajar en el proyecto:

### Modo 1: Desarrollo en caliente (Recomendado para programar)
Permite programar con recarga inmediata en el frontend (HMR en 0.1s) y ejecución cómoda del backend desde tu IDE favorito:

1. **Levantar los servicios base (MySQL y Redis) en Docker:**
   ```bash
   docker compose up mysql redis -d
   ```
   > MySQL iniciará en el puerto `3307` y cargará automáticamente la estructura y datos de `docs/script.sql`.

2. **Ejecutar el Backend Spring Boot:**
   - Ábrelo en IntelliJ IDEA o VS Code y ejecuta la clase `BackendApplication.java`, o por consola:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   - API disponible en: `http://localhost:8080/api/v1`
   - Documentación Swagger: `http://localhost:8080/swagger-ui.html`

3. **Ejecutar el Frontend React:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   - Aplicación web disponible en: `http://localhost:5173`

---

### Modo 2: Entorno completo en Docker (Sustentación / Producción)
Levanta todo el ecosistema (MySQL + Backend + Frontend en Nginx + Redis) en contenedores aislados:

1. Asegúrate de tener Docker Desktop iniciado.
2. En la raíz del proyecto, ejecuta:
   ```bash
   docker compose up --build -d
   ```
3. Verifica el estado de los contenedores:
   ```bash
   docker compose ps
   ```
4. Para detener los contenedores sin perder datos:
   ```bash
   docker compose down
   ```
5. Para reiniciar la base de datos a su estado limpio inicial:
   ```bash
   docker compose down -v
   docker compose up -d
   ```

### 🔗 Puertos y Enlaces de Acceso

| Servicio | URL / Host | Credenciales por defecto |
|---|---|---|
| **Frontend Web** | `http://localhost:5173` | — |
| **Backend API** | `http://localhost:8080/api/v1` | — |
| **Swagger UI** | `http://localhost:8080/swagger-ui.html` | — |
| **Health Check** | `http://localhost:8080/api/v1/health` | — |
| **Base de Datos MySQL** | `localhost:3307` | Usuario: `root` / Clave: `root` |
| **Caché Redis** | `localhost:6379` | Sin contraseña |

---

## 👥 Cuentas y Datos de Prueba

El script de base de datos incluye cuentas preconfiguradas con contraseñas encriptadas con BCrypt:

| Rol | Correo Electrónico | Contraseña por defecto | Permisos clave |
|---|---|---|---|
| **ADMIN** | `admin@miraicafe.com` | `admin123` | Acceso a `/admin`, administración de productos, categorías y usuarios |
| **CAJERO** | `cajero@miraicafe.com` | `cajero123` | Gestión de pedidos y registro de ventas |
| **CLIENTE** | `juan@miraicafe.com` | `cliente123` | Visualización de menú, generación de pedidos y perfil |

---

## 🛡️ Reglas de Negocio Clave

- **Seguridad en Registro:** Los usuarios que se registran desde la API pública reciben automáticamente el rol `CLIENTE`. Solo un `ADMIN` puede otorgar permisos administrativos.
- **Precios e Importes del Lado del Servidor:** El cliente únicamente envía los IDs de producto y cantidades; el backend valida disponibilidad, stock real y obtiene los precios vigentes de la base de datos para calcular subtotales y total.
- **Transaccionalidad en Pedidos:** Las órdenes se procesan bajo `@Transactional`, garantizando que si algún ítem falla o no tiene existencias, no queden registros parciales.
- **Rendimiento con Caché en Memoria:** Las consultas del catálogo público de productos se optimizan mediante Redis para respuestas ultra rápidas, invalidándose automáticamente cuando un administrador añade, edita o elimina productos.
- **Control de Inventario Preventivo:** Las salidas de stock no pueden superar las existencias actuales (`stock_actual >= cantidad`), y todo cambio en insumos debe registrarse como un movimiento de tipo `ENTRADA` o `SALIDA`.
