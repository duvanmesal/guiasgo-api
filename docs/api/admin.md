# Administracion

Base URL: `http://localhost:3000/api`

Los endpoints administrativos requieren token JWT y rol `admin`, excepto los endpoints de quejas donde `support` tambien puede operar.

## Endpoints

| Metodo | Ruta | Rol | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/admin/summary` | `admin` | Resumen operativo del sistema. |
| `GET` | `/admin/users` | `admin` | Lista usuarios. |
| `PATCH` | `/admin/users/:id/status` | `admin` | Cambia estado de usuario. |
| `GET` | `/admin/guides/pending` | `admin` | Lista guias pendientes o en revision. |
| `PATCH` | `/admin/guides/:id/verification` | `admin` | Cambia estado de verificacion de guia. |
| `GET` | `/admin/certifications/pending` | `admin` | Lista certificaciones pendientes. |
| `GET` | `/admin/complaints` | `admin`, `support` | Lista quejas para administracion. |
| `PATCH` | `/admin/complaints/:id` | `admin`, `support` | Actualiza queja. |

## GET /admin/summary

Respuesta `200`:

```json
{
  "users": {
    "total": 0,
    "active": 0,
    "suspended": 0
  },
  "guides": {
    "total": 0,
    "pending": 0,
    "approved": 0,
    "rejected": 0,
    "suspended": 0
  },
  "services": {
    "total": 0,
    "requested": 0,
    "completed": 0,
    "reported": 0
  },
  "complaints": {
    "open": 0,
    "inReview": 0,
    "resolved": 0
  }
}
```

Errores: `401`, `403`.

## GET /admin/users

Query params:

| Parametro | Tipo | Descripcion |
| --- | --- | --- |
| `page` | number | Pagina. |
| `limit` | number | Tamano de pagina. |

Respuesta `200`: listado paginado de usuarios sin password ni hashes.

Errores: `401`, `403`.

## PATCH /admin/users/:id/status

Body:

```json
{
  "status": "suspended"
}
```

Estados permitidos: `active`, `pending`, `suspended`.

Reglas:

| Regla | Detalle |
| --- | --- |
| Proteccion | Solo admin cambia estados de usuarios. |
| Seguridad | Al suspender, el usuario no debe poder operar con normalidad. |
| Datos sensibles | Nunca retornar `passwordHash` ni `refreshTokenHash`. |

Respuesta `200`: usuario actualizado.

Errores: `400`, `401`, `403`, `404`.

## GET /admin/guides/pending

Respuesta `200`: guias en estado `pending` o `in_review`.

Errores: `401`, `403`.

## PATCH /admin/guides/:id/verification

Body:

```json
{
  "status": "approved",
  "notes": "Documentos revisados correctamente."
}
```

Estados permitidos: `pending`, `in_review`, `approved`, `rejected`, `suspended`.

Reglas:

| Regla | Detalle |
| --- | --- |
| Guia publico | Solo `approved` aparece en `/guides`. |
| Rechazo | Debe registrarse motivo funcional cuando aplique. |
| Suspension | Guia suspendido no debe aparecer como disponible. |

Respuesta `200`: guia actualizado.

Errores: `400`, `401`, `403`, `404`.

## GET /admin/certifications/pending

Respuesta `200`: certificaciones pendientes de revision.

Errores: `401`, `403`.

## GET /admin/complaints

Roles: `admin`, `support`.

Respuesta `200`: quejas para soporte administrativo.

Errores: `401`, `403`.

## PATCH /admin/complaints/:id

Roles: `admin`, `support`.

Body:

```json
{
  "status": "in_review",
  "assignedToId": "uuid",
  "resolutionNotes": "Asignada para revision."
}
```

Estados permitidos: `open`, `in_review`, `resolved`.

Respuesta `200`: queja actualizada.

Errores: `400`, `401`, `403`, `404`.

