# Investigación Comparativa y Fundamentos Técnicos

## 1. Diferencia entre Página Web y Aplicación Web

Antes de definir la solución del proyecto, es importante entender la diferencia entre una página web y una aplicación web.

### Página Web

Una página web tiene como objetivo principal mostrar información. Generalmente es estática o con poca interacción.

**Características:**
- Contenido informativo
- No requiere autenticación obligatoria
- No maneja lógica compleja
- No procesa grandes cantidades de datos

**Ejemplo:** página institucional de una escuela o empresa.

### Aplicación Web

Una aplicación web permite interacción constante con el usuario y procesamiento de información en el servidor.

**Características:**
- Registro e inicio de sesión
- Base de datos
- Gestión de roles
- Procesamiento de información
- Rutas públicas y privadas

**Ejemplos reales:**
- Sistemas bancarios en línea
- Plataformas de gestión de citas
- Sistemas de administración empresarial

El proyecto propuesto corresponde a una aplicación web, ya que requiere autenticación, manejo de datos y lógica de negocio.

## 2. Problemas que se resuelven con Software

El software permite resolver problemas como:

- Automatización de procesos manuales
- Organización de información
- Reducción de errores humanos
- Acceso remoto a datos
- Optimización de tiempos

En el caso del proyecto, se busca digitalizar la gestión de citas para evitar desorganización y pérdida de información.

## 3. Arquitectura General de Aplicaciones Web

Una aplicación web profesional se compone de tres partes principales:

### Frontend

Es la parte visual con la que interactúa el usuario. Se encarga de mostrar información y capturar datos.

**Tecnologías comunes:**
- HTML
- CSS
- JavaScript

### Backend

Es el servidor que procesa la información.

**Funciones principales:**
- Autenticación
- Validación de datos
- Lógica del negocio
- Conexión a base de datos

En este proyecto se utilizará Node.js con Express.

### Infraestructura / Entornos

Incluye:
- Servidor donde se ejecuta la aplicación
- Docker para contenerización
- Repositorio Git para control de versiones
- Pipeline CI/CD para validación automática

Esta estructura permite escalabilidad y mantenimiento a largo plazo.

## 4. Análisis de Plataformas Similares

Para fundamentar el proyecto se analizaron dos plataformas reales que gestionan citas.

### Calendly

Calendly es una plataforma que permite agendar reuniones en línea mediante disponibilidad configurada por el usuario.

**Características principales:**
- Configuración de horarios disponibles
- Generación de enlaces personalizados
- Confirmación automática de citas

**Fortalezas:**
- Interfaz simple
- Flujo claro de reserva
- Experiencia rápida para el usuario

**Aspectos que se pueden mejorar:**
- Algunas funciones avanzadas son de pago
- Personalización limitada en versión básica

**Aprendizaje para el proyecto:** Se tomará como referencia la simplicidad del flujo de agendamiento.

### Booksy

Booksy es una plataforma enfocada en negocios de belleza y servicios personales.

**Características principales:**
- Gestión de empleados
- Historial de clientes
- Administración completa de agenda

**Fortalezas:**
- Sistema más completo
- Enfoque empresarial
- Manejo de múltiples roles

**Aspectos que se pueden mejorar:**
- Interfaz con múltiples opciones puede resultar compleja para nuevos usuarios

**Aprendizaje para el proyecto:** Se tomará como referencia la gestión de roles y organización interna.

## 5. Arquitectura de Información

La arquitectura de información permite organizar el contenido del sistema de manera lógica y estructurada.

En este proyecto se definieron:

- Rutas públicas (acceso sin autenticación)
- Rutas privadas (requieren sesión iniciada)
- Flujos claros de navegación

Esto evita confusión y mejora la experiencia del usuario.

## 6. Jerarquía de Contenido

La información se organizará de forma jerárquica:

- **Nivel 1:** Inicio
- **Nivel 2:** Registro / Login
- **Nivel 3:** Dashboard
- **Nivel 4:** Gestión de citas

Esto permite que el usuario entienda fácilmente dónde se encuentra dentro del sistema.

## 7. Patrones de Navegación Web

Se utilizarán patrones comunes como:

- Barra de navegación superior
- Botones claros de acción
- Confirmaciones después de acciones importantes

Esto mejora la usabilidad y reduce errores.

## 8. Accesibilidad y Navegación por Teclado

El sistema será diseñado considerando accesibilidad básica:

- Uso correcto del atributo "label" en formularios
- Orden lógico de tabulación
- Navegación completa usando la tecla Tab
- Botones accesibles

Esto permite que el sistema pueda utilizarse sin depender exclusivamente del mouse.

## 9. Conclusión de la Investigación

Después del análisis realizado, se concluye que una aplicación web es la solución adecuada para el problema identificado.

El sistema será diseñado desde el inicio con:

- Una arquitectura clara
- Rutas definidas
- Separación entre frontend y backend
- Prácticas básicas de accesibilidad

La investigación permitió evitar una idea vaga y construir una base técnica sólida y realista.
