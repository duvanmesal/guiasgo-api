# Auth y Usuarios

Base URL: `http://localhost:3000/api`

## Endpoints

| Metodo | Ruta | Rol | Descripcion |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Publico | Registra usuario y entrega tokens. |
| `POST` | `/auth/login` | Publico | Inicia sesion y entrega tokens. |
| `POST` | `/auth/refresh` | Publico | Renueva access token usando refresh token. |
| `POST` | `/auth/logout` | Autenticado | Revoca refresh token. |
| `POST` | `/auth/select-role` | Autenticado | Cambia el rol activo del usuario. |
| `GET` | `/users/me` | Autenticado | Obtiene usuario autenticado. |
| `PATCH` | `/users/me` | Autenticado | Actualiza datos basicos del usuario. |

## POST /auth/register

Body:

```json
{
  "email": "turista1@guiasgo.test",
  "password": "Password123!",
  "fullName": "Turista Uno",
  "phone": "+573001112233",
  "initialRole": "tourist"
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Email unico | No se permite registrar dos usuarios con el mismo email. |
| Password | Debe cumplir la validacion definida en DTO. Se almacena con Argon2, nunca en texto plano. |
| Rol inicial | Debe ser `tourist` o `guide`; si no se envia, se usa `tourist`. |

Respuesta `201`:

```json
{
  "user": {
    "id": "uuid",
    "email": "turista1@guiasgo.test",
    "fullName": "Turista Uno",
    "phone": "+573001112233",
    "photoUrl": null,
    "status": "active",
    "roles": ["tourist"],
    "activeRole": "tourist",
    "createdAt": "2026-06-13T00:00:00.000Z",
    "updatedAt": "2026-06-13T00:00:00.000Z"
  },
  "accessToken": "jwt",
  "refreshToken": "token"
}
```

Errores: `400`, `409`.

## POST /auth/login

Body:

```json
{
  "email": "turista1@guiasgo.test",
  "password": "Password123!"
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Credenciales | Email y password deben coincidir. |
| Estado | Usuarios suspendidos no deben poder operar. |
| Tokens | Se emite access token y refresh token nuevo. |

Respuesta `200`: mismo formato de `/auth/register`.

Errores: `400`, `401`, `403`.

## POST /auth/refresh

Body:

```json
{
  "refreshToken": "token"
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Token valido | Debe existir, no estar revocado y no estar expirado. |
| Rotacion | El backend puede emitir un nuevo access token y conservar o rotar refresh token segun la estrategia implementada. |

Respuesta `200`:

```json
{
  "accessToken": "jwt",
  "refreshToken": "token"
}
```

Errores: `400`, `401`.

## POST /auth/logout

Headers:

```http
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "refreshToken": "token"
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Revocacion | El refresh token queda revocado. |
| Cliente mobile | Debe borrar access token y refresh token del storage local. |

Respuesta `200`:

```json
{
  "success": true
}
```

Errores: `401`.

## POST /auth/select-role

Headers:

```http
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "role": "guide"
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Rol permitido | El usuario solo puede activar roles que tenga asignados. |
| Token actualizado | Devuelve access token con el nuevo rol activo. |

Respuesta `200`:

```json
{
  "user": {
    "id": "uuid",
    "roles": ["tourist", "guide"],
    "activeRole": "guide"
  },
  "accessToken": "jwt"
}
```

Errores: `400`, `401`, `403`.

## GET /users/me

Headers:

```http
Authorization: Bearer <accessToken>
```

Respuesta `200`: usuario autenticado sin password ni hashes internos.

Errores: `401`.

## PATCH /users/me

Headers:

```http
Authorization: Bearer <accessToken>
```

Body:

```json
{
  "fullName": "Nombre Actualizado",
  "phone": "+573009998877",
  "photoUrl": "https://example.com/avatar.jpg"
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Datos sensibles | No actualiza password, roles ni estado. |
| Propietario | Solo actualiza el usuario autenticado. |

Respuesta `200`: usuario actualizado.

Errores: `400`, `401`.

