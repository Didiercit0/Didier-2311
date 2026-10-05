# Frontend de CaracolClub

Para registro e inicio de sesión local, dashboard, recargas ficticias y consulta del historial.

Consulta el [README general](../README.md) para ejecutar toda la aplicación y el [README de SnailPay](../SnailPay/README.md) para reproducir los escenarios del API.

## Instalar y ejecutar

Desde la raíz del repositorio, en PowerShell:

```powershell
npm --prefix ./SnailPay ci
cd Frontend
npm ci
npm run dev
```

Requisitos verificados: Node.js 24.12 y npm 11.6.2. Abre la URL indicada por Vite, normalmente `http://localhost:5173`. Si ese puerto está ocupado, Vite utiliza otro.

SnailPay debe ejecutarse en otra terminal para las recargas. El registro, login y dashboard funcionan localmente sin ese servicio; si no está disponible, una recarga informa el error y conserva el saldo.

## Rutas y flujo

| Ruta | Comportamiento |
| --- | --- |
| `#/login` | Iniciar sesión con la cuenta registrada |
| `#/registro` | Crear una cuenta local y regresar al login  |
| `#/dashboard` | Mostrar el dashboard únicamente con sesión válida |

Un usuario sin sesión que intenta acceder al dashboard regresa al login. Con sesión activa se muestra el dashboard. No hay credenciales de demostración precargadas: primero se debe registrar una cuenta.

## Organización

```text
src/
  components/
    atoms/          Iconos, botones, badges y marcas
    molecules/      Campos, mensajes, gráficas y montos rápidos
    organisms/      Formularios, recarga, historial y secciones del dashboard
    templates/      Estructuras de autenticación y dashboard
  pages/            Login, registro y dashboard
  hooks/            Estado de formularios, navegación y sesión
  domain/           Tipos, rutas y datos simulados de carreras
  lib/              Validadores, formato y mensajes de pago
  services/         Autenticación local y cliente de SnailPay
  assets/           Logo e imágenes
test/               Pruebas unitarias y de integración
```

La organización sigue Atomic Design para las piezas visuales. La validación y el almacenamiento permanecen fuera de los componentes de presentación.

## Cuenta y sesión

El registro requiere nombre, correo, contraseña, confirmación y marcar el aviso «Entiendo que las carreras y los pagos son simulados». Se valida formato de correo, campos obligatorios, coincidencia de contraseñas y longitudes. La cuenta comienza con saldo cero.

| Clave de LocalStorage | Contenido |
| --- | --- |
| `caracolclub.account.v1` | Cuenta serializada: versión, ID, nombre, correo, saldo, salt, hash y pagos cuando existen |
| `caracolclub.session.v1` | ID de la cuenta con sesión activa |

La contraseña se deriva con PBKDF2/SHA-256, 210,000 iteraciones, salt aleatorio de 16 bytes y resultado de 256 bits. Salt y hash se guardan como cadenas hexadecimales. No se guardan contraseña original ni confirmación.

La sesión siempre se conserva en LocalStorage, el logout elimina la sesión y conserva la cuenta, saldo e historial.

Las lecturas validan los datos del almacenamiento. Las escrituras fallidas muestran mensajes comprensibles. 



## Dashboard

Muestra nombre, saldo, acciones de recarga y logout, donut de 18 apuestas ganadas y 12 perdidas, barras de victorias por caracol y tabla de seis carreras.

Los caracoles son Rayo Lento, Doña Babosa, Pasito, Capitán Baba, Relámpago y Sir Espiral. Sus victorias son 2, 1, 1, 0, 1 y 1; se calculan de los resultados y suman seis.

Las gráficas incluyen descripciones accesibles. La distribución se adapta a pantallas pequeñas. La tabla y los dividendos son simulados y no modifican el saldo.

## Recarga y persistencia

El modal permite elegir $100, $250, $500 o $1,000 como accesos rápidos, o ingresar un monto personalizado. Los montos rápidos son una comodidad adicional de la interfaz; no restringen la recarga.

La validación admite montos entre $0.01 y $100,000 con máximo dos decimales, tarjeta ficticia de 16 dígitos, vencimiento MM/YY, CVV ficticio de 3 o 4 dígitos y nombre no vacío de hasta 100 caracteres.

`topUp` toma `payerId` y `payerEmail` de la sesión activa. El formulario no permite editarlos. SnailPay es un mock y no verifica un token de autenticación.

