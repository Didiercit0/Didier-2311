# SnailPay

Servicio de pagos ficticios, recibe solicitudes de recarga y devuelve resultados normalizados de aprobación, rechazo, error del sistema o timeout.


## Instalación y ejecución

Desde la raíz, en PowerShell:

```powershell
cd SnailPay
npm ci
$env:SNAILPAY_MODE = "normal"
npm run dev
```

El servicio inicia en `http://127.0.0.1:4001`.

Para compilar y ejecutar sin nodemon:

```powershell
npm run build
npm start
```

`npm start` ejecuta `dist/index.js` y carga `.env` si existe. Las variables ya definidas en la terminal tienen prioridad. Si cambias una variable o el archivo `.env`, reinicia el proceso.

## Variables

| Variable | Valor predeterminado | Descripción |
| --- | --- | --- |
| `SNAILPAY_PORT` | `4001` | Puerto HTTP |
| `SNAILPAY_MODE` | `normal` | normal, system_error o timeout |
| `SNAILPAY_TIMEOUT_DELAY_MS` | `6500` | Espera del modo timeout |

Ejemplo de un archivo `.env` opcional en este directorio:

```dotenv
SNAILPAY_PORT=4001
SNAILPAY_MODE=normal
SNAILPAY_TIMEOUT_DELAY_MS=6500
```

El archivo `.env` está excluido de Git. No se requieren claves ni credenciales de servicios externos.

## Organización

```text
src/
  index.ts                 Variables de entorno e inicio del servidor
  app.ts                   Creación y composición de Express
  config/                  Opciones y configuración de simulación
  routes/                  Rutas de pagos y salud
  controllers/             Adaptación de solicitudes y respuestas HTTP
  validators/              Validación de los datos del pago
  application/             Reglas del cobro simulado
  domain/                  Tipos, constantes y construcción de respuestas
  middlewares/             Errores y rutas inexistentes
test/                      Pruebas unitarias y de integración
```

`createSnailPayApp` permite iniciar el servicio con opciones explícitas, por ejemplo desde las pruebas, sin leer variables de entorno ni abrir un puerto al importar el módulo.

## Contrato HTTP

### GET /health

Devuelve HTTP 200:

```json
{
  "service": "SnailPay",
  "simulated": true,
  "mode": "normal"
}
```

El campo `mode` indica el modo con que se inició el proceso.

### POST /payments

Envía `Content-Type: application/json`. Todos los campos son obligatorios:

```json
{
  "cardNumber": "1234123412341234",
  "expirationDate": "12/26",
  "cvv": "543",
  "fullName": "Socio de prueba",
  "amount": 25.5,
  "payerId": "usuario-demo-1",
  "payerEmail": "socio@example.com"
}
```

| Campo | Regla |
| --- | --- |
| cardNumber | String de 16 dígitos y tarjeta admitida por el simulador |
| expirationDate | String MM/YY; el escenario aprobado usa 12/26 |
| cvv | String de 3 o 4 dígitos; el escenario aprobado usa 543 |
| fullName | Nombre no vacío |
| amount | Número finito entre 0.01 y 100000, con máximo dos decimales |
| payerId | Identificador no vacío |
| payerEmail | Correo con formato válido |

El frontend obtiene `payerId` y `payerEmail` de su cuenta activa. El API recibe esos valores en el body porque es una simulación.

