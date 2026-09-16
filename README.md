# ☕ Mirai Café

Sistema web para la gestión integral de una cafetería institucional. Permite administrar productos, registrar pedidos, controlar inventario y generar reportes de ventas en tiempo real.

Proyecto desarrollado con **Java + Spring Boot** (backend) y **React** (frontend), bajo una arquitectura de API REST.

---

## 📖 Descripción

Mirai Café digitaliza los procesos de una cafetería: desde la toma de pedidos hasta el control de stock y la generación de reportes. El sistema está pensado para tres tipos de usuarios:

- **Administrador:** gestiona todo el sistema.
- **Cajero:** registra y procesa pedidos.
- **Cliente:** consulta el menú y realiza pedidos.

---

## 🎯 Objetivos

### Objetivo General
Desarrollar un sistema web que automatice los procesos de pedido, venta y control de inventario de la cafetería Mirai Café.

### Objetivos Específicos
- Reducir el tiempo de atención de pedidos.
- Controlar el stock de insumos y productos en tiempo real.
- Generar reportes de ventas diarias, semanales y mensuales.
- Ofrecer una experiencia digital al cliente.

---

## 🚀 Tecnologías

### Backend
- Java 17
- Spring Boot 3.x
- Spring Data JPA + Hibernate
- Spring Security + JWT
- MySQL 8
- Swagger (springdoc-openapi)
- Maven

### Frontend
- React + Vite
- Axios
- React Router
- TailwindCSS

### Herramientas
- Git + GitHub
- Postman
- IntelliJ IDEA / VS Code
- MySQL Workbench

---

## 👥 Equipo y Distribución de Módulos

| Integrante | Módulo | Responsabilidad |
|---|---|---|
| Dev A | 🔐 Autenticación y Usuarios | Login, registro, roles, JWT |
| Dev B | 📋 Productos y Menú | CRUD productos, categorías |
| Dev C | 🧾 Pedidos y Ventas | Carrito, pedidos, estados |
| Dev D | 📦 Inventario | Insumos, stock, movimientos |
| Dev E | 📊 Reportes | Dashboard, ventas, estadísticas |

---

## 🧩 Módulos del Sistema

### 1. 🔐 Autenticación y Usuarios
- Registro e inicio de sesión con JWT
- Roles: `ADMIN`, `CAJERO`, `CLIENTE`
- CRUD de usuarios (solo Admin)
- Perfil del usuario autenticado

### 2. 📋 Productos y Menú
- CRUD de productos (nombre, precio, imagen, disponibilidad)
- Categorías: Bebidas, Comidas, Postres, Snacks
- Activar / desactivar productos del menú

### 3. 🧾 Pedidos y Ventas
- Creación de pedidos con múltiples productos (carrito)
- Cálculo automático de subtotales y total
- Estados del pedido: `PENDIENTE`, `EN_PROCESO`, `LISTO`, `PAGADO`, `CANCELADO`
- Historial de pedidos por cliente

### 4. 📦 Inventario
- Registro de insumos (café, leche, azúcar, etc.)
- Movimientos de entrada y salida
- Alertas de stock bajo
- Relación insumo → producto (receta)

### 5. 📊 Reportes
- Ventas del día, semana y mes
- Producto más vendido
- Ingresos totales
- Dashboard con gráficos estadísticos

---

## 🗄️ Modelo de Datos

Entidades principales del sistema:

- `Usuario`
- `Categoria`
- `Producto`
- `Pedido`
- `DetallePedido`
- `Insumo`
- `MovimientoInsumo`
- `Receta`

> El script completo se encuentra en `docs/database.sql`.

---

## 📁 Estructura del Proyecto
mirai-cafe/
├── backend/
│   ├── src/main/java/com/miraicafe/
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
│   ├── database.sql
│   └── postman_collection.json
└── README.md
text

---

## ⚙️ Configuración y Ejecución

### Requisitos previos
- Java 17 o superior
- Node.js 18 o superior
- MySQL 8
- Maven

### Backend
```bash
cd backend
./mvnw spring-boot:run
API: http://localhost:8080

Swagger: http://localhost:8080/swagger-ui.html

Frontend
bash
cd frontend
npm install
npm run dev
Frontend: http://localhost:5173

### Variables de Entorno
backend/src/main/resources/application.properties

properties
spring.datasource.url=jdbc:mysql://localhost:3306/mirai_cafe
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

🌿 Flujo de Trabajo en Git
Todo el equipo trabaja sobre la rama main.

Antes de cada push:

bash
git pull origin main
git add .
git commit -m "feat(modulo): descripción breve"
git push origin main
Nunca usar git push --force sobre main.

Probar el código localmente antes de subirlo.
