# GuiasGoColombia API

Documentacion tecnica de la API backend de GuiasGoColombia.

## Base URL

En desarrollo local:

```text
http://localhost:3000/api
```

Todos los endpoints funcionales usan el prefijo global `/api`.

## Convenciones

### Autenticacion

Las rutas privadas requieren access token JWT:

```http
Authorization: Bearer <accessToken>
```

El refresh token se envia en el body de `/auth/refresh` y `/auth/logout`.

### Roles

Roles soportados:

| Rol | Uso |
| --- | --- |
| `tourist` | Turista que busca guias y solicita servicios. |
| `guide` | Guia que publica perfil, certificaciones, ubicacion y gestiona servicios asignados. |
| `admin` | Administrador de usuarios, guias, certificaciones y quejas. |
| `support` | Soporte operativo para revisar quejas. |

### Estados principales

Usuarios:

| Estado | Significado |
| --- | --- |
| `pending` | Usuario creado, pendiente de completar flujo o revision. |
| `active` | Usuario operativo. |
| `suspended` | Usuario bloqueado por administracion. |

Guias:

| Estado | Significado |
| --- | --- |
| `pending` | Perfil creado, pendiente de revision. |
| `in_review` | En proceso de validacion. |
| `approved` | Guia aprobado y visible en busquedas publicas. |
| `rejected` | Guia rechazado. |
| `suspended` | Guia suspendido. |

Servicios:

| Estado | Significado |
| --- | --- |
| `requested` | Solicitud creada por turista. |
| `accepted` | Guia acepto la solicitud. |
| `guide_on_way` | Guia va hacia el punto de encuentro. |
| `meeting_point` | Guia llego al punto de encuentro. |
| `in_progress` | Servicio en curso. |
| `completed` | Servicio finalizado. |
| `cancelled_by_tourist` | Cancelado por turista. |
| `cancelled_by_guide` | Cancelado por guia. |
| `rejected_by_guide` | Rechazado por guia. |
| `expired` | Solicitud expirada. |
| `reported` | Servicio marcado con reporte o queja. |

### Respuesta exitosa

La API devuelve objetos JSON directos. En listados paginados se usa:

```json
{
  "items": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### Respuesta de error

NestJS devuelve errores en formato JSON. Forma esperada para mobile:

```json
{
  "statusCode": 400,
  "message": "Mensaje o lista de errores",
  "error": "Bad Request"
}
```

Codigos comunes:

| Codigo | Uso |
| --- | --- |
| `200` | Consulta o actualizacion correcta. |
| `201` | Recurso creado. |
| `400` | DTO invalido o regla de negocio incumplida. |
| `401` | Token ausente, invalido o expirado. |
| `403` | Rol sin permiso o propietario incorrecto. |
| `404` | Recurso no encontrado. |
| `409` | Conflicto, por ejemplo email duplicado o perfil existente. |

## Indice

| Documento | Contenido |
| --- | --- |
| [auth-users.md](auth-users.md) | Registro, login, refresh, logout y usuario autenticado. |
| [profiles-guides-catalogs.md](profiles-guides-catalogs.md) | Perfiles turista/guia, certificaciones, busqueda de guias y catalogos. |
| [services.md](services.md) | Solicitudes de servicio y maquina de estados. |
| [reviews-complaints-locations.md](reviews-complaints-locations.md) | Resenas, quejas y ubicacion simulada. |
| [admin.md](admin.md) | Endpoints administrativos. |
| [testing-flow.md](testing-flow.md) | Flujo recomendado para probar la API completa. |

