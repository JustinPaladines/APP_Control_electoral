# Anexo individual de uso de inteligencia artificial

**Proyecto:** Aplicación móvil de Control Electoral  
**Estudiante:** Justin Francisco Paladines Nole  

## 1. Herramienta utilizada

Durante el desarrollo de la aplicación se utilizó ChatGPT, como herramienta de apoyo para la programación, comprensión de conceptos, resolución de problemas y elaboración de documentación técnica.

Su utilización permitió complementar los conocimientos adquiridos durante la asignatura, principalmente en Ionic, Angular, TypeScript, Capacitor y Supabase.

## 2. Metodología de trabajo

El desarrollo se realizó de manera progresiva, dividiendo la aplicación en bloques funcionales según los requisitos establecidos en el examen y las decisiones arquitectónicas consensuadas por el equipo.

La metodología utilizada fue la siguiente:

1. Analizar los requisitos de cada funcionalidad.
2. Consultar alternativas de implementación 
3. Revisar las explicaciones y propuestas de código.
4. Adaptar el código al proyecto existente.
5. Ejecutar la aplicación para comprobar su funcionamiento.
6. Identificar y corregir los errores encontrados.
7. Registrar los avances mediante commits en GitHub.
.

## 3. Áreas en las que se utilizó inteligencia artificial

| Área | Apoyo recibido | Participación del estudiante |
|---|---|---|
| Arquitectura | Explicación de la separación por capas. | Organización de archivos según los ADR. |
| Autenticación | Propuestas para el inicio de sesión y recuperación de contraseña. | Configuración y comprobación de las cuentas. |
| Base de datos | Consultas SQL, relaciones, restricciones y funciones. | Ejecución y verificación en Supabase. |
| Seguridad | Explicación de políticas RLS y permisos. | Configuración y pruebas de aislamiento. |
| Interfaces | Propuestas de componentes y estilos. | Integración y ajustes visuales. |
| Formularios | Validaciones mediante Reactive Forms. | Comprobación de datos válidos e inválidos. |
| Manejo de estados | Explicación y aplicación de Angular Signals. | Integración y comprobación de los cambios en la interfaz. |
| Actas electorales | Propuestas para registrar y validar resultados. | Pruebas de registro y corrección de actas. |
| Cámara y GPS | Orientación sobre plugins de Capacitor. | Instalación, configuración y pruebas en Android. |
| Documentación | Organización del README y documentación técnica. | Revisión y adaptación al proyecto desarrollado. |

## 4. Ejemplos de consultas realizadas

Los siguientes ejemplos representan de manera resumida las consultas realizadas durante el desarrollo.

### Consulta 1: Arquitectura del proyecto

**Consulta:**

¿Cómo organizar una aplicación Ionic Angular Standalone mediante la organización por capas (páginas, servicios, repositorios, modelos)respetando la arquitectura del proyecto?

**Aporte de la IA:**

Explicación de las responsabilidades de cada capa y propuestas para organizar la estructura de archivos.

**Aplicación y validación:**

Se organizó el proyecto separando la presentación, la lógica de negocio y el acceso a Supabase. Se comprobó que las páginas pudieran utilizar los servicios sin realizar directamente las operaciones de persistencia.

### Consulta 2: Autenticación mediante cédula

**Consulta:**

¿Cómo implementar el inicio de sesión mediante cédula y contraseña utilizando Supabase Auth, teniendo en cuenta que la autenticación utiliza correos electrónicos?

**Aporte de la IA:**

Propuesta de una Edge Function que identifica el correo asociado a la cédula y realiza la autenticación.

**Aplicación y validación:**

Se configuró la función `login-cedula` y se realizaron pruebas de acceso con los tres roles del sistema.

También se comprobó el cambio obligatorio de contraseña inicial y la navegación hacia el panel correspondiente.

### Consulta 3: Seguridad y asignación de veedores

**Consulta:**

