# Control Electoral

Aplicación móvil desarrollada con Ionic Angular y Capacitor para gestionar, registrar y supervisar los resultados del escrutinio electoral de una organización política en Ecuador.

## Información del proyecto

- **Autor:** Justin Francisco Paladines Nole.
- **Asignatura:** Desarrollo de Aplicaciones Móviles.
- **Evaluación:** Prueba 2 - Examen práctico.
- **Grupo:** 7.


## 1. Objetivo

Desarrollar una aplicación móvil que permita administrar recintos electorales, gestionar usuarios según sus responsabilidades, registrar actas de escrutinio y consultar resultados electorales, utilizando mecanismos de autenticación, validación de datos, seguridad, captura de fotografías y geolocalización.

## 2. Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| Ionic | Desarrollo de la interfaz móvil. |
| Angular Standalone | Componentes, páginas y navegación. |
| TypeScript | Lógica de programación. |
| Reactive Forms | Formularios y validaciones. |
| Angular Signals | Manejo de estados de la aplicación. |
| Capacitor | Integración con funcionalidades nativas. |
| Capacitor Camera | Captura de fotografías de las actas. |
| Capacitor Geolocation | Obtención de coordenadas GPS. |
| Supabase Auth | Autenticación y recuperación de contraseñas. |
| PostgreSQL | Almacenamiento de información electoral. |
| Supabase Storage | Almacenamiento de fotografías. |
| Supabase Edge Functions | Operaciones de autenticación y creación de usuarios. |
| Row Level Security (RLS) | Control de acceso a los datos. |
| Android Studio | Compilación de la aplicación Android. |
| Git y GitHub | Control de versiones. |

## 3. Funcionalidades

### Coordinador provincial

- Consultar y registrar recintos electorales.
- Crear coordinadores de recinto.
- Asignar un coordinador a cada recinto.
- Consultar el avance del escrutinio electoral.
- Visualizar las actas registradas.
- Consultar fotografías y coordenadas GPS.
- Visualizar resultados por candidato y organización política.
- Filtrar resultados por recinto y dignidad electoral.
- Consultar resultados consolidados.

### Coordinador de recinto

- Consultar la información de su recinto.
- Generar las juntas receptoras del voto.
- Consultar el estado de las juntas.
- Registrar veedores de mesa.
- Asignar y reasignar veedores.
- Retirar asignaciones.
- Consultar las actas de su recinto.
- Corregir los votos registrados.
- Consultar y actualizar las evidencias fotográficas.

### Veedor de mesa

- Consultar únicamente su junta asignada.
- Registrar actas de alcaldía y prefectura.
- Registrar votos de cinco organizaciones políticas por dignidad.
- Registrar votos nulos, blancos y total de sufragantes.
- Validar la consistencia de los resultados.
- Consultar y corregir actas.
- Capturar fotografías mediante la cámara del dispositivo.
- Verificar visualmente la legibilidad de las fotografías.
- Obtener coordenadas GPS.
- Guardar las actas y sus evidencias.

### Autenticación

- Inicio de sesión mediante cédula y contraseña.
- Validación de cédula ecuatoriana.
- Creación de cuentas según la jerarquía de usuarios.
- Confirmación de cuentas mediante código enviado al correo electrónico.
- Cambio obligatorio de contraseña inicial.
- Recuperación de contraseña mediante código de verificación.
- Protección de rutas según el rol.
- Cierre de sesión.

La aplicación no permite el autorregistro de usuarios.

## 4. Arquitectura

El proyecto utiliza una arquitectura por capas que permite separar la interfaz gráfica, la lógica de negocio y el acceso a los datos.

El flujo principal de comunicación es:

**Páginas → Servicios → Repositorios → Supabase**

### Estructura del proyecto

```
control-electoral/
├── android/
├── docs/
│   ├── adr/
│   ├── evidencias/
│   └── uso-ia.md
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── data/
│   │   │   ├── guards/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   └── validators/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── provincial/
│   │   │   ├── recinto/
│   │   │   └── veedor/
│   │   └── app.routes.ts
│   └── environments/
├── supabase/
│   └── functions/
│       ├── crear-usuario/
│       └── login-cedula/
├── capacitor.config.ts
├── package.json
└── README.md
```

### Responsabilidades de las capas

