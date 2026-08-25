# Portal Clínica Dental (admin/staff)

Portal de gestión (backoffice) para el staff de un SaaS multi-clínica dental:
agenda, pacientes, profesionales, tratamientos, presupuestos, sucursales y
convenios, con autenticación por tenant. Consume la API `clinica-dental-api`
vía REST; no implementa lógica de negocio propia.

## Módulos

- Agenda, Profesionales, Especialidades, Tratamientos
- Pacientes, Presupuestos
- Sucursales, Convenios, Marca (contenido del portal público de pacientes)
- Usuarios, Roles (solo admin)

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 + shadcn/ui (estilo "new-york")
- lucide-react (iconografía)
- react-router-dom
- @tanstack/react-query + axios

## Requisitos

- Node.js 20+
- `clinica-dental-api` corriendo (por defecto en `http://127.0.0.1:8081`)

## Desarrollo local

```bash
npm install
npm run dev
```

La app corre en **http://localhost:5174** (puerto fijo, configurado en
`vite.config.ts`).

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar si es necesario:

```
VITE_API_BASE_URL=http://127.0.0.1:8081
```

## Notas

- Este proyecto no se dockeriza: se levanta en local con `npm run dev`.
- Todo el texto de interfaz está en español de Chile.
