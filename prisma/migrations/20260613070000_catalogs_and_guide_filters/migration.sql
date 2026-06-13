-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "guide_profiles" ADD COLUMN "cityId" TEXT;

-- CreateTable
CREATE TABLE "guide_languages" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "level" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guide_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_specialties" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guide_specialties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

-- CreateIndex
CREATE INDEX "cities_isActive_idx" ON "cities"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "cities_countryId_slug_key" ON "cities"("countryId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE INDEX "languages_isActive_idx" ON "languages"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "specialties_slug_key" ON "specialties"("slug");

-- CreateIndex
CREATE INDEX "specialties_isActive_idx" ON "specialties"("isActive");

-- CreateIndex
CREATE INDEX "guide_profiles_cityId_idx" ON "guide_profiles"("cityId");

-- CreateIndex
CREATE INDEX "guide_languages_languageId_idx" ON "guide_languages"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "guide_languages_guideId_languageId_key" ON "guide_languages"("guideId", "languageId");

-- CreateIndex
CREATE INDEX "guide_specialties_specialtyId_idx" ON "guide_specialties"("specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "guide_specialties_guideId_specialtyId_key" ON "guide_specialties"("guideId", "specialtyId");

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_profiles" ADD CONSTRAINT "guide_profiles_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_languages" ADD CONSTRAINT "guide_languages_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "guide_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_languages" ADD CONSTRAINT "guide_languages_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_specialties" ADD CONSTRAINT "guide_specialties_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "guide_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_specialties" ADD CONSTRAINT "guide_specialties_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed catalogs
INSERT INTO "countries" ("id", "name", "code", "updatedAt") VALUES
('country-co', 'Colombia', 'CO', CURRENT_TIMESTAMP);

INSERT INTO "cities" ("id", "countryId", "name", "slug", "latitude", "longitude", "updatedAt") VALUES
('city-cartagena', 'country-co', 'Cartagena', 'cartagena', 10.3910, -75.4794, CURRENT_TIMESTAMP),
('city-bogota', 'country-co', 'Bogota', 'bogota', 4.7110, -74.0721, CURRENT_TIMESTAMP),
('city-medellin', 'country-co', 'Medellin', 'medellin', 6.2442, -75.5812, CURRENT_TIMESTAMP),
('city-santa-marta', 'country-co', 'Santa Marta', 'santa-marta', 11.2408, -74.1990, CURRENT_TIMESTAMP);

INSERT INTO "languages" ("id", "name", "code", "updatedAt") VALUES
('lang-es', 'Espanol', 'es', CURRENT_TIMESTAMP),
('lang-en', 'Ingles', 'en', CURRENT_TIMESTAMP),
('lang-fr', 'Frances', 'fr', CURRENT_TIMESTAMP),
('lang-pt', 'Portugues', 'pt', CURRENT_TIMESTAMP);

INSERT INTO "specialties" ("id", "name", "slug", "description", "updatedAt") VALUES
('spec-history', 'Historia', 'historia', 'Recorridos historicos, patrimonio y memoria local.', CURRENT_TIMESTAMP),
('spec-gastronomy', 'Gastronomia', 'gastronomia', 'Mercados, cocina local y rutas de sabor.', CURRENT_TIMESTAMP),
('spec-culture', 'Cultura', 'cultura', 'Arte, costumbres, comunidades y vida local.', CURRENT_TIMESTAMP),
('spec-nature', 'Naturaleza', 'naturaleza', 'Senderismo, paisajes y experiencias al aire libre.', CURRENT_TIMESTAMP),
('spec-adventure', 'Aventura', 'aventura', 'Actividades activas con acompanamiento especializado.', CURRENT_TIMESTAMP),
('spec-family', 'Familiar', 'familiar', 'Experiencias seguras para familias y ninos.', CURRENT_TIMESTAMP);

-- Best-effort backfill for existing guide city relation.
UPDATE "guide_profiles" SET "cityId" = 'city-cartagena' WHERE LOWER("city") = 'cartagena';
UPDATE "guide_profiles" SET "cityId" = 'city-bogota' WHERE LOWER("city") IN ('bogota', 'bogotá');
UPDATE "guide_profiles" SET "cityId" = 'city-medellin' WHERE LOWER("city") IN ('medellin', 'medellín');
UPDATE "guide_profiles" SET "cityId" = 'city-santa-marta' WHERE LOWER("city") = 'santa marta';
