# Investigación Individual
## Carlos Vázquez
### Proyecto: Sistema de Gestión de Citas

## 1. Diferencia entre Página Web y Aplicación Web

Una página web tiene como finalidad principal mostrar información. Generalmente es estática o con poca interacción y no requiere autenticación ni procesamiento complejo de datos.

En cambio, una aplicación web permite interacción constante con el usuario, manejo de base de datos, autenticación y lógica del lado del servidor.

El proyecto desarrollado corresponde a una aplicación web, ya que requiere gestión de usuarios, control de acceso y procesamiento de información en tiempo real.

## 2. Problemas que se Resuelven con Software

El software permite automatizar procesos manuales, reducir errores humanos y mejorar la organización de la información.

En el caso del sistema propuesto, se busca resolver problemas como:

- Citas duplicadas
- Desorganización de horarios
- Falta de historial de clientes
- Gestión manual poco eficiente

Digitalizar este proceso permite mayor control y mejor experiencia para el usuario.

## 3. Arquitectura General de Aplicaciones Web

Una aplicación web se compone de tres partes principales:

### Frontend
Es la interfaz visual con la que interactúa el usuario.

### Backend
Procesa las solicitudes, gestiona la lógica del negocio y se conecta con la base de datos.
En este proyecto se utiliza Node.js con Express.

### Infraestructura
Incluye herramientas como Git para control de versiones, Docker para contenerización y GitHub Actions para integración continua.

## 4. Arquitectura de Información

La arquitectura de información permite organizar el contenido del sistema de forma estructurada.

En este proyecto se definieron:

- Rutas públicas (acceso sin autenticación)
- Rutas privadas (requieren inicio de sesión)
- Flujos claros de navegación

Esto facilita el uso del sistema y mejora la experiencia del usuario.

## 5. Accesibilidad y Navegación

Se consideraron aspectos básicos de accesibilidad desde el diseño inicial:

- Navegación mediante teclado (uso de Tab)
- Uso correcto de etiquetas en formularios
- Orden lógico de tabulación
- Separación clara entre secciones

Esto permite que el sistema sea usable incluso sin depender exclusivamente del mouse.

## 6. Análisis de Plataformas Similares

 Análisis de Plataformas Similares

Se analizaron plataformas reales como:

Calendly
Sistema de agendamiento en línea que permite configurar disponibilidad y generar enlaces para reservar citas.
Se destaca por su flujo simple y facilidad de uso.

Booksy
Plataforma orientada a negocios de servicios como barberías y estética.
Permite gestión de empleados, clientes y horarios.

A partir de este análisis se tomó como referencia:

Flujo simple de reserva

Separación de roles

Interfaz clara y organizada