UPDATE "tourist_profiles" SET "interests" = ARRAY[]::TEXT[] WHERE "interests" IS NULL;
UPDATE "guide_profiles" SET "languages" = ARRAY[]::TEXT[] WHERE "languages" IS NULL;
UPDATE "guide_profiles" SET "specialties" = ARRAY[]::TEXT[] WHERE "specialties" IS NULL;

ALTER TABLE "tourist_profiles" ALTER COLUMN "interests" SET NOT NULL;
ALTER TABLE "guide_profiles" ALTER COLUMN "languages" SET NOT NULL;
ALTER TABLE "guide_profiles" ALTER COLUMN "specialties" SET NOT NULL;