| Capa | Responsabilidad |
|---|---|
| Pages | Presentar información y recibir las acciones del usuario. |
| Services | Gestionar la lógica de negocio, validaciones y estados. |
| Repositories | Realizar consultas y operaciones con Supabase. |
| Models | Definir la estructura de los datos mediante interfaces y tipos. |
| Validators | Implementar validaciones reutilizables. |
| Guards | Controlar el acceso a las rutas según la sesión y el rol. |
| Backend | Almacenar información y aplicar las reglas de seguridad. |

### Manejo de estados

Se utilizan Angular Signals para gestionar información como:

- Usuario autenticado.
- Recintos electorales.
- Coordinadores y veedores.
- Juntas receptoras del voto.
- Asignaciones.
- Actas y resultados.
- Estados de carga.
- Mensajes de error y confirmación.

Esto permite actualizar la interfaz cuando cambia la información de la aplicación.

## 5. Modelo de datos

La base de datos se encuentra implementada en PostgreSQL mediante Supabase.

### Tablas principales

| Tabla | Descripción |
|---|---|
| perfiles | Información personal, rol y recinto asignado de los usuarios. |
| recintos | Información de los recintos electorales. |
| jrv | Juntas receptoras del voto y sus estados. |
| asignaciones_veedor | Relación entre los veedores y las juntas asignadas. |
| organizaciones | Organizaciones políticas participantes. |
| candidaturas | Candidatos asociados a una organización y dignidad. |
| actas | Información general de las actas, fotografía y ubicación GPS. |
| acta_resultados | Cantidad de votos obtenidos por cada candidatura. |

### Relaciones principales

- Un recinto contiene varias juntas receptoras del voto.
- Un recinto puede tener varios veedores y un coordinador de recinto.
- Una asignación relaciona un veedor con una junta.
- Una junta puede tener un acta de alcaldía y un acta de prefectura.
- Una organización política puede tener varias candidaturas.
- Cada acta contiene los resultados de las cinco candidaturas correspondientes a su dignidad.
- Cada perfil se encuentra relacionado con un usuario de Supabase Auth.

### Estados de las juntas

- `pendiente`
- `en_proceso`
- `completada`

Una junta se considera completada cuando sus dos actas cuentan con resultados registrados y evidencias.

### Estados de las actas

- `borrador`
- `registrada`
- `corregida`

### Dignidades electorales

- `alcaldia`
- `prefectura`

## 6. Validaciones

La aplicación realiza las siguientes validaciones:

- Cédula ecuatoriana válida.
- Nombres y apellidos obligatorios.
- Número telefónico de diez dígitos.
- Correo electrónico válido.
- Cantidad de juntas mayor que cero.
- Cantidades de votos enteras y no negativas.
- Registro de cinco candidaturas por dignidad.
- Consistencia entre los votos registrados y el total de sufragantes.
- Existencia de una fotografía aceptada.
- Existencia de coordenadas GPS antes de finalizar un acta.

La validación de los resultados electorales utiliza la siguiente relación:

```
Total de sufragantes =
Votos de las cinco candidaturas + Votos nulos + Votos blancos
```

Las operaciones críticas también se validan en el backend para evitar depender únicamente de las restricciones de la interfaz.

## 7. Seguridad

La aplicación utiliza Supabase Auth para gestionar la autenticación y Row Level Security para controlar el acceso a la información.

### Control de acceso

| Rol | Acceso permitido |
|---|---|
| Provincial | Información electoral de todos los recintos. |
| Recinto | Información correspondiente a su recinto asignado. |
| Veedor | Información de su junta asignada activamente. |

### Funciones de seguridad

- `mi_rol()`: obtiene el rol del usuario autenticado.
- `mi_recinto()`: obtiene el recinto asignado al usuario.
- `tengo_jrv()`: verifica si el veedor tiene una asignación activa a una junta.

### Funciones del backend

- `generar_jrv()`: genera las juntas de un recinto.
- `asignar_veedor()`: asigna o reasigna un veedor.
- `retirar_asignacion()`: desactiva una asignación.
- `guardar_acta()`: valida y almacena los resultados electorales.
- `finalizar_acta()`: registra las evidencias y actualiza los estados correspondientes.

### Edge Functions

- `login-cedula`: permite iniciar sesión utilizando la cédula como identificador.
- `crear-usuario`: permite crear usuarios respetando la jerarquía de roles.

Las claves administrativas de Supabase y las credenciales del servicio de correo no se incluyen en el código de la aplicación móvil.

