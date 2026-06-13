# Flujo de Prueba Manual de la API

Base URL local:

```text
http://localhost:3000/api
```

## 1. Verificar backend

```http
GET /api/health
```

Resultado esperado: servicio disponible.

## 2. Registrar usuarios

Crear al menos:

| Usuario | Rol inicial |
| --- | --- |
| `admin@guiasgo.test` | `admin` si ya existe por seed o actualizacion manual. |
| `turista1@guiasgo.test` | `tourist` |
| `guia1@guiasgo.test` | `guide` |

Para turistas y guias usar:

```http
POST /api/auth/register
```

Guardar `accessToken` y `refreshToken`.

## 3. Crear perfil de turista

Con token de turista:

```http
POST /api/tourists/profile
```

Validar:

| Resultado esperado | Detalle |
| --- | --- |
| `201` | Perfil creado. |
| `409` | Si se intenta crear de nuevo. |

## 4. Crear perfil de guia

Con token de guia:

```http
POST /api/guides/profile
```

Validar:

| Resultado esperado | Detalle |
| --- | --- |
| `201` | Perfil creado en estado no publico. |
| `GET /api/guides` | No debe mostrar el guia hasta aprobarlo. |

## 5. Cargar certificacion del guia

Con token de guia:

```http
POST /api/guides/certifications
```

Usar `documentUrl` simulado, por ejemplo `mock://documents/rnt-guia1.pdf`.

## 6. Aprobar guia como admin

Con token admin:

```http
PATCH /api/admin/guides/{guideId}/verification
```

Body:

```json
{
  "status": "approved",
  "notes": "Aprobado para pruebas MVP."
}
```

Validar:

| Resultado esperado | Detalle |
| --- | --- |
| `200` | Guia actualizado. |
| `GET /api/guides` | El guia ya aparece en busqueda publica. |

## 7. Probar catalogos y filtros

Consultar:

```http
GET /api/catalogs/countries
GET /api/catalogs/cities
GET /api/catalogs/languages
GET /api/catalogs/specialties
```

Buscar guia:

```http
GET /api/guides?city=Cartagena&language=Español&onlyAvailable=true
```

## 8. Solicitar servicio

Con token de turista:

```http
POST /api/services/request
```

Body:

```json
{
  "guideId": "uuid-del-guia",
  "meetingPoint": "Torre del Reloj, Cartagena",
  "pricingMode": "hourly",
  "estimatedDurationHours": 2,
  "notes": "Prueba de tour historico."
}
```

Resultado esperado: servicio en `requested`.

## 9. Avanzar estados del servicio

Con token del guia asignado:

```http
PATCH /api/services/{serviceId}/accept
PATCH /api/services/{serviceId}/on-way
PATCH /api/services/{serviceId}/meeting-point
PATCH /api/services/{serviceId}/start
PATCH /api/services/{serviceId}/complete
```

Validaciones esperadas:

| Prueba | Resultado |
| --- | --- |
| Avanzar fuera de orden | `400` o error de regla de negocio. |
| Usar guia no asignado | `403`. |
| Usar turista para aceptar | `403`. |
| Completar sin iniciar | Error de transicion. |

## 10. Crear resena

Con token del turista, despues de completar:

```http
POST /api/services/{serviceId}/review
```

Body:

```json
{
  "rating": 5,
  "comment": "Prueba satisfactoria."
}
```

Validar:

| Prueba | Resultado |
| --- | --- |
| Resena antes de completar | Error. |
| Segunda resena del mismo servicio | `409` o error de duplicado. |

## 11. Crear queja

Con token de turista o guia relacionado:

```http
POST /api/services/{serviceId}/complaint
```

Body:

```json
{
  "reason": "Prueba soporte",
  "description": "Queja de validacion funcional."
}
```

Luego revisar con admin/support:

```http
GET /api/admin/complaints
PATCH /api/admin/complaints/{complaintId}
```

## 12. Probar ubicacion simulada

Con token de guia:

```http
PATCH /api/locations/me
```

Body:

```json
{
  "latitude": 10.391,
  "longitude": -75.479,
  "accuracy": 20,
  "source": "mock"
}
```

Consultar:

```http
GET /api/locations/me
GET /api/locations/guides/{guideId}
```

## 13. Probar seguridad basica

Casos minimos:

| Caso | Resultado esperado |
| --- | --- |
| Ruta privada sin token | `401`. |
| Ruta admin con turista | `403`. |
| DTO con campos invalidos | `400`. |
| Refresh token revocado | `401`. |
| Usuario intenta editar perfil ajeno | `403` o `404`. |

