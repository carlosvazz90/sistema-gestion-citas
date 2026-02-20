# Investigación individual act 5
## Jesús Emmanuel Cruz Orea
### DOM y componentes dinámicos accesibles

# DOM
Es una representación estructurada en forma de árbol de todos los elementos de una página web. Cada etiqueta HTML se convierte en un nodo que puede ser leído y manipulado mediante JavaScript. Gracias al DOM, los desarrolladores pueden cambiar contenido, estilos o estructura de la página dinámicamente sin necesidad de recargarla.

Sin embargo, el DOM real del navegador es relativamente lento de manipular. Cada cambio que se realiza puede provocar procesos costosos como el reflow (recalcular posiciones de los elementos) y repaint (redibujar la interfaz). Cuando una aplicación tiene muchos cambios frecuentes —como en interfaces modernas e interactivas— manipular directamente el DOM puede afectar el rendimiento y provocar que la página se vuelva lenta o poco fluida.

Además, trabajar directamente con el DOM suele implicar código más complejo, ya que se deben buscar elementos, modificar atributos y gestionar eventos manualmente. Por ello, aunque el DOM es la base de toda interfaz web, su manipulación directa presenta limitaciones en aplicaciones grandes.

# Virtual DOM 
Es una representación ligera del DOM real que se mantiene en memoria y se utiliza para optimizar las actualizaciones de la interfaz. Este concepto es utilizado por librerías modernas como React.

Cuando ocurre un cambio en la interfaz de usuario, en lugar de modificar directamente el DOM real, primero se actualiza el Virtual DOM. Luego, el sistema compara la nueva versión con la anterior mediante un proceso llamado diffing. Finalmente, solo se aplican al DOM real los cambios mínimos necesarios.

Este enfoque ofrece varias ventajas importantes:

Reduce la manipulación directa del DOM real

Mejora el rendimiento en interfaces dinámicas

Permite actualizaciones más eficientes

Facilita un estilo de programación declarativo

# Problemas comunes al manipular el DOM
Uno de los problemas más comunes es el bajo rendimiento. Cada vez que se modifica el DOM, el navegador debe recalcular el diseño de la página. Si se realizan muchas modificaciones individuales (por ejemplo, en bucles), se generan múltiples reflows y repaints, lo que ralentiza la interfaz.

Otro problema frecuente es la complejidad del código. Cuando se manipulan elementos manualmente con JavaScript, el código suele volverse largo y difícil de mantener, ya que hay que buscar elementos, cambiar atributos, escuchar eventos y actualizar estados manualmente.

También existe el riesgo de inconsistencias en la interfaz. Si el estado de la aplicación no está sincronizado con el DOM (por ejemplo, se actualiza el HTML pero no la lógica interna), pueden aparecer errores visuales o comportamientos inesperados.

Un problema adicional es la gestión de eventos. Al agregar o eliminar elementos dinámicamente, los eventos pueden perderse o duplicarse si no se controlan correctamente. Por estas razones, los frameworks modernos utilizan abstracciones (como el Virtual DOM o sistemas reactivos) para evitar manipular directamente el DOM.

# Gestión de foco
La gestión de foco se refiere a controlar qué elemento de la interfaz está activo para recibir interacción del usuario, especialmente mediante teclado. Es un aspecto fundamental de la accesibilidad web.

El foco se representa visualmente cuando un elemento (como un botón o campo de texto) está seleccionado. Los usuarios que navegan con teclado usan la tecla Tab para moverse entre elementos interactivos. Si el foco no está bien gestionado, la interfaz puede volverse difícil o imposible de usar.

Uno de los problemas más comunes es que el foco se pierda después de cambios dinámicos en la interfaz. Por ejemplo, cuando aparece un modal o se actualiza contenido, el foco puede quedar en un elemento que ya no existe o que está oculto.

Una buena gestión de foco implica:

Mover el foco al contenido relevante cuando aparece (por ejemplo, al abrir un diálogo)

Devolver el foco al elemento anterior al cerrar un componente

Mantener un orden lógico de navegación con Tab

Evitar trampas de foco (quedar atrapado en un área sin poder salir)

En aplicaciones modernas, la gestión de foco es especialmente importante porque los cambios de interfaz ocurren sin recargar la página.

# Uso correcto de ARIA
ARIA (Accessible Rich Internet Applications) es un conjunto de atributos HTML que mejoran la accesibilidad para personas que usan tecnologías asistivas como lectores de pantalla.

ARIA permite describir roles, estados y propiedades de los elementos cuando el HTML estándar no es suficiente. Por ejemplo, en interfaces dinámicas donde se usan muchos div o componentes personalizados, ARIA ayuda a comunicar su función real.

Algunos ejemplos de uso:

role="button" → indica que un elemento actúa como botón

aria-label="Cerrar" → proporciona un nombre accesible

aria-hidden="true" → oculta elementos de lectores de pantalla

aria-expanded="true/false" → indica si un menú está abierto

El uso correcto de ARIA sigue principios importantes:

 ## Usar HTML semántico antes que ARIA
  Si existe una etiqueta nativa (como button o nav), es mejor usarla en lugar de simularla con div y ARIA.

## Mantener estados actualizados
 Si un componente cambia (por ejemplo, un acordeón se abre), el atributo ARIA correspondiente debe actualizarse para reflejar el estado real.

## No usar ARIA innecesariamente
 Un mal uso puede empeorar la accesibilidad en lugar de mejorarla.

 ARIA complementa el HTML para hacer interfaces dinámicas accesibles, pero debe usarse correctamente y solo cuando es necesario.