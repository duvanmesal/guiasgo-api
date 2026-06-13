# Resenas, Quejas y Ubicaciones

Base URL: `http://localhost:3000/api`

## Endpoints

| Metodo | Ruta | Rol | Descripcion |
| --- | --- | --- | --- |
| `POST` | `/services/:serviceId/review` | `tourist` | Crea resena de un servicio completado. |
| `POST` | `/services/:serviceId/complaint` | `tourist`, `guide` | Crea queja o reporte asociado a un servicio. |
| `GET` | `/complaints` | `admin`, `support` | Lista quejas. |
| `PATCH` | `/complaints/:id` | `admin`, `support` | Actualiza estado de queja. |
| `PATCH` | `/locations/me` | `guide` | Actualiza ubicacion simulada o GPS del guia. |
| `GET` | `/locations/me` | `guide` | Obtiene ultima ubicacion propia. |
| `GET` | `/locations/guides/:guideId` | `tourist`, `admin`, `support` | Obtiene ultima ubicacion de un guia. |

## POST /services/:serviceId/review

Body:

```json
{
  "rating": 5,
  "comment": "Excelente guia, puntual y muy claro."
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Servicio completado | Solo se puede calificar un servicio en `completed`. |
| Propietario | Solo el turista del servicio puede crear la resena. |
| Unica por servicio | No debe existir mas de una resena por servicio y turista. |
| Rating | Debe estar entre `1` y `5`. |
| Promedio | La calificacion del guia debe actualizarse desde resenas validas. |

Respuesta `201`: resena creada.

Errores: `400`, `401`, `403`, `404`, `409`.

## POST /services/:serviceId/complaint

Body:

```json
{
  "reason": "Incumplimiento",
  "description": "El guia no llego al punto acordado."
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Actor permitido | Puede reportar el turista propietario o el guia asignado. |
| Servicio relacionado | La queja queda asociada al servicio. |
| Estado inicial | La queja inicia en `open`. |
| Servicio reportado | El servicio puede quedar marcado como `reported` segun regla de negocio. |

Respuesta `201`: queja creada.

Errores: `400`, `401`, `403`, `404`.

## GET /complaints

Roles: `admin`, `support`.

Query params recomendados:

| Parametro | Tipo | Descripcion |
| --- | --- | --- |
| `status` | string | Filtra por `open`, `in_review` o `resolved`. |
| `page` | number | Pagina. |
| `limit` | number | Tamano de pagina. |

Respuesta `200`: listado paginado de quejas.

Errores: `401`, `403`.

## PATCH /complaints/:id

Roles: `admin`, `support`.

Body:

```json
{
  "status": "resolved",
  "assignedToId": "uuid",
  "resolutionNotes": "Caso revisado y cerrado."
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Estados | `open`, `in_review`, `resolved`. |
| Auditoria | Debe quedar trazabilidad de quien atiende el caso. |
| Datos sensibles | No exponer datos privados fuera de administracion/soporte. |

Respuesta `200`: queja actualizada.

Errores: `400`, `401`, `403`, `404`.

## PATCH /locations/me

Rol: `guide`.

Body:

```json
{
  "latitude": 10.391,
  "longitude": -75.479,
  "accuracy": 20,
  "source": "mock"
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| MVP | Puede usarse ubicacion simulada (`mock`). |
| Propietario | El guia solo actualiza su propia ubicacion. |
| Guia aprobado | Para uso publico, solo deberia exponerse ubicacion de guias aprobados. |
| Tiempo real futuro | Socket.IO se implementara despues; este endpoint queda como base REST. |

Respuesta `200`: ubicacion registrada.

Errores: `400`, `401`, `403`, `404`.

## GET /locations/me

Rol: `guide`.

Respuesta `200`: ultima ubicacion del guia autenticado.

Errores: `401`, `403`, `404`.

## GET /locations/guides/:guideId

Roles: `tourist`, `admin`, `support`.

Reglas:

| Regla | Detalle |
| --- | --- |
| Turista | Debe usarse solo cuando el turista tiene relacion funcional con el guia o como parte del MVP controlado. |
| Admin/Support | Pueden consultar para soporte. |

Respuesta `200`: ultima ubicacion del guia.

Errores: `401`, `403`, `404`.