¿Cómo restringir el acceso para que un veedor únicamente pueda consultar la junta receptora del voto que tiene asignada?

**Aporte de la IA:**

Explicación de las políticas Row Level Security y propuestas de funciones SQL para comprobar el rol, recinto y asignaciones activas.

**Aplicación y validación:**

Se utilizaron las funciones `mi_rol()`, `mi_recinto()` y `tengo_jrv()` para controlar el acceso a los datos.

Se crearon dos veedores asignados a diferentes juntas y se comprobó que cada usuario únicamente visualizara la información autorizada.

Adicionalmente, se ejecutó una consulta en Supabase simulando los permisos de un veedor, obteniendo únicamente su junta asignada.

### Consulta 4: Validación de actas electorales

**Consulta:**

¿Cómo comprobar que la suma de los votos de las cinco organizaciones políticas, los votos nulos y los votos blancos coincida con el total de sufragantes?

**Aporte de la IA:**

Propuestas para utilizar formularios reactivos, validaciones numéricas y cálculos automáticos.

**Aplicación y validación:**

Se implementó la comprobación de los resultados tanto en la aplicación como en el backend.

Se registraron actas de alcaldía y prefectura, verificando la consistencia de los valores ingresados y su almacenamiento en Supabase.

### Consulta 5: Resultados electorales

**Consulta:**

¿Cómo consolidar los votos registrados en las actas para presentar resultados por candidatura, organización política, recinto y dignidad electoral?

**Aporte de la IA:**

Propuestas para consultar, agrupar y sumar los resultados electorales, utilizando Angular Signals para actualizar la información presentada.

**Aplicación y validación:**

Se implementó un dashboard provincial que permite consultar los resultados consolidados y aplicar filtros.

Se comprobó que los resultados registrados por los veedores pudieran visualizarse desde el panel provincial.

## 5. Propuestas aceptadas

Durante el desarrollo se aceptaron las siguientes propuestas de implementación:

- Separación de responsabilidades mediante páginas, servicios y repositorios.
- Utilización de Angular Signals para gestionar los estados.
- Validaciones mediante Reactive Forms.
- Uso de Edge Functions para operaciones de autenticación y creación de usuarios.
- Aplicación de políticas RLS para controlar el acceso a los datos.
- Utilización de funciones SQL para validar operaciones electorales.
- Almacenamiento privado de fotografías en Supabase Storage.
- Utilización de códigos OTP para confirmar cuentas y recuperar contraseñas.
- Integración de los plugins Camera y Geolocation de Capacitor.

Estas propuestas se integraron considerando las decisiones arquitectónicas consensuadas y las necesidades de la aplicación.

## 6. Propuestas descartadas o modificadas

No todas las propuestas generadas mediante inteligencia artificial se aplicaron directamente.

| Propuesta inicial | Decisión tomada | Justificación |
|---|---|---|
| Importación mediante IonicModule. | Utilizar importaciones individuales de componentes. | Se presentaron problemas de compatibilidad con la configuración del proyecto. |
| Confirmación y recuperación mediante enlaces. | Utilizar códigos OTP. | Facilita el proceso de verificación dentro de la aplicación móvil. |
| Implementación de almacenamiento local mediante SQLite. | No implementar en esta versión. | Se priorizaron los requisitos obligatorios, debido a que R10 es opcional. |


## 7. Errores identificados y corregidos

Durante la implementación se presentaron diferentes errores que requirieron revisión y corrección.

### Error de importación de componentes Ionic

Se presentaron inconvenientes al importar determinados módulos de Ionic.

La solución consistió en utilizar importaciones individuales de los componentes requeridos por cada página.


### Error de permisos en Supabase

Inicialmente, el registro de recintos generaba un error de acceso.

Se revisaron las políticas RLS y se configuró una política que permite realizar esta operación únicamente al coordinador provincial.

### Problemas de autenticación

Durante las pruebas se presentaron errores relacionados con la confirmación de cuentas y el inicio de sesión.

