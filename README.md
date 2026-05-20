# Buenaventura Reporta

## 📁 Estructura de carpetas del proyecto

```
Buenaventura-Reporta/
├── public/                      # Archivos estáticos (favicon, sonidos)
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── animations/      # Componentes de animación
│   │   │   ├── figma/           # Utilidades de Figma Make
│   │   │   ├── ui/              # Design System (shadcn + custom)
│   │   │   └── *.tsx            # Componentes funcionales
│   │   ├── lib/
│   │   │   └── utils.ts         # Utilidad cn() para clases CSS
│   │   ├── pages/
│   │   │   ├── admin/           # Panel administrativo
│   │   │   ├── entity/          # Dashboard de entidades
│   │   │   ├── user/            # Dashboard ciudadano
│   │   │   └── *.tsx            # Páginas públicas (Landing, Login, etc.)
│   │   ├── supabase/
│   │   │   └── supabase.ts      # Cliente Supabase + Tipos/Interfaces TS
│   │   ├── App.tsx              # Componente raíz
│   │   └── routes.ts            # Definición de rutas
│   ├── environment/
│   │   └── supabase.config.ts   # Credenciales de Supabase (fallback)
│   ├── hooks/
│   │   └── useAuth.ts           # Hook de autenticación global
│   ├── lib/                     # ← Capa de servicios / lógica de negocio
│   │   ├── admin.ts
│   │   ├── auth.ts
│   │   ├── badges.ts
│   │   ├── entities.ts
│   │   ├── notifications.ts
│   │   ├── reports.ts
│   │   ├── service-types.ts
│   │   └── test-connection.ts
│   ├── styles/
│   │   ├── fonts.css
│   │   ├── index.css            # CSS principal + Leaflet overrides
│   │   ├── tailwind.css
│   │   └── theme.css            # Tokens de diseño (light/dark)
│   └── main.tsx                 # Punto de entrada React
├── index.html                   # HTML shell
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tsconfig.app.json
```