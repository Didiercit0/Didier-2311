# CaracolClub

Aplicación con temática de carreras de caracoles. Permite registrar una cuenta local, iniciar y cerrar sesión, consultar un dashboard y recargar saldo mediante un servicio de pago simulado, una pasarela ficticia.

Las carreras, las apuestas y los pagos son simulados. Se deben utilizar únicamente tarjetas y CVV ficticios.

## Proyectos

| Proyecto | Responsabilidad | Documentación |
| --- | --- | --- |
| Frontend |  autenticación local, dashboard, recargas e historial | [README del frontend](Frontend/README.md) |
| SnailPay |  validación y respuestas de pagos simulados | [README de SnailPay](SnailPay/README.md) |


## Levantar el proyecto con Docker
Ejecuta desde la raíz de la carpeta "CaracolClub":

```bash
docker compose up --build -d --wait
```

Abre **http://localhost:8081**. El API directo queda en **http://localhost:4001** y su comprobación de salud en **http://localhost:4001/health**.

El comando construye y levanta los dos servicios: Nginx sirve el frontend compilado y SnailPay ejecuta Node con solo dependencias de producción.

```bash
docker compose ps
docker compose logs -f
docker compose down
```

Después de modificar el código, ejecuta de nuevo el comando con `--build`. Esta configuración sirve la aplicación compilada y no incluye recarga automática de desarrollo.


### Configuración opcional

No necesitas configurar variables para iniciar el proyecto con Docker. Si quieres cambiar los puertos o el modo de simulación de SnailPay, puedes crear un archivo .env en la raíz con los siguientes valores:

```dotenv
FRONTEND_PORT=8081
SNAILPAY_HOST_PORT=4001
SNAILPAY_MODE=normal
SNAILPAY_TIMEOUT_DELAY_MS=6500
```

Para simular el error del sistema, cambia `SNAILPAY_MODE` a `system_error` y ejecuta otra vez `docker compose up -d --wait`. Para simular espera excesiva usa `timeout`. Restaura `normal` al terminar.


## Requisitos
- Docker Desktop con Docker Compose y contenedores Linux para levantar el proyecto.
- Node.js 24.12 o posterior de la serie 24 y npm, solo para ejecutarlo sin Docker o correr las pruebas localmente.
- Navegador con LocalStorage habilitado.


## Recorrido funcional

1. Abre el enlace de registro y completa nombre, correo, contraseña y confirmación. La contraseña debe tener entre 8 y 128 caracteres y no contener solamente espacios.
2. Marca el aviso de que las carreras y los pagos son simulados y registra la cuenta. La aplicación regresa al login con una confirmación.
3. Inicia sesión con esos datos. No hay credenciales predefinidas: la cuenta se crea en tu navegador y comienza con saldo de $0.
4. Consulta el nombre, saldo, gráfica donut de apuestas y gráfica de victorias por caracol.
5. Pulsa **Cargar saldo**, ingresa un monto válido y utiliza **Usar datos de prueba**.
6. Confirma la recarga. Si es aprobada, el dashboard actualiza el saldo y el historial muestra la operación.
7. Recarga la página para comprobar la persistencia. Cierra sesión y vuelve a entrar con la misma cuenta.

La cuenta se conserva al cerrar sesión. Para empezar con otra cuenta de demostración, elimina las claves de CaracolClub en el almacenamiento del sitio; esto también elimina el saldo y las transacciones locales.


Repositorio: [Didier-2311](https://github.com/Didiercit0/Didier-2311).