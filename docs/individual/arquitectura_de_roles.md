# Investigación individual act 9
## Jesús Emmanuel Cruz Orea
### Arquitectura de autenticación y control de roles

## ¿Qué es autenticación y en qué se diferencia de autorización?
La autenticación es el proceso mediante el cual un sistema verifica la identidad de un usuario o entidad que intenta acceder a un recurso o servicio. En otras palabras, consiste en comprobar que la persona realmente es quien dice ser. Este proceso normalmente se realiza mediante credenciales como nombre de usuario y contraseña, aunque también puede incluir métodos más avanzados como autenticación biométrica (huella digital, reconocimiento facial), códigos enviados al teléfono o autenticación multifactor (MFA). El objetivo principal de la autenticación es evitar que personas no autorizadas accedan a sistemas, aplicaciones o datos sensibles.

Por otro lado, la autorización ocurre después de que la autenticación ha sido completada exitosamente. Una vez que el sistema ya verificó la identidad del usuario, la autorización determina qué acciones puede realizar ese usuario dentro del sistema. Por ejemplo, en una plataforma web un usuario puede autenticarse correctamente con su cuenta, pero dependiendo de su rol puede tener diferentes permisos: un administrador puede modificar o eliminar información, mientras que un usuario normal sólo puede visualizarla.

La diferencia principal entre ambos conceptos radica en su propósito dentro del control de acceso. La autenticación responde a la pregunta “¿Quién eres?”, mientras que la autorización responde a “¿Qué puedes hacer?”. En los sistemas modernos de software, ambos procesos trabajan juntos para garantizar la seguridad. Primero se valida la identidad del usuario (autenticación) y después se verifica si tiene los permisos necesarios para realizar determinadas acciones (autorización).

## ¿Qué son JWT, sesiones y OAuth?
Los tokens JWT, las sesiones y OAuth son mecanismos o métodos utilizados para gestionar la autenticación y el acceso en aplicaciones web o sistemas distribuidos.

Los JSON Web Token (JWT) son un tipo de token utilizado para transmitir información de forma segura entre dos partes en formato JSON. Este token contiene información codificada que puede incluir datos del usuario, roles o permisos. Los JWT se utilizan comúnmente en aplicaciones modernas, especialmente en APIs y arquitecturas basadas en microservicios. Su funcionamiento consiste en que, después de que el usuario inicia sesión, el servidor genera un token firmado digitalmente que el cliente guarda (normalmente en el navegador o aplicación). Posteriormente, cada vez que el usuario realiza una petición al servidor, envía ese token para demostrar su identidad. Una ventaja importante de los JWT es que son stateless, es decir, el servidor no necesita almacenar la sesión del usuario porque toda la información necesaria está dentro del token.

Las sesiones son otro método tradicional para manejar la autenticación. En este caso, cuando el usuario inicia sesión correctamente, el servidor crea una sesión y guarda la información del usuario en memoria o en una base de datos. Después se envía al cliente un identificador de sesión (generalmente en una cookie). Cada vez que el usuario realiza una solicitud al servidor, ese identificador se envía nuevamente y el servidor lo usa para recuperar la información almacenada de la sesión. Este método es muy común en aplicaciones web tradicionales porque permite controlar fácilmente el estado de los usuarios y cerrar sesiones cuando sea necesario.

Por su parte, OAuth 2.0 es un protocolo de autorización que permite a una aplicación acceder a recursos de otra aplicación en nombre del usuario sin compartir directamente las credenciales. Un ejemplo común ocurre cuando una página permite iniciar sesión utilizando una cuenta de Google, Facebook o GitHub. En este proceso, el usuario se autentica en el proveedor externo y este devuelve un token que permite a la aplicación acceder a ciertos datos del usuario, como su nombre o correo electrónico. OAuth se utiliza ampliamente para integración entre servicios y autenticación delegada.

## ¿Cuándo conviene usar tokens y cuándo sesiones?
La elección entre utilizar tokens o sesiones depende principalmente del tipo de aplicación, su arquitectura y los requisitos de escalabilidad.

El uso de sesiones suele ser más adecuado para aplicaciones web tradicionales donde el servidor mantiene un estado constante de los usuarios conectados. Por ejemplo, sistemas internos de empresas, paneles administrativos o plataformas donde el número de usuarios concurrentes no es extremadamente alto. Las sesiones permiten controlar fácilmente aspectos como el cierre de sesión, la expiración automática o la invalidación inmediata de accesos. Además, al almacenar la información en el servidor, es posible modificar permisos o bloquear usuarios en tiempo real.

