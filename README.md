# POS-CRM: Sistema de Gestión de Terminales y CRM Financiero

## 1. Información General
**Nombre del Proyecto:** POS-CRM
**Descripción:** POS-CRM es una plataforma centralizada diseñada para optimizar la gestión, seguimiento y soporte técnico de terminales de puntos de venta (POS). La solución resuelve la fragmentación de datos entre diferentes aliados financieros, proporcionando un centro de control unificado para el monitoreo de estatus, gestión de inventario, registro de fallas y análisis de ventas en tiempo real.

## 2. Stack Tecnológico
El proyecto utiliza un stack moderno y escalable orientado a la alta disponibilidad y rendimiento:

- **Frontend:** [Next.js](https://nextjs.org/) (React) con el sistema de enrutamiento App Router.
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) para un diseño responsivo, moderno y con soporte nativo para temas oscuros/claros y optimización de impresión.
- **Backend & Base de Datos:** [Supabase](https://supabase.com/) como plataforma Backend-as-a-Service, proporcionando PostgreSQL, autenticación y almacenamiento.
- **Librerías Clave:**
  - `lucide-react`: Para iconografía consistente.
  - `html2pdf.js` & `window.print()`: Para la generación fiel de informes en PDF.
  - `xlsx`: Para la exportación y manejo de datos en formatos de hoja de cálculo.

## 3. Arquitectura y Datos

### Estructura de Carpetas
La arquitectura sigue las convenciones de Next.js para una separación clara de responsabilidades:
- `/src/app`: Definición de rutas, layouts y lógica de páginas (Dashboard, Aliados, Inventario).
- `/src/components`: Componentes de UI reutilizables y modales de gestión.
- `/src/lib`: Configuraciones de clientes (Supabase) y utilidades generales.
- `/supabase`: Scripts de migración y definición del esquema de base de datos.

### Modelo de Datos
La base de datos en Supabase está estructurada para soportar múltiples entidades:
- **Terminals:** Registro maestro de equipos, seriales y versiones de firmware.
- **Sales:** Historial de transacciones para análisis financiero.
- **Activity Logs:** Auditoría completa de acciones realizadas en el sistema.
- **Tablas de Aliados:** Estructuras específicas para procesadoras como VATC, Banplus, Credicard, entre otros.

### Gestión Automatizada (Servidor MCP)
Se integra un servidor **MCP (Model Context Protocol)** para la gestión automatizada de tablas y esquemas. Esto permite una sincronización dinámica del modelo de datos sin intervenciones manuales constantes, facilitando la escalabilidad del sistema ante nuevos requerimientos de los aliados.

### Seguridad (RLS)
La seguridad está garantizada a nivel de base de datos mediante **Row Level Security (RLS)** de PostgreSQL. Las políticas aseguran que:
- Solo usuarios autenticados puedan acceder a los datos sensibles.
- El acceso a la información de aliados específicos esté restringido según el rol del usuario.
- Se mantenga la integridad de los registros de auditoría (logs) sin posibilidad de alteración externa.

## 4. Funcionalidades Clave

- **Dashboard de Control:** Visualización en tiempo real de métricas críticas, estatus de terminales y resúmenes de ventas.
- **Gestión de Aliados:** Módulos específicos para la administración de terminales segmentados por procesadora financiera.
- **Control de Inventario:** Seguimiento detallado de equipos, piezas y consumibles.
- **Exportación Fiel a PDF:** Sistema de generación de informes técnicos que utiliza directivas `@media print` y Puppeteer (vía backend o browser) para asegurar que el documento PDF sea una réplica exacta de la interfaz web, manteniendo la identidad visual y estructura profesional.

## 5. Configuración de Desarrollo

### Requisitos Previos
- Node.js (versión recomendada LTS)
- NPM o PNPM

### Instalación Local
1. Clonar el repositorio.
2. Ejecutar la instalación de dependencias:
   ```bash
   npm install
   ```
3. Configurar las variables de entorno en un archivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```

### Seguridad y Acceso
> [!IMPORTANT]
> Nunca compartas el **Personal Access Token (PAT)** ni las claves de servicio de Supabase en el repositorio. Asegúrate de que el archivo `.env.local` esté incluido en tu `.gitignore`.

## 6. Sincronización y Despliegue

### Flujo de Git y Vercel
El proyecto está integrado con **Vercel** para despliegues continuos (CI/CD). Cada "push" a la rama principal dispara automáticamente una nueva versión de producción, validando previamente el proceso de compilación de Next.js.

### Conexión Directa a DB
La sincronización entre el entorno local y producción se realiza a través del cliente de Supabase, asegurando que tanto los datos como los cambios en el esquema (vía MCP o migraciones) se reflejen de manera consistente en todas las instancias de la aplicación.
