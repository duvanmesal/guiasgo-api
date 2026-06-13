# Servicios Turisticos

Base URL: `http://localhost:3000/api`

## Endpoints

| Metodo | Ruta | Rol | Descripcion |
| --- | --- | --- | --- |
| `POST` | `/services/request` | `tourist` | Crea solicitud de servicio a un guia. |
| `GET` | `/services/me` | `tourist`, `guide` | Lista servicios del usuario autenticado. |
| `GET` | `/services/:id` | `tourist`, `guide`, `admin`, `support` | Obtiene detalle de servicio. |
| `PATCH` | `/services/:id/accept` | `guide` | Guia acepta solicitud. |
| `PATCH` | `/services/:id/reject` | `guide` | Guia rechaza solicitud. |
| `PATCH` | `/services/:id/on-way` | `guide` | Guia marca que va en camino. |
| `PATCH` | `/services/:id/meeting-point` | `guide` | Guia marca llegada al punto de encuentro. |
| `PATCH` | `/services/:id/start` | `guide` | Guia inicia servicio. |
| `PATCH` | `/services/:id/complete` | `guide` | Guia finaliza servicio. |
| `PATCH` | `/services/:id/cancel` | `tourist`, `guide` | Cancela servicio segun actor. |

## POST /services/request

Body:

```json
{
  "guideId": "uuid",
  "meetingPoint": "Torre del Reloj, Cartagena",
  "scheduledAt": "2026-06-15T15:00:00.000Z",
  "pricingMode": "hourly",
  "estimatedDurationHours": 2,
  "notes": "Tour historico en el centro."
}
```

Para precio por ruta:

```json
{
  "guideId": "uuid",
  "meetingPoint": "Parque principal",
  "pricingMode": "route",
  "routeTitle": "Ruta gastronomica",
  "estimatedPrice": 180000,
  "notes": "Grupo de 3 personas."
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Guia valido | El guia debe existir, estar `approved` y disponible. |
| Turista valido | El usuario debe tener rol `tourist`. |
| Solicitud inicial | Se crea en estado `requested`. |
| Precio | `hourly` calcula con tarifa y duracion; `route` requiere precio estimado. |
| Sin pagos reales | No hay cobro ni pasarela en MVP. |

Respuesta `201`: servicio creado.

Errores: `400`, `401`, `403`, `404`, `409`.

## GET /services/me

Query params:

| Parametro | Tipo | Descripcion |
| --- | --- | --- |
| `status` | string | Filtra por estado. |
| `page` | number | Pagina. |
| `limit` | number | Tamano de pagina. |

Respuesta `200`:

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

Reglas:

| Regla | Detalle |
| --- | --- |
| Turista | Ve servicios donde es solicitante. |
| Guia | Ve servicios donde es guia asignado. |

Errores: `401`, `403`.

## GET /services/:id

Reglas:

| Regla | Detalle |
| --- | --- |
| Propietario | Turista o guia solo puede ver servicios propios. |
| Admin/Support | Pueden ver servicios para soporte operativo. |

Respuesta `200`: detalle del servicio.

Errores: `401`, `403`, `404`.

## Transiciones de estado

| Endpoint | De | Hacia | Actor |
| --- | --- | --- | --- |
| `PATCH /services/:id/accept` | `requested` | `accepted` | Guia asignado |
| `PATCH /services/:id/reject` | `requested` | `rejected_by_guide` | Guia asignado |
| `PATCH /services/:id/on-way` | `accepted` | `guide_on_way` | Guia asignado |
| `PATCH /services/:id/meeting-point` | `guide_on_way` | `meeting_point` | Guia asignado |
| `PATCH /services/:id/start` | `meeting_point` | `in_progress` | Guia asignado |
| `PATCH /services/:id/complete` | `in_progress` | `completed` | Guia asignado |
| `PATCH /services/:id/cancel` por turista | `requested`, `accepted`, `guide_on_way`, `meeting_point` | `cancelled_by_tourist` | Turista propietario |
| `PATCH /services/:id/cancel` por guia | `requested`, `accepted`, `guide_on_way`, `meeting_point` | `cancelled_by_guide` | Guia asignado |

Transiciones prohibidas:

| Caso | Motivo |
| --- | --- |
| `completed` a cualquier otro estado | Estado final. |
| `cancelled_*` a cualquier otro estado | Estado final. |
| `rejected_by_guide` a cualquier otro estado | Estado final. |
| Turista aceptando o avanzando servicio | Solo guia asignado puede avanzar operacion. |
| Guia completando sin iniciar | Debe pasar por `in_progress`. |
| Guia no asignado modificando estado | Solo el guia del servicio tiene permiso. |

## PATCH /services/:id/reject

Body:

```json
{
  "reason": "No tengo disponibilidad en ese horario."
}
```

Respuesta `200`: servicio actualizado.

Errores: `400`, `401`, `403`, `404`.

## PATCH /services/:id/complete

Body:

```json
{
  "routeSummary": "Recorrido completado por centro historico y plaza principal."
}
```

Respuesta `200`: servicio completado.

Errores: `400`, `401`, `403`, `404`.

## PATCH /services/:id/cancel

Body:

```json
{
  "reason": "Cambio de planes",
  "notes": "El turista reagendara luego."
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Actor | Si cancela turista, estado final `cancelled_by_tourist`; si cancela guia, `cancelled_by_guide`. |
| Historial | Debe quedar registro de cambio de estado y motivo. |
| Estados finales | No se puede cancelar un servicio completado, rechazado, expirado o ya cancelado. |

Respuesta `200`: servicio cancelado.

Errores: `400`, `401`, `403`, `404`.