- Usa fetch con AbortController y timeout de 5 segundos.
- Verifica los campos de respuesta y su coincidencia con usuario, monto, tarjeta y CVV solicitados.
- Aprueba solamente con HTTP exitoso, estado `approved` y código de autorización.
- Traduce rechazo, error y timeout a mensajes para el usuario.
- Guarda respuestas válidas y actualiza el saldo únicamente ante aprobación.
- Guarda tarjeta y CVV ficticios con la respuesta del pago.
- Serializa escrituras y evita duplicar una operación con el mismo ID.
- Notifica el cambio de sesión/cuenta para actualizar inmediatamente el dashboard.
- Bloquea campos, cierre y nuevos envíos mientras la recarga está en curso.

El historial muestra operaciones almacenadas, con las más recientes primero. Si la solicitud falla antes de obtener una respuesta válida, no se crea un registro ficticio.

Datos de aprobación: tarjeta `1234123412341234`, vencimiento `12/26`, CVV `543`. El modal incluye un botón para rellenarlos.

## Configuración

No se necesita un archivo .env para el funcionamiento local predeterminado.

| Variable | Valor predeterminado | Uso |
| --- | --- | --- |
| `SNAILPAY_PROXY_TARGET` | `http://127.0.0.1:4001` | Destino del proxy en dev y preview |
| `VITE_SNAILPAY_URL` | `/snailpay/payments` | URL utilizada por el cliente de recargas |

Ejemplo de `.env.local` dentro del frontend si se cambia el puerto de SnailPay:

```dotenv
SNAILPAY_PROXY_TARGET=http://127.0.0.1:4002
VITE_SNAILPAY_URL=/snailpay/payments
```

Reinicia Vite después de cambiar variables. Las variables `VITE_*` forman parte del frontend compilado y no deben contener secretos.

No configures una URL de otro origen sin un proxy o CORS apropiado: SnailPay no configura CORS. El proxy local evita esa necesidad.

## Pruebas y verificación

Instala primero las dependencias de ambos proyectos. Desde el frontend:

```powershell
npm test
npm run test:watch
npm run test:types
npm run build
npm run lint
```

`npm test` compila SnailPay y ejecuta Vitest una vez. `test:watch` compila SnailPay al iniciar y observa las pruebas del frontend; si modificas SnailPay durante esa ejecución, reinicia el comando para recompilarlo.

En la última verificación se aprobaron 101 pruebas en 13 archivos. Se utiliza React Testing Library con jsdom, criptografía real de Node y almacenamiento del entorno simulado.

| Área | Qué se comprueba |
| --- | --- |
| Autenticación | Validación, hash y salt, duplicados, login, persistencia, logout y errores de almacenamiento |
| Formularios | Etiquetas y errores accesibles, callbacks, confirmación, navegación y carga |
| Dashboard | Acceso, nombre y saldo, gráficas, seis caracoles y congruencia de carreras |
| Recarga | Validación, presets, monto personalizado, solicitud, resultados, timeout y bloqueo |
| Persistencia | Incremento exacto, acumulación, ID duplicado, historial y saldo ante errores |
| Integración HTTP | Cliente del frontend conectado a un servidor temporal de SnailPay local |

Los comandos locales están documentados para PowerShell en Windows. Git conserva los directorios `Frontend` y `SnailPay`; los scripts de integración todavía usan `snailpay` en minúsculas. Para ejecutar esas pruebas en Linux se deben unificar esas rutas. La construcción con Docker admite ambas capitalizaciones.

## Compilación y preview

```powershell
npm run build
npm run preview
```

Vite genera `dist/`. Preview permite revisar esa compilación y conserva el proxy configurado; SnailPay debe estar ejecutándose para recargar saldo. Un despliegue estático requiere configurar por separado el acceso al servicio, pues el proxy de Vite no forma parte de los archivos de `dist/`.


## Ejecución con Docker

Desde la raíz del repositorio:

```bash
docker compose up --build -d --wait
```

Abre http://localhost:8081. La imagen final del frontend contiene Nginx y los archivos de `dist`; no contiene Node, dependencias de desarrollo ni pruebas. Nginx dirige `/snailpay/` al servicio SnailPay de la red interna.

Para correr las pruebas, utiliza tu terminal dentro de este proyecto con `npm test`. Instala previamente las dependencias del frontend y SnailPay, pues la suite también compila el API para las pruebas de integración. Los contenedores de ejecución no incluyen herramientas de testing.
