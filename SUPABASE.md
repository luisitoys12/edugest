# EduGest - Guia de migracion a Supabase

## Arquitectura objetivo

```
GitHub Pages (frontend estatico)
        |
        v API calls (REST)
  Supabase Edge Functions  ---- PostgreSQL (Supabase)
        |
        v
  Storage (logos, archivos)
```

## Pasos para conectar Supabase

### 1. Crear proyecto en Supabase
1. Ve a supabase.com -> New project
2. Guarda el Project URL y las API keys (anon + service_role)
3. Copia `.env.example` -> `.env` y llena los valores

### 2. Crear las tablas en Supabase
Ejecuta el SQL generado por Drizzle:
```bash
npm run db:generate  # genera las migraciones de shared/schema.ts
npm run db:push      # aplica las migraciones a tu base Supabase
```

### 3. Instalar cliente Supabase (ya incluido)
```bash
npm install @supabase/supabase-js
```

### 4. Configurar el cliente (ya generado en `client/src/lib/supabase.ts`)
```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### 5. Row Level Security (RLS)
Cada tabla tiene la columna `school_id` para multi-tenant. Activa RLS en Supabase:
```sql
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "school_isolation" ON students
  USING (school_id = current_setting('app.school_id')::integer);
```

## Despliegue en GitHub Pages

### Configurar Vite para GitHub Pages
En `vite.config.ts`, agrega:
```ts
base: '/edugest/',  // nombre del repositorio
```

### GitHub Actions (CI/CD automatico)
El archivo `.github/workflows/deploy.yml` construye y despliega automaticamente en cada push a `main`.

## GitHub Codespaces
El archivo `.devcontainer/devcontainer.json` configura automaticamente el entorno de desarrollo.

## Codigos unicos de alumnos
Cada alumno tiene un `access_code` unico (ej: `BJ-0001`) para que los padres puedan consultar calificaciones sin necesidad de crear una cuenta.
