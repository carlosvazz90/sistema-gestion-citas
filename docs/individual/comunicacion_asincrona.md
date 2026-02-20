# Investigación individual act 7
## Jesús Emmanuel Cruz Orea
### Comunicación asíncrona accesible

# Async JavaScript
Se refiere a la capacidad del lenguaje para ejecutar operaciones que no se completan de inmediato sin bloquear el resto del programa. Esto es esencial en el desarrollo web moderno, donde muchas tareas dependen de eventos externos, como solicitudes a servidores, temporizadores o interacción del usuario.

En JavaScript, el código normal se ejecuta de forma sincrónica, es decir, línea por línea. Sin embargo, operaciones como pedir datos a un servidor pueden tardar tiempo. Si JavaScript esperara bloqueando la ejecución, la página se congelaría. Para evitar esto, se utiliza la programación asíncrona.

Existen tres mecanismos principales para manejar la asincronía:

## Callbacks
Son funciones que se ejecutan cuando una operación termina. Aunque fueron la primera solución, pueden generar código difícil de leer cuando se encadenan muchas operaciones (callback hell).

## Promesas (Promises)
Representan un valor que estará disponible en el futuro. Permiten encadenar operaciones con .then() y manejar errores con .catch(). Mejoran la legibilidad respecto a callbacks.

## async/await
Es la forma moderna y más clara. Permite escribir código asíncrono con apariencia sincrónica. Una función async puede usar await para esperar una promesa sin bloquear el hilo principal.

El JavaScript asíncrono es fundamental para tareas como:

Solicitudes HTTP

Lectura de archivos

Temporizadores

Interacciones en tiempo real

Actualización dinámica de interfaces

La asincronía permite que las aplicaciones web sigan siendo rápidas y responsivas mientras realizan operaciones que toman tiempo.

# APIs REST
Es un tipo de interfaz que permite la comunicación entre aplicaciones a través de Internet usando el protocolo HTTP. Es el modelo más utilizado para conectar frontend y backend en aplicaciones web.

En una API REST, los recursos (como usuarios, productos o pedidos) se identifican mediante URLs y se manipulan usando métodos HTTP estándar:

GET → obtener datos

POST → crear datos

PUT/PATCH → actualizar datos

DELETE → eliminar datos

Por ejemplo:

GET /usuarios → lista de usuarios

POST /usuarios → crear usuario

GET /usuarios/5 → usuario específico

Las APIs REST suelen intercambiar datos en formato JSON, que es ligero y fácil de procesar en JavaScript.

En el frontend, el acceso a APIs REST se realiza comúnmente con fetch o librerías como Axios. Estas herramientas envían solicitudes HTTP y reciben respuestas del servidor de forma asíncrona.

Las ventajas de REST incluyen:

Separación clara entre cliente y servidor

Escalabilidad

Interoperabilidad entre sistemas

Uso de estándares web

En el desarrollo moderno, las APIs REST son la base de aplicaciones web, móviles y servicios en la nube.

# Estados de carga accesibles
Los estados de carga accesibles se refieren a cómo una aplicación comunica a todos los usuarios que un proceso está en curso, como cargar datos o enviar un formulario. En muchas interfaces modernas, las operaciones ocurren en segundo plano (por ejemplo, cargar contenido desde una API). Si no se informa correctamente, el usuario puede pensar que la aplicación está congelada o falló.

Un estado de carga accesible debe:

Indicar visualmente que algo está ocurriendo

Informar a lectores de pantalla

Evitar interacciones prematuras

Mantener contexto para el usuario

## Ejemplos comunes:

Spinners o indicadores de progreso

Mensajes como “Cargando…”

Botones deshabilitados temporalmente

Barras de progreso

## Para accesibilidad, se usan atributos ARIA como:

aria-busy="true" → indica que un área se está actualizando

role="status" → anuncia cambios dinámicos

aria-live="polite" → notifica sin interrumpir

También es importante que los estados de carga no solo dependan del color, ya que personas con discapacidad visual podrían no percibirlos. Un buen diseño de carga accesible mejora la experiencia, reduce confusión y hace la interfaz inclusiva.

# Manejo de errores de red
El manejo de errores de red consiste en detectar y gestionar fallos que ocurren durante la comunicación entre el cliente y el servidor. En aplicaciones web modernas, los errores de red son inevitables: conexiones lentas, servidores caídos, tiempo de espera agotado o respuestas inválidas. Si los errores no se manejan correctamente, el usuario puede experimentar:

Pantallas en blanco

Datos incorrectos

Acciones que parecen no funcionar

Pérdida de información

# En JavaScript, los errores de red se manejan principalmente con:

## try/catch en async/await
Permite capturar fallos en solicitudes asíncronas.

## .catch() en promesas
Maneja errores en cadenas de promesas.

## Validación de respuestas HTTP
Una respuesta puede llegar pero con error (ej. 404 o 500), por lo que debe verificarse el estado.

# Un buen manejo de errores incluye:

Mostrar mensajes claros al usuario

Permitir reintentar la acción

Registrar el error para diagnóstico

Mantener la aplicación estable

No revelar información sensible

En aplicaciones modernas, manejar correctamente los errores de red es esencial para confiabilidad, usabilidad y seguridad.