## 8. Instalación y ejecución

### Requisitos previos

- Node.js compatible con las dependencias del proyecto.
- npm.
- Ionic CLI.
- Git.
- Android Studio.
- Android SDK.
- Conexión a internet.
- Proyecto Supabase configurado.

### Clonar el repositorio

```bash
git clone https://github.com/JustinPaladines/APP_Control_electoral.git
```

### Ingresar al proyecto

```bash
cd APP_Control_electoral
```

### Instalar Ionic CLI

En caso de no tenerlo instalado:

```bash
npm install -g @ionic/cli
```

### Instalar las dependencias

```bash
npm install
```

### Ejecutar la aplicación

```bash
ionic serve
```

La aplicación estará en:

```
http://localhost:8100
```

## 9. Configuración de Supabase

La conexión con Supabase se configura en:

```
src/environments/environment.ts
```

Ejemplo de configuración:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'URL_DEL_PROYECTO',
  supabaseKey: 'CLAVE_PUBLICABLE_DE_SUPABASE'
};
```

La clave publicable permite conectar la aplicación con Supabase. El acceso a la información se encuentra limitado mediante las políticas RLS y las funciones del backend.

Para utilizar un proyecto Supabase diferente, se requiere configurar:

- Las ocho tablas del modelo de datos.
- Las relaciones y restricciones de la base de datos.
- Las políticas Row Level Security.
- Las funciones SQL del sistema.
- Las Edge Functions de autenticación y creación de usuarios.
- Los datos iniciales de recintos, organizaciones y candidaturas.
- Una cuenta inicial de coordinador provincial.
- Un bucket privado denominado `actas-electorales`.
- Las políticas de acceso al almacenamiento.
- El servicio SMTP para el envío de correos.
- Las plantillas de confirmación y recuperación mediante códigos OTP.

Las credenciales administrativas y SMTP deben permanecer exclusivamente en la configuración segura del backend.



La aplicación utiliza un backend Supabase previamente configurado. El despliegue de las Edge Functions por sí solo no crea las tablas, políticas ni datos iniciales.

## 10. Generación del APK Android

### Compilar la aplicación

```bash
ionic build
```

### Agregar Android

Este paso únicamente se realiza si la plataforma Android todavía no existe.

```bash
npm install @capacitor/android@8.6.2
npx cap add android
```

### Sincronizar los cambios

```bash
npx cap sync android
```

### Abrir Android Studio

```bash
npx cap open android
```

### Generar el APK desde Windows

```powershell
cd android
.\gradlew.bat assembleDebug
cd ..
```

El archivo APK se genera en:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

El APK generado corresponde a una versión de demostración instalable en dispositivos Android.

## 11. Credenciales de demostración

La aplicación cuenta con usuarios de prueba para los tres roles.

| Rol | Cédula | Contraseña |
|---|---|---|
| Coordinador provincial | 1750926766 | Entregada al docente |
| Coordinador de recinto | 1710034065 | Entregada al docente |
| Veedor de mesa | 1104044167 | Entregada al docente |

La contraseña inicial definida para las nuevas cuentas es `Ecuador2026`. El sistema solicita cambiarla obligatoriamente durante el primer acceso.

## 12. Pruebas realizadas

Durante el desarrollo se realizaron pruebas funcionales en el navegador y en un dispositivo Android.

| Prueba | Resultado |
|---|---|
| Inicio de sesión de los tres roles | Satisfactorio |
| Confirmación de cuenta mediante OTP | Satisfactorio |
| Recuperación de contraseña | Satisfactorio |
| Registro de recintos | Satisfactorio |
| Creación de coordinadores | Satisfactorio |
| Creación de veedores | Satisfactorio |
| Generación de juntas | Satisfactorio |
| Asignación de veedores | Satisfactorio |
| Registro de actas de alcaldía | Satisfactorio |
| Registro de actas de prefectura | Satisfactorio |
| Corrección de actas | Satisfactorio |
| Consulta de resultados electorales | Satisfactorio |
| Captura y almacenamiento de fotografías | Satisfactorio |
| Obtención de coordenadas GPS | Satisfactorio |
| Aislamiento entre veedores desde la interfaz | Satisfactorio |
| Consulta de JRV bajo permisos de un veedor | Satisfactorio |
| Compilación e instalación del APK | Satisfactorio |

### Prueba de aislamiento

Se crearon dos veedores asignados a diferentes juntas receptoras del voto.

Se comprobó desde la aplicación que el segundo veedor no podía consultar las actas correspondientes al primero.

Adicionalmente, se ejecutó una consulta en Supabase simulando los permisos del segundo veedor. La consulta de juntas devolvió únicamente la JRV asignada a dicho usuario.

### Pruebas en Android

Se verificaron satisfactoriamente las siguientes funcionalidades:

1. Instalación del APK.
2. Inicio de sesión como coordinador provincial.
3. Consulta de resultados electorales.
4. Inicio de sesión como coordinador de recinto.
5. Consulta de actas registradas.
6. Inicio de sesión como veedor.
7. Apertura de la cámara nativa.
8. Captura y aceptación de fotografías.
9. Solicitud de permisos de ubicación.
10. Obtención de coordenadas GPS.
11. Almacenamiento de evidencias en Supabase.

Las pruebas realizadas corresponden principalmente a pruebas funcionales manuales.

## 13. Decisiones arquitectónicas (ADR)

Las decisiones arquitectónicas consensuadas por el equipo se encuentran en:

```
docs/adr/
```

| ADR | Decisión |
|---|---|
| ADR-001 | Selección de Ionic Angular. |
| ADR-002 | Arquitectura por capas. |
| ADR-003 | Plugins de cámara y geolocalización. |
| ADR-004 | Selección de Supabase como backend. |
| ADR-005 | Manejo de estados de la aplicación. |
| ADR-006 | Almacenamiento local mediante SQLite. |

Los documentos originales se conservan como evidencia del análisis y consenso grupal en docs/adr

El almacenamiento local mediante SQLite, establecido en el ADR-006, no fue implementado en esta versión individual debido a que corresponde al requisito opcional R10. Se priorizó el desarrollo y las pruebas de las funcionalidades obligatorias.

## 14. Requisitos del examen

| Requisito | Implementación |
|---|---|
| R1 - Datos iniciales | Datos de recintos, organizaciones y candidaturas. |
| R2 - Jerarquía y cuentas | Creación jerárquica de usuarios y confirmación por correo. |
| R3 - Acceso | Autenticación, cambio inicial y recuperación de contraseña. |
| R4 - Coordinador provincial | Gestión de recintos, coordinadores y resultados. |
| R5 - Coordinador de recinto | Gestión de juntas, veedores y corrección de actas. |
| R6 - Veedor | Registro, validación y corrección de actas. |
| R7 - Evidencias | Cámara, comprobación visual de fotografías y GPS. |
| R8 - Backend y seguridad | Supabase, RLS, Storage y Edge Functions. |
| R9 - Arquitectura y experiencia de usuario | Arquitectura por capas, Signals y manejo de estados. |
| R10 - Funcionamiento offline | No implementado; requisito opcional. |

## 15. Evidencias

Las capturas de pantalla y evidencias de funcionamiento se encuentran en:

```
docs/evidencias/
```

Estas evidencias incluyen los paneles de los tres roles, el registro de actas, los resultados electorales, las fotografías, la geolocalización, las pruebas de seguridad y el funcionamiento en Android.

## 16. Uso de inteligencia artificial

Durante el desarrollo individual se utilizó ChatGPT como herramienta de apoyo para:

- Analizar los requisitos del examen.
- Organizar la estructura del proyecto.
- Diseñar consultas y funciones SQL.
- Implementar validaciones.
- Identificar y solucionar errores de compilación.
- Configurar la autenticación.
- Elaborar la correcta redacción de la documentación.

Las propuestas generadas mediante inteligencia artificial fueron revisadas, adaptadas y probadas durante el desarrollo.

El detalle de las consultas realizadas, las propuestas aceptadas, las correcciones y los mecanismos de validación se encuentra en:

[Anexo de uso de inteligencia artificial](docs/uso-ia.md)

## 17. Limitaciones

- La aplicación requiere conexión a internet para realizar operaciones con Supabase.
- No se implementó almacenamiento offline ni sincronización mediante SQLite.
- La nitidez de las fotografías se verifica visualmente por el usuario, sin utilizar algoritmos automáticos de detección de desenfoque.
- La versión actual permite una asignación activa de junta por veedor.
- Las candidaturas utilizadas corresponden a datos de demostración.
- El APK corresponde a una compilación de depuración destinada a la evaluación académica.

