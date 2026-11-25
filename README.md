<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="src/assets/logo-completo-blanco.svg">
  <img src="src/assets/logo-completo.svg" alt="Buenaventura Reporta" width="420">
</picture>

### Plataforma ciudadana para reportar incidencias urbanas en Buenaventura

Los ciudadanos reportan problemas de su barrio, los ven en un mapa público y siguen su estado mientras la entidad responsable los atiende.

[![Producción](https://img.shields.io/badge/producción-buenaventura--reporta.tech-0a5caa?style=flat-square)](https://buenaventura-reporta.tech)
![React](https://img.shields.io/badge/React-18-137cc8?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-137cc8?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-137cc8?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-137cc8?style=flat-square&logo=tailwindcss&logoColor=white)
![Pruebas](https://img.shields.io/badge/pruebas-Vitest-398656?style=flat-square&logo=vitest&logoColor=white)
![CI/CD](https://img.shields.io/badge/CI%2FCD-Jenkins-f8b71d?style=flat-square&logo=jenkins&logoColor=white)

[**Aplicación**](https://buenaventura-reporta.tech) ·
[**API**](https://github.com/jav-19jm/Buenaventura-Reporta-API) ·
[**Documentación**](https://github.com/jav-19jm/Documentacion-Buenaventura-Reporta) ·
[**Tablero (Trello)**](https://trello.com/b/llfywpfw/bunaventura-reporta)

</div>

---

## Contenido

- [Sobre el proyecto](#sobre-el-proyecto)
- [Funcionalidades](#funcionalidades)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Puesta en marcha](#puesta-en-marcha)
- [Scripts](#scripts)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Pruebas y CI/CD](#pruebas-y-cicd)
- [Cómo contribuir](#cómo-contribuir)
- [Equipo](#equipo)

---

## Sobre el proyecto

**Buenaventura Reporta** es una aplicación web ciudadana y académica, independiente de la Alcaldía. Conecta a los habitantes de Buenaventura (Valle del Cauca) con las entidades que atienden los problemas de la ciudad: alumbrado, vías, basuras, agua, seguridad y más.

Este repositorio contiene el **frontend**: una SPA en React que consume la [API en Laravel](https://github.com/jav-19jm/Buenaventura-Reporta-API) y recibe notificaciones en tiempo real por WebSocket.

## Funcionalidades

| Rol | Qué puede hacer |
|---|---|
| **Visitante** | Ver el mapa público de reportes, noticias, servicios y entidades de la ciudad |
| **Ciudadano** | Crear reportes con ubicación y foto, votar los de otros, conversar con la entidad en cada reporte, recibir notificaciones y ganar insignias |
| **Entidad** | Atender los reportes asignados, cambiar su estado, responder a los ciudadanos y ver sus estadísticas |
| **Administrador** | Gestionar usuarios, roles, entidades, noticias y servicios; asignar reportes y consultar estadísticas globales |

Además:

- **Tiempo real:** notificaciones, mensajes y cambios de estado llegan al instante con Laravel Reverb. Si el WebSocket no está disponible, la app consulta periódicamente.
- **Sesión segura:** JWT con renovación automática del token y cierre de sesión si la cuenta se suspende.
- **Mapa interactivo** con Leaflet y OpenStreetMap.

## Tecnologías

| Área | Herramientas |
|---|---|
| Interfaz | React 18, TypeScript, React Router 7, Tailwind CSS 4, Motion, Lucide |
| Mapas y gráficos | Leaflet + React Leaflet, Recharts |
| Comunicación | Axios (cliente con renovación de JWT), Laravel Echo + Pusher JS (WebSocket) |
| Construcción | Vite 6 |
| Pruebas | Vitest |
| Despliegue | Docker (Nginx 1.27), Jenkins, Caddy (HTTPS) |

## Arquitectura

```
Navegador ──HTTPS──► Caddy ──► frontend (Nginx)
                                 ├── /          → esta SPA (React)
                                 ├── /api/      → backend (Laravel)
                                 ├── /storage/  → backend (imágenes subidas)
                                 └── /app/      → backend (WebSocket de Reverb)
```

En producción, el Nginx de este contenedor sirve la aplicación y hace de *reverse proxy* hacia la API. Navegador, API y WebSocket comparten el mismo origen, así que no hay problemas de CORS y la misma imagen sirve en cualquier entorno. La orquestación completa está en el repositorio de infraestructura (`Buenaventura-Reporta-Infra`).

## Puesta en marcha

### Opción A · Todo con Docker (recomendada)

Levanta frontend, API, PostgreSQL y Redis con un solo comando, desde el repositorio `Buenaventura-Reporta-Infra`. La guía completa está en la [documentación](https://github.com/jav-19jm/Documentacion-Buenaventura-Reporta/blob/main/docker/GUIA-DE-INSTALACION.md).

### Opción B · Solo el frontend (desarrollo)

Requisitos: **Node.js 22** y la [API](https://github.com/jav-19jm/Buenaventura-Reporta-API) corriendo en `http://localhost:8000`.

```bash
git clone https://github.com/jav-19jm/Buenaventura-Reporta.git
cd Buenaventura-Reporta
npm install
cp .env.example .env
npm run dev
```

Abre <http://localhost:5173>.

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL de la API (`http://localhost:8000/api` en desarrollo; `/api` en Docker) |
| `VITE_REVERB_APP_KEY` | Clave pública de Reverb. Debe coincidir con `REVERB_APP_KEY` del backend. Vacía = sin WebSocket |
| `VITE_REVERB_HOST` / `PORT` / `SCHEME` | Solo en desarrollo sin Docker |

> Las variables `VITE_*` se incrustan en el código que recibe el navegador: **nunca** pongas secretos en ellas.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Verificación de tipos (`tsc -b`) y build de producción en `dist/` |
| `npm test` | Pruebas unitarias con Vitest |
| `npm run typecheck` | Solo la verificación de tipos |
| `npm run lint` | ESLint |
| `npm run preview` | Sirve el build de `dist/` localmente |

## Estructura del proyecto

```
src/
├── api/              # Cliente HTTP (JWT), módulos por recurso y conexión en tiempo real
├── components/
│   ├── admin/        # Panel del administrador
│   ├── auth/         # Formularios de acceso
│   ├── common/       # Rutas protegidas, logo, animaciones, notificaciones
│   ├── public/       # Páginas públicas (mapa, noticias, servicios)
│   ├── ui/           # Componentes base (botones, tarjetas, badges…)
│   └── user/         # Panel del ciudadano
├── pages/            # Páginas por rol: admin, auth, entity, public, user
├── context/          # Sesión del usuario (AuthContext)
├── hooks/            # useAuth, useCanal (WebSocket)…
├── lib/              # Utilidades: estados de reporte, tipos de servicio
├── types/            # Tipos compartidos con la API
├── __tests__/        # Pruebas unitarias (Vitest)
└── routes.tsx        # Rutas de la aplicación por rol
docker/nginx.conf     # Servidor web y proxy de la imagen de producción
Dockerfile            # Build multi-etapa: Node 22 → Nginx
Jenkinsfile           # Pipeline de CI/CD
```

## Pruebas y CI/CD

Cada push y cada pull request ejecuta en **Jenkins** el pipeline del [`Jenkinsfile`](Jenkinsfile):

| Etapa | Qué hace | Ramas |
|---|---|---|
| **Checkout** | Descarga el commit | Todas |
| **Build** | `npm ci`, verificación de tipos y `vite build` dentro de Docker | Todas |
| **Test** | Pruebas con Vitest, con reporte JUnit en Jenkins; guarda `dist/` como artefacto | Todas |
| **Docker Build** | Imagen de producción (Nginx + build estático) | `main` |
| **Delivery** | Despliegue con Docker Compose, comprobación de salud y vuelta atrás automática si falla | `main` |

Un merge a `main` publica la nueva versión en <https://buenaventura-reporta.tech> sin intervención manual.

## Cómo contribuir

Trabajamos con ramas personales que se integran en `develop` y luego en `main`. Lee la **[guía de contribución](CONTRIBUTING.md)** antes de abrir tu primer pull request. Cada PR usa una [plantilla](.github/pull_request_template.md) que se carga automáticamente.

## Equipo

- **Jose Manuel Bonilla Payan**
- **Jesus Eduardo Estupiñan Hernandez**
- **Sebastian Gomez Lerma**

Proyecto académico del curso **Desarrollo de Software II**.
