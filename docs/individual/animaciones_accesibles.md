# Investigación individual act 8
## Jesús Emmanuel Cruz Orea
### Animaciones accesibles y optimización de performance

## ¿Cuál es la diferencia entre animaciones CSS y JavaScript?
Las animaciones en la web pueden implementarse principalmente de dos formas: mediante CSS (transiciones y keyframes) o mediante JavaScript (manipulando estilos en cada frame o usando APIs como requestAnimationFrame). La diferencia fundamental entre ambas radica en el nivel de control, complejidad y forma en que el navegador las ejecuta.

Las animaciones CSS son declarativas: el desarrollador define estados iniciales y finales y el navegador calcula automáticamente los fotogramas intermedios. Esto significa que el navegador conoce desde el inicio cómo será la animación, lo que facilita optimizaciones internas. Por ejemplo, puede ejecutarlas fuera del hilo principal o en la GPU cuando se animan propiedades como transform u opacity. Por ello, generalmente se recomienda usar CSS para animaciones simples de interfaz, como hover, transiciones de botones o entradas/salidas de elementos.

En cambio, las animaciones con JavaScript son imperativas: el desarrollador controla cada paso de la animación mediante código. Con APIs como requestAnimationFrame, el navegador llama a una función antes de cada repintado para actualizar estilos o dibujar en canvas. Esto permite crear animaciones altamente dinámicas, interactivas o dependientes de datos en tiempo real, como arrastrar elementos, simulaciones físicas o animaciones basadas en scroll avanzado.

En términos de rendimiento, los navegadores modernos han reducido la diferencia entre ambas técnicas. En muchos casos, CSS y JavaScript alcanzan resultados similares porque ambos recalculan estilos antes del repintado. Sin embargo, CSS suele ser preferible porque evita la sobrecarga de JavaScript y reduce el tamaño del bundle. Además, reemplazar librerías JS de animación por soluciones nativas CSS puede mejorar los FPS y reducir peso de la página.

## ¿Cuándo una animación mejora la experiencia y cuándo la perjudica?
Las animaciones mejoran la experiencia de usuario cuando cumplen una función comunicativa, orientadora o de retroalimentación. Por ejemplo, animar la aparición de un modal ayuda a comprender que un elemento emergió sobre la interfaz; una transición entre pantallas indica continuidad; un botón que cambia suavemente de estado comunica interacción exitosa. En estos casos, la animación reduce carga cognitiva porque explica visualmente lo que ocurre en la interfaz.

También son útiles para guiar la atención del usuario. Micro-animaciones en formularios, indicadores de carga o validaciones ayudan a entender procesos del sistema. Por ejemplo, una barra de progreso animada reduce la percepción de espera y mejora la satisfacción del usuario, aun cuando el tiempo real no cambie.

Sin embargo, las animaciones perjudican la experiencia cuando son excesivas, innecesarias o distractoras. Movimientos continuos, parallax exagerado o transiciones largas pueden dificultar la lectura y el enfoque. Además, ciertos movimientos pueden provocar mareo, náuseas o desorientación en personas con sensibilidad vestibular o neurológica.

También afectan negativamente cuando ralentizan la interacción: animaciones largas en menús o navegación retrasan la tarea del usuario. En UX moderna se recomienda que las animaciones funcionales duren generalmente entre 100 ms y 300 ms para mantener fluidez perceptiva.

## ¿Qué es prefers-reduced-motion y por qué es importante?
prefers-reduced-motion es una media query de CSS que detecta si el usuario ha indicado en su sistema operativo que prefiere reducir animaciones o movimientos en interfaces digitales. Permite adaptar la experiencia web para personas sensibles al movimiento, desactivando o simplificando animaciones.

Tiene dos valores principales:

no-preference: el usuario no expresó preferencia

reduce: el usuario desea menos movimiento

Cuando el valor es reduce, el sitio debería minimizar animaciones no esenciales o eliminarlas. Esto es crucial porque ciertos movimientos visuales pueden desencadenar problemas como vértigo, migrañas o convulsiones en personas con trastornos vestibulares o neurológicos.

Además, respetar esta preferencia también beneficia a usuarios con dispositivos de bajo rendimiento o batería limitada, ya que reducir animaciones disminuye consumo de recursos.

Por ello, prefers-reduced-motion es importante por tres razones principales:

- Accesibilidad: protege a usuarios con sensibilidad al movimiento.

- Inclusión: adapta la interfaz a preferencias del usuario.

- Rendimiento: reduce carga gráfica en dispositivos limitados.

En diseño accesible moderno, ignorar esta preferencia se considera una mala práctica.

## ¿Cómo afectan las animaciones al rendimiento de una aplicación web?
Las animaciones impactan directamente en el rendimiento porque obligan al navegador a recalcular estilos, layouts y repintados en cada frame. Si la animación no está optimizada, puede causar caída de FPS, consumo de CPU/GPU y sensación de lentitud.

El impacto depende principalmente de qué propiedades se animan. Propiedades como transform y opacity suelen ejecutarse en la capa de composición (GPU), evitando recalcular layout. En cambio, animar width, height, top o left fuerza reflow y repaint, operaciones costosas que degradan rendimiento.

También influye el uso de JavaScript. Grandes librerías de animación aumentan el tamaño del bundle, el tiempo de descarga y el procesamiento. Estudios muestran que gran parte del JavaScript en páginas web es innecesario y su eliminación mejora velocidad de carga y experiencia del usuario.

Asimismo, reemplazar animaciones JS por soluciones CSS nativas reduce peso y mejora FPS promedio, además de disminuir tiempo hasta interacción.

Otro factor es la cantidad de elementos animados simultáneamente. Muchas animaciones concurrentes saturan el hilo principal o la GPU, generando “jank” (tirones). Por eso, el rendimiento depende de:

- número de elementos animados

- propiedades animadas

- técnica (CSS vs JS)

- complejidad visual

- hardware del usuario

## ¿Qué errores comunes existen al animar interfaces?
Existen varios errores frecuentes en el uso de animaciones en interfaces web, relacionados con accesibilidad, rendimiento y diseño.

Un error común es animar propiedades que provocan reflow, como width o position, en lugar de usar transform. Esto genera repintados costosos y baja fluidez.

Otro error es usar animaciones innecesarias o excesivas. Interfaces con movimiento constante distraen al usuario y dificultan tareas. El objetivo de la animación debe ser comunicar, no decorar.

También es frecuente ignorar la preferencia prefers-reduced-motion. No respetar esta configuración puede causar problemas de salud en usuarios sensibles al movimiento y hace la interfaz inaccesible.

Otro problema es la duración incorrecta. Animaciones muy largas ralentizan interacción; muy cortas se perciben bruscas. El equilibrio es clave para la percepción de naturalidad.

Además, muchos desarrolladores abusan de librerías JavaScript pesadas para animaciones simples que podrían hacerse con CSS, aumentando el tamaño del sitio y reduciendo rendimiento.

Un error conceptual es no mantener coherencia espacial. Animaciones que mueven elementos sin lógica (por ejemplo, aparecer desde direcciones aleatorias) rompen el modelo mental del usuario y generan confusión.