Se revisaron las funciones del backend, la configuración de autenticación y el envío de correos electrónicos.


## 8. Mecanismos de validación

Para comprobar las propuestas generadas mediante inteligencia artificial se utilizaron los siguientes mecanismos:

- Revisión de la estructura de archivos y responsabilidades de las capas.
- Compilación de la aplicación mediante Ionic.
- Comprobación de errores en la terminal y el navegador.
- Revisión de registros almacenados en Supabase.
- Pruebas de autenticación con diferentes usuarios.
- Pruebas de acceso según los roles establecidos.
- Verificación de las asignaciones de veedores.
- Registro y corrección de actas electorales.
- Comprobación de fotografías y coordenadas almacenadas.
- Pruebas de aislamiento entre usuarios.
- Compilación, instalación y ejecución del APK en Android.

La aplicación fue desarrollada y comprobada progresivamente, evitando considerar una funcionalidad como terminada sin verificar previamente su comportamiento.

## 9. Pruebas realizadas en Android

Se realizaron las siguientes pruebas funcionales utilizando el APK generado:

| Prueba | Resultado |
|---|---|
| Instalación del APK | Satisfactorio |
| Inicio de sesión como coordinador provincial | Satisfactorio |
| Consulta de resultados electorales | Satisfactorio |
| Inicio de sesión como coordinador de recinto | Satisfactorio |
| Consulta de actas registradas | Satisfactorio |
| Inicio de sesión como veedor | Satisfactorio |
| Apertura de la cámara nativa | Satisfactorio |
| Captura y aceptación de fotografías | Satisfactorio |
| Concesión de permisos de ubicación | Satisfactorio |
| Obtención de coordenadas GPS | Satisfactorio |
| Almacenamiento de evidencias en Supabase | Satisfactorio |

Las evidencias de funcionamiento se encuentran en la carpeta `docs/evidencias/` del repositorio.

## 10. Limitaciones identificadas

Durante el desarrollo se identificaron las siguientes limitaciones:

- Las propuestas de inteligencia artificial pueden contener errores de compatibilidad, nombres de campos incorrectos o implementaciones que requieren adaptación.
- La aplicación requiere conexión a internet para comunicarse con Supabase.
- La comprobación de nitidez de las fotografías se realiza visualmente por el usuario.
- Las pruebas realizadas fueron principalmente funcionales y manuales.
- La implementación actual permite una asignación activa de junta por veedor.

Por estas razones, fue necesario revisar las propuestas, realizar pruebas y corregir los errores encontrados durante la implementación.

## 11. Aprendizajes obtenidos

El desarrollo de la aplicación permitió reforzar los conocimientos relacionados con:

- Arquitectura por capas en aplicaciones móviles.
- Componentes Standalone de Angular.
- Formularios reactivos y validaciones.
- Manejo de estados mediante Signals.
- Autenticación y autorización de usuarios.
- Seguridad mediante políticas RLS.
- Integración de servicios externos.
- Utilización de funcionalidades nativas mediante Capacitor.
- Generación de aplicaciones Android.
- Resolución de errores y control de versiones.

La inteligencia artificial facilitó la comprensión de diferentes alternativas de implementación y permitió complementar los conocimientos adquiridos durante la asignatura.

## 12. Conclusión

El uso de inteligencia artificial contribuyó al desarrollo de la aplicación de Control Electoral, proporcionando explicaciones, propuestas de código y orientación para resolver problemas técnicos.

Las soluciones propuestas fueron revisadas y adaptadas al proyecto, considerando los requisitos del examen y las decisiones arquitectónicas establecidas por el equipo.

Las pruebas realizadas en el navegador, Supabase y un dispositivo Android permitieron comprobar el funcionamiento de las principales funcionalidades implementadas.

La experiencia permitió reconocer la importancia de comprender el código generado, verificar sus resultados y mantener un criterio propio durante el desarrollo de aplicaciones móviles.