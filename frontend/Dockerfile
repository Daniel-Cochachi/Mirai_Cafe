# ---------------------------------------------------
# ETAPA 1: Construcción de React con Vite
# ---------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

# Copiamos package.json y package-lock.json para cachear dependencias
COPY package*.json ./
RUN npm install

# Copiamos el código fuente y generamos la carpeta dist/
COPY . .
RUN npm run build


# ---------------------------------------------------
# ETAPA 2: Servidor Nginx de Producción
# ---------------------------------------------------
FROM nginx:alpine

# Copiamos la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos estáticos generados por Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponemos el puerto 80 web
EXPOSE 80

# Comando para arrancar Nginx
CMD ["nginx", "-g", "daemon off;"]