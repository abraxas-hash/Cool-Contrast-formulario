# 📚 Índice de Documentación - Andean Journey Forms

Bienvenido a la documentación completa del sistema de cotizaciones turísticas Andean Journey Peru.

## 📖 Documentos Disponibles

### 1. [README.md](../README.md)
**Descripción**: Guía principal del proyecto  
**Contenido**:
- Descripción general del sistema
- Instrucciones de despliegue a Vercel
- URLs y credenciales de acceso
- Características principales
- Solución de problemas

**Para quién**: Todos los usuarios, especialmente nuevos desarrolladores

---

### 2. [WORKFLOW_N8N.md](./WORKFLOW_N8N.md)
**Descripción**: Documentación técnica del workflow de n8n  
**Contenido**:
- Arquitectura del workflow
- Descripción detallada de cada nodo
- Procesadores (Tours Personalizados y Programas Fijos)
- Flujo de datos
- Configuración de Google Drive
- Troubleshooting técnico

**Para quién**: Desarrolladores que necesitan entender o modificar el workflow

---

### 3. [INTEGRACION.md](./INTEGRACION.md)
**Descripción**: Guía de integración de formularios  
**Contenido**:
- Cómo integrar nuevos formularios
- Estructura de datos requerida
- Validaciones del cliente
- Manejo de respuestas
- Ejemplos de código completos
- Testing

**Para quién**: Desarrolladores frontend que crean o modifican formularios

---

### 4. [API.md](./API.md)
**Descripción**: Referencia completa de la API  
**Contenido**:
- Endpoint principal
- Esquemas de datos
- Tipos de tour disponibles
- Respuestas y códigos de error
- Ejemplos en múltiples lenguajes

**Para quién**: Desarrolladores que integran con la API o crean clientes

---

## 🚀 Inicio Rápido

### Para Nuevos Desarrolladores

1. Lee el [README.md](../README.md) para entender el proyecto
2. Revisa [WORKFLOW_N8N.md](./WORKFLOW_N8N.md) para conocer la arquitectura
3. Consulta [INTEGRACION.md](./INTEGRACION.md) para crear formularios
4. Usa [API.md](./API.md) como referencia de datos

### Para Modificar el Workflow

1. [WORKFLOW_N8N.md](./WORKFLOW_N8N.md) - Arquitectura y nodos
2. [API.md](./API.md) - Estructura de datos esperada
3. [INTEGRACION.md](./INTEGRACION.md) - Impacto en formularios

### Para Crear Nuevos Formularios

1. [INTEGRACION.md](./INTEGRACION.md) - Guía paso a paso
2. [API.md](./API.md) - Esquemas de datos
3. [README.md](../README.md) - Despliegue y testing

---

## 📊 Estructura del Proyecto

