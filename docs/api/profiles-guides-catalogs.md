# Perfiles, Guias, Certificaciones y Catalogos

Base URL: `http://localhost:3000/api`

## Endpoints

| Metodo | Ruta | Rol | Descripcion |
| --- | --- | --- | --- |
| `POST` | `/tourists/profile` | `tourist` | Crea perfil de turista. |
| `GET` | `/tourists/me` | `tourist` | Obtiene perfil de turista propio. |
| `PATCH` | `/tourists/me` | `tourist` | Actualiza perfil de turista. |
| `GET` | `/guides` | Publico | Busca guias aprobados con filtros. |
| `GET` | `/guides/:id` | Publico | Detalle publico de guia aprobado. |
| `POST` | `/guides/profile` | `guide` | Crea perfil de guia. |
| `GET` | `/guides/me` | `guide` | Obtiene perfil propio de guia. |
| `PATCH` | `/guides/me` | `guide` | Actualiza perfil propio de guia. |
| `PATCH` | `/guides/:id/verification` | `admin` | Actualiza estado de verificacion del guia. |
| `POST` | `/guides/certifications` | `guide` | Crea certificacion del guia autenticado. |
| `GET` | `/guides/certifications/me` | `guide` | Lista certificaciones propias. |
| `PATCH` | `/certifications/:id/review` | `admin` | Aprueba o rechaza certificacion. |
| `GET` | `/catalogs/countries` | Publico | Lista paises. |
| `GET` | `/catalogs/cities` | Publico | Lista ciudades. |
| `GET` | `/catalogs/languages` | Publico | Lista idiomas. |
| `GET` | `/catalogs/specialties` | Publico | Lista especialidades. |

## Perfil de turista

### POST /tourists/profile

Body:

```json
{
  "nationality": "CO",
  "preferredLanguage": "es",
  "emergencyContact": "+573001112233",
  "interests": ["Historia", "Gastronomia"]
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Unico por usuario | Un turista solo puede tener un perfil turistico. |
| Rol | Requiere rol activo o asignado `tourist`. |

Respuesta `201`: perfil creado.

Errores: `400`, `401`, `403`, `409`.

### GET /tourists/me

Respuesta `200`: perfil del turista autenticado.

Errores: `401`, `403`, `404`.

### PATCH /tourists/me

Body: mismos campos de creacion, todos opcionales.

Respuesta `200`: perfil actualizado.

Errores: `400`, `401`, `403`, `404`.

## Perfil de guia

### POST /guides/profile

Body:

```json
{
  "bio": "Guia local especializado en historia y cultura.",
  "city": "Cartagena",
  "languages": ["Español", "Inglés"],
  "specialties": ["Historia", "Cultura"],
  "hourlyRate": 80000,
  "supportsHourly": true,
  "supportsRoute": true,
  "yearsExperience": 5,
  "latitude": 10.391,
  "longitude": -75.479
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Unico por usuario | Un guia solo puede tener un perfil de guia. |
| Estado inicial | El guia inicia como `pending` o `in_review`; no aparece publicamente hasta `approved`. |
| Disponibilidad | Solo guias aprobados deben ser visibles como disponibles para turistas. |
| Precio | `hourlyRate` representa tarifa base por hora para el MVP. |

Respuesta `201`: perfil de guia creado.

Errores: `400`, `401`, `403`, `409`.

### GET /guides

Query params:

| Parametro | Tipo | Descripcion |
| --- | --- | --- |
| `city` | string | Filtra por ciudad. |
| `language` | string | Filtra por idioma. |
| `specialty` | string | Filtra por especialidad. |
| `minRating` | number | Calificacion minima. |
| `onlyAvailable` | boolean | Solo guias disponibles. |
| `maxHourlyRate` | number | Tarifa maxima por hora. |
| `page` | number | Pagina, por defecto `1`. |
| `limit` | number | Tamano de pagina. |

Ejemplo:

```http
GET /api/guides?city=Cartagena&language=Inglés&specialty=Historia&onlyAvailable=true&page=1&limit=10
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Visibilidad | Solo retorna guias `approved`. |
| Datos sensibles | No expone email, tokens, hashes ni informacion administrativa sensible. |

Respuesta `200`:

```json
{
  "items": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

### GET /guides/:id

Reglas:

| Regla | Detalle |
| --- | --- |
| Guia aprobado | Si el guia no esta aprobado, no debe verse como detalle publico. |

Respuesta `200`: detalle publico del guia.

Errores: `404`.

### GET /guides/me y PATCH /guides/me

Requieren rol `guide`.

`PATCH /guides/me` acepta campos opcionales del perfil:

```json
{
  "bio": "Nueva descripcion",
  "city": "Medellín",
  "languages": ["Español", "Portugués"],
  "specialties": ["Naturaleza"],
  "hourlyRate": 95000,
  "isAvailable": true
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Propietario | El guia solo actualiza su perfil. |
| Verificacion | El guia no puede aprobarse a si mismo. |

Errores: `400`, `401`, `403`, `404`.

## Certificaciones

### POST /guides/certifications

Body:

```json
{
  "type": "Registro Nacional de Turismo",
  "documentUrl": "mock://documents/rnt-001.pdf",
  "issuedBy": "Entidad certificadora",
  "issuedAt": "2026-01-15T00:00:00.000Z"
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Storage MVP | `documentUrl` puede ser simulado. No hay subida real de archivos todavia. |
| Revision | La certificacion inicia pendiente y debe revisarla admin. |

Respuesta `201`: certificacion creada.

Errores: `400`, `401`, `403`.

### PATCH /certifications/:id/review

Rol: `admin`.

Body:

```json
{
  "status": "approved",
  "rejectionReason": null
}
```

Reglas:

| Regla | Detalle |
| --- | --- |
| Aprobacion | Solo admin puede aprobar o rechazar certificaciones. |
| Rechazo | Si `status` es `rejected`, debe enviarse motivo funcional. |

Respuesta `200`: certificacion actualizada.

Errores: `400`, `401`, `403`, `404`.

## Catalogos

### GET /catalogs/countries

Respuesta `200`: lista de paises activos.

### GET /catalogs/cities

Query opcional:

```http
GET /api/catalogs/cities?countryCode=CO
```

Respuesta `200`: lista de ciudades activas.

### GET /catalogs/languages

Respuesta `200`: lista de idiomas activos.

### GET /catalogs/specialties

Respuesta `200`: lista de especialidades activas.