En cambio, los tokens, especialmente los JWT, son más convenientes en arquitecturas modernas como APIs REST, microservicios y aplicaciones móviles. Esto se debe a que los tokens permiten manejar autenticación de forma sin estado, lo que facilita la escalabilidad del sistema. Como el servidor no necesita almacenar la sesión del usuario, múltiples servidores pueden procesar solicitudes sin necesidad de compartir una base de datos de sesiones. Esto es especialmente útil en sistemas distribuidos o aplicaciones que requieren manejar miles o millones de usuarios simultáneamente.

En términos generales, las sesiones suelen utilizarse cuando se necesita mayor control directo del estado del usuario, mientras que los tokens son preferidos cuando se busca escalabilidad, independencia del servidor y facilidad para integraciones con APIs.

## ¿Qué riesgos de seguridad existen en un mal diseño de autenticación?
Un mal diseño de los sistemas de autenticación puede generar graves vulnerabilidades de seguridad que permiten a atacantes acceder a información sensible o comprometer completamente una aplicación. Uno de los riesgos más comunes es el uso de contraseñas débiles o almacenamiento inseguro de credenciales. Si las contraseñas se almacenan en texto plano o sin utilizar algoritmos de hash seguros, un atacante que obtenga acceso a la base de datos podría ver las contraseñas de todos los usuarios.

Otro riesgo frecuente es la falta de protección contra ataques de fuerza bruta. Si el sistema permite intentar iniciar sesión indefinidamente sin límites ni bloqueos temporales, un atacante podría probar miles de combinaciones de contraseñas hasta encontrar la correcta. Para prevenir esto se suelen implementar medidas como limitación de intentos, CAPTCHA o autenticación multifactor.

También existe el riesgo de robo de sesiones o tokens. Si los tokens o cookies de sesión no están protegidos correctamente (por ejemplo, mediante HTTPS, cookies seguras o políticas de seguridad adecuadas), un atacante podría interceptarlos y utilizarlos para hacerse pasar por el usuario legítimo. Este tipo de ataque se conoce como session hijacking.

Otro problema importante es la mala implementación de la autorización. Incluso si la autenticación funciona correctamente, si el sistema no valida correctamente los permisos de cada usuario, alguien podría acceder a funciones que no le corresponden, como eliminar datos, ver información privada o modificar configuraciones del sistema.

Finalmente, una mala gestión del tiempo de expiración de tokens o sesiones también puede generar problemas de seguridad. Si una sesión nunca expira o los tokens son válidos por demasiado tiempo, un atacante que obtenga uno podría utilizarlo durante largos periodos sin ser detectado.

## ¿Cómo se definen roles y permisos en sistemas reales?
En sistemas reales, los roles y permisos se utilizan para controlar qué acciones puede realizar cada usuario dentro de una aplicación. Este modelo se conoce comúnmente como control de acceso basado en roles (RBAC). En este enfoque, en lugar de asignar permisos individuales a cada usuario, se crean roles que agrupan diferentes permisos, y luego esos roles se asignan a los usuarios.

Por ejemplo, en un sistema de gestión de inventario o una plataforma administrativa pueden existir roles como administrador, editor y usuario. El administrador puede tener permisos para crear, modificar y eliminar información del sistema. El editor puede modificar datos pero no eliminarlos, mientras que el usuario sólo puede visualizar la información. De esta manera, el sistema mantiene una estructura clara y fácil de administrar.

En términos técnicos, los roles y permisos suelen almacenarse en una base de datos mediante varias tablas relacionadas. Normalmente existe una tabla de usuarios, una tabla de roles, otra tabla de permisos y una o más tablas intermedias que relacionan usuarios con roles y roles con permisos. Cuando un usuario inicia sesión, el sistema consulta qué roles tiene asignados y qué permisos están asociados a esos roles. Con base en esa información se determina si el usuario puede acceder a determinadas funciones o recursos.

En aplicaciones más complejas también se utilizan modelos más avanzados como ABAC (Attribute-Based Access Control), donde los permisos se definen no sólo por el rol, sino también por atributos adicionales como el departamento del usuario, la ubicación, el horario o el tipo de recurso al que intenta acceder.

La correcta definición de roles y permisos es fundamental para mantener la seguridad y organización del sistema, ya que permite limitar el acceso a la información sensible y garantizar que cada usuario sólo pueda realizar las acciones necesarias para su función dentro de la aplicación.