```
andean-journey-docs/
├── README.md                   # 📘 Guía principal
├── login.html                  # 🔐 Página de login
├── dashboard.html              # 📊 Dashboard principal
├── programas-fijos.html        # 📝 Formulario programas fijos
├── tour-personalizado.html     # 🎨 Formulario tours personalizados
├── vercel.json                 # ⚙️ Configuración Vercel
└── docs/                       # 📚 Documentación
    ├── INDEX.md               # 📑 Este archivo
    ├── WORKFLOW_N8N.md        # 🔧 Documentación técnica workflow
    ├── INTEGRACION.md         # 🔗 Guía de integración
    └── API.md                 # 📡 Referencia API
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Agregar una Nueva Actividad

**Documentos a consultar**:
1. [WORKFLOW_N8N.md](./WORKFLOW_N8N.md#actividades-disponibles) - Ver actividades actuales
2. [INTEGRACION.md](./INTEGRACION.md#recopilar-datos) - Actualizar formulario
3. [API.md](./API.md#actividades-disponibles) - Actualizar documentación

**Pasos**:
1. Agregar actividad en el procesador de n8n
2. Actualizar formulario HTML
3. Actualizar documentación

---

### Caso 2: Crear un Nuevo Programa Fijo

**Documentos a consultar**:
1. [WORKFLOW_N8N.md](./WORKFLOW_N8N.md#programas-fijos-disponibles) - Ver programas actuales
2. [API.md](./API.md#programas-disponibles) - Esquema de datos
3. [INTEGRACION.md](./INTEGRACION.md#para-programas-fijos) - Actualizar formulario

**Pasos**:
1. Crear template en Google Docs
2. Agregar programa en el procesador
3. Crear carpetas en Google Drive
4. Actualizar formulario
5. Actualizar documentación

---

### Caso 3: Modificar el Diseño del PDF

**Documentos a consultar**:
1. [WORKFLOW_N8N.md](./WORKFLOW_N8N.md#html-generator-tours-personalizados) - Nodo HTML Generator
2. [INTEGRACION.md](./INTEGRACION.md#estructura-de-datos) - Datos disponibles

**Pasos**:
1. Editar el nodo "HTML Generator" en n8n
2. Modificar estilos CSS
3. Probar generación de PDF
4. Verificar en diferentes navegadores

---

### Caso 4: Cambiar la Lógica de Precios

**Documentos a consultar**:
1. [WORKFLOW_N8N.md](./WORKFLOW_N8N.md#procesadores) - Procesadores
2. [API.md](./API.md#campos) - Campos de precio

**Pasos**:
1. Modificar procesador correspondiente
2. Actualizar cálculos
3. Probar con diferentes escenarios
4. Actualizar documentación

---

## 🔍 Búsqueda Rápida

### Temas Técnicos

- **Arquitectura del sistema**: [WORKFLOW_N8N.md](./WORKFLOW_N8N.md#arquitectura-del-workflow)
- **Nodos de n8n**: [WORKFLOW_N8N.md](./WORKFLOW_N8N.md#nodos-del-workflow)
- **Procesadores**: [WORKFLOW_N8N.md](./WORKFLOW_N8N.md#procesadores)
- **Google Drive**: [WORKFLOW_N8N.md](./WORKFLOW_N8N.md#configuración-de-google-drive)

### Integración

- **Crear formularios**: [INTEGRACION.md](./INTEGRACION.md#integración-de-formularios)
- **Validaciones**: [INTEGRACION.md](./INTEGRACION.md#validaciones)
- **Enviar datos**: [INTEGRACION.md](./INTEGRACION.md#enviar-al-webhook)
- **Manejar respuestas**: [INTEGRACION.md](./INTEGRACION.md#manejo-de-respuestas)

### API

- **Endpoint**: [API.md](./API.md#endpoint-principal)
- **Esquemas**: [API.md](./API.md#esquemas-de-datos)
- **Errores**: [API.md](./API.md#códigos-de-error)
- **Ejemplos**: [API.md](./API.md#ejemplos)

### Solución de Problemas

- **Problemas generales**: [README.md](../README.md#solución-de-problemas)
- **Errores del workflow**: [WORKFLOW_N8N.md](./WORKFLOW_N8N.md#troubleshooting)
- **Testing**: [INTEGRACION.md](./INTEGRACION.md#testing)

---

## 📝 Convenciones de Documentación

### Formato de Código

- **JavaScript**: Usado en ejemplos de formularios
- **JSON**: Usado para esquemas de datos
- **Bash**: Usado para comandos de terminal
- **Python**: Usado en ejemplos de API

### Iconos Utilizados

- ✅ Requerido / Correcto
- ❌ Opcional / Incorrecto
- ⚠️ Advertencia
- 💡 Tip / Sugerencia
- 🔧 Configuración
- 📊 Datos / Estadísticas
- 🎯 Objetivo / Meta
- 🚀 Inicio / Despliegue

---

## 🔄 Actualizaciones

### Historial de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 2.0.0 | Nov 2025 | Documentación completa del workflow n8n |
| 1.0.0 | Oct 2025 | Versión inicial del proyecto |

### Próximas Actualizaciones

- [ ] Autenticación con API Key
- [ ] Rate limiting
- [ ] Webhooks de notificación
- [ ] Dashboard de estadísticas
- [ ] Integración con CRM

---

## 📞 Soporte

### Contacto

- **Email**: info@andeanjourney.com
- **Teléfono**: +51 918 818 503
- **Dirección**: Calle Coquimbo A3 — Cusco, Perú

### Recursos Adicionales

- [Repositorio GitHub](https://github.com/abraxas-hash/andean-journey-docs-)
- [n8n Documentation](https://docs.n8n.io/)
- [Vercel Documentation](https://vercel.com/docs)

---

## 📄 Licencia

© 2025 Andean Journey Peru. Todos los derechos reservados.

---

**Última actualización**: Noviembre 2025  
**Mantenido por**: Andean Journey Peru  
**Versión de documentación**: 2.0.0