### Respuesta de ejemplo aprobada

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "status": "approved",
  "status_detail": "accredited",
  "transaction_amount": 25.5,
  "date_created": "2026-10-03T12:00:00.000Z",
  "authorization_code": "TEST-A1B2C3D4",
  "reference": "SNAIL-11111111-1111-4111-8111-111111111111",
  "payer_id": "usuario-demo-1",
  "payer_email": "socio@example.com",
  "card_number": "1234123412341234",
  "cvv": "543"
}
```

ID, referencia, fecha y autorización son ejemplos; el servicio genera valores nuevos por operación.

| Campo | Formato y significado |
| --- | --- |
| id | UUID de la operación |
| status | approved, rejected o error |
| status_detail | Detalle estable del resultado |
| transaction_amount | Monto numérico recibido; 0 si falta o no es un número finito |
| date_created | Fecha ISO 8601 en UTC |
| authorization_code | TEST- seguido de 8 caracteres hexadecimales en una aprobación; null en otros resultados |
| reference | SNAIL- seguido del ID |
| payer_id | Identificador recibido; string vacío si falta |
| payer_email | Correo recibido; string vacío si falta |
| card_number | Tarjeta ficticia recibida de 16 dígitos; null si no tiene ese formato |
| cvv | CVV ficticio recibido de 3 o 4 dígitos; null si no tiene ese formato |

Los mismos campos se incluyen en las respuestas normalizadas de error y rechazo. Los datos malformados no se inventan: se usan los valores de sustitución indicados arriba. El servicio no incluye un campo `message`; los mensajes comprensibles se construyen en el frontend.

### Códigos HTTP y detalles

| HTTP | status | status_detail | Condición |
| --- | --- | --- | --- |
| 200 | approved | accredited | Datos de aprobación válidos |
| 400 | rejected | invalid_data | Body, identidad, nombre o monto inválidos; JSON malformado |
| 400 | rejected | invalid_card | Tarjeta malformada o no admitida |
| 400 | rejected | invalid_expiration | Vencimiento malformado |
| 400 | rejected | invalid_cvv | CVV malformado |
| 402 | rejected | card_declined | Tarjeta de rechazo |
| 402 | rejected | insufficient_funds | Tarjeta sin fondos |
| 402 | rejected | expired_card | Vencimiento 01/20 |
| 402 | rejected | invalid_expiration | Fecha de formato válido distinta de 12/26 y 01/20 |
| 402 | rejected | invalid_cvv | CVV de formato válido distinto de 543 |
| 503 | error | system_unavailable | Modo system_error |
| 504 | error | gateway_timeout | Modo timeout, al finalizar la espera |
| 404 | error | route_not_found | Ruta inexistente |
| 413 | rejected | request_too_large | JSON superior al límite de 10 KB |
| 500 | error | system_unavailable | Error interno inesperado |

Se usa 400 para una solicitud inválida y 402 para un rechazo de la simulación de pago con datos de formato válido. Los fallos del servicio y la espera excesiva utilizan 503 y 504, respectivamente. Nunca se genera autorización en los resultados no aprobados.

## Escenarios reproducibles

En modo `normal`, conserva nombre, identidad y monto válidos. Cambia únicamente el dato de la fila que quieras probar.

| Escenario | cardNumber | expirationDate | cvv | Resultado |
| --- | --- | --- | --- | --- |
| Aprobación | 1234123412341234 | 12/26 | 543 | 200, accredited |
| Tarjeta rechazada | 4000000000000002 | 12/26 | 543 | 402, card_declined |
| Fondos insuficientes | 4000000000009995 | 12/26 | 543 | 402, insufficient_funds |
| Tarjeta inválida | 1111111111111111 | 12/26 | 543 | 400, invalid_card |
| Tarjeta vencida | 1234123412341234 | 01/20 | 543 | 402, expired_card |
| Otra fecha | 1234123412341234 | 11/26 | 543 | 402, invalid_expiration |
| CVV incorrecto | 1234123412341234 | 12/26 | 000 | 402, invalid_cvv |
| Datos inválidos | 1234123412341234 | 12/26 | 543 | amount igual a 0, negativo o con más de dos decimales: 400, invalid_data |

La fecha 12/26 es un dato fijo de prueba; no se compara con el reloj actual.

### Error del sistema

Detén el proceso con Ctrl+C y reinícialo:

```powershell
$env:SNAILPAY_MODE = "system_error"
npm run dev
```

Las solicitudes de pago con JSON procesable devuelven 503 y `system_unavailable`, incluso con los datos de aprobación. No se autoriza ningún cobro. Los errores de parsing del body se manejan antes del controlador.

### Timeout

```powershell
$env:SNAILPAY_MODE = "timeout"
$env:SNAILPAY_TIMEOUT_DELAY_MS = "6500"
npm run dev
```

El servicio responde 504 con `gateway_timeout` después de la espera configurada si la conexión continúa abierta. El frontend tiene un límite de 5 segundos y normalmente aborta antes; en ese caso muestra timeout y no almacena una respuesta que no recibió.

Para volver al comportamiento normal:

```powershell
$env:SNAILPAY_MODE = "normal"
npm run dev
```

Detén siempre el proceso anterior antes de reiniciar con otro modo.


## Pruebas

Desde la carpeta de SnailPay:

```powershell
npm test
npm run test:watch
```

`npm test` compila fuentes y pruebas en `.test-dist/` y ejecuta `node --test`. No se necesita un servidor ya iniciado: las pruebas HTTP crean servidores temporales y los cierran al terminar.

La última verificación obtuvo 32 pruebas aprobadas:

- Validación de campos, monto y datos ficticios.
- Aprobación y rechazos de tarjeta, fecha, CVV y fondos.
- Modos system_error y timeout.
- Construcción de todos los campos de respuesta y autorización solo ante aprobación.
- Ruta POST /payments, códigos HTTP, JSON inválido y rutas inexistentes.

Se prueban estas reglas para evitar aprobaciones falsas y conservar un contrato consistente con el cliente. La integración del cliente del frontend con este servicio se ejecuta adicionalmente desde `frontend` con `npm test`.

## Ejecución con Docker

Desde la raíz del repositorio:

```bash
docker compose up --build -d --wait
```

SnailPay queda accesible en http://localhost:4001 y el frontend en http://localhost:8081.

Los modos se configuran mediante `SNAILPAY_MODE` en el entorno de Compose o en el archivo `.env` de la raíz. El `.env` de esta carpeta no se copia ni se carga dentro del contenedor.

Las pruebas siguen ejecutándose desde una terminal dentro de esta carpeta: `npm ci` y `npm test`.
