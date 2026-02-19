# Definición del Proyecto

## 1. Nombre del Proyecto

Sistema Web para Gestión de Citas en Negocios Locales

## 2. Definición del Problema

Actualmente muchos negocios pequeños como barberías, consultorios, talleres o estudios de belleza gestionan sus citas por medio de WhatsApp, llamadas telefónicas o agendas en papel. Este método genera varios problemas:

- Citas duplicadas
- Falta de control sobre horarios disponibles
- Pérdida de información de clientes
- Desorganización en días con alta demanda
- Dificultad para llevar historial

Esto afecta directamente la organización interna del negocio y la experiencia del cliente. Por lo tanto, se identifica la necesidad de un sistema digital que permita administrar las citas de manera ordenada, segura y accesible desde cualquier dispositivo con conexión a internet.

## 3. Justificación de la Solución

La solución propuesta es desarrollar una aplicación web, ya que el sistema requiere:

- Autenticación de usuarios
- Manejo de base de datos
- Gestión de roles (administrador y cliente)
- Procesamiento de información en el servidor
- Rutas públicas y privadas

No se trata de una página informativa, sino de un sistema interactivo que procesa datos en tiempo real. Una aplicación web permite acceso multiplataforma sin necesidad de instalar software adicional y facilita futuras actualizaciones o escalabilidad.

## 4. Usuarios del Sistema

Se identifican los siguientes usuarios reales:

### Administrador
- Gestiona citas
- Visualiza agenda completa
- Administra clientes
- Configura horarios disponibles

### Cliente
- Puede registrarse
- Iniciar sesión
- Agendar citas
- Consultar sus citas

## 5. Alcance Inicial (MVP)

Para esta primera etapa se desarrollará un Producto Mínimo Viable (MVP) que incluirá:

- Registro de usuario
- Inicio de sesión
- Creación de citas
- Visualización de citas
- Eliminación de citas

No se incluirán notificaciones automáticas ni pagos en línea en esta fase inicial. El objetivo es validar la funcionalidad base antes de escalar el sistema.

## 6. Arquitectura General del Sistema

El sistema se estructurará en tres capas principales:

### Frontend
Encargado de la interfaz de usuario. Permitirá interactuar con el sistema mediante formularios y navegación estructurada.

### Backend
Desarrollado con Node.js y Express. Se encargará de:

- Procesar solicitudes
- Gestionar autenticación
- Manejar la lógica de negocio
- Conectarse a la base de datos

### Infraestructura
- Repositorio Git para control de versiones
- Docker para contenerización del entorno
- CI/CD básico para validación automática del proyecto

Esta estructura permite una base sólida y escalable desde el inicio.

## 7. Rutas del Sistema

### Rutas Públicas
- `/`
- `/login`
- `/registro`
- `/agendar`

### Rutas Privadas
- `/dashboard`
- `/citas`
- `/clientes`

Las rutas privadas requerirán autenticación previa.

## 8. Flujo General de Navegación

### Flujo del cliente:
Inicio → Registro/Login → Agendar cita → Confirmación

### Flujo del administrador:
Login → Dashboard → Gestión de citas → Gestión de clientes

El sistema será diseñado considerando navegación por teclado y orden lógico de tabulación.

## 9. Consideraciones de Accesibilidad

Desde el inicio se contemplan prácticas básicas de accesibilidad:

- Navegación mediante teclado (uso de Tab)
- Formularios con etiquetas (labels) correctamente asociadas
- Botones accesibles
- Estructura clara y jerarquía de contenido definida

Esto permite que el sistema sea usable sin depender exclusivamente del mouse.

---

**Conclusión:** Esta definición proporciona una base clara, alcanzable y fundamentada técnicamente para el desarrollo del proyecto.
