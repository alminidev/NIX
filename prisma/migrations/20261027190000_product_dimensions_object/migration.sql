-- Replaces the free-text "dimensions" column with numeric width, height and
-- depth (centimeters). The legacy text follows the "C x L x A" pattern shown
-- on the product card (length/depth x width x height), e.g. '46 x 35 x 60 cm'.

-- AlterTable
ALTER TABLE "product"
  ADD COLUMN "width"  DECIMAL(6,1),
  ADD COLUMN "height" DECIMAL(6,1),
  ADD COLUMN "depth"  DECIMAL(6,1);

-- Convert the existing data. Accepts 'x', 'X' or '×' as separator, decimal
-- comma or dot, and an optional trailing 'cm'.
UPDATE "product"
SET
  "depth"  = replace((m)[1], ',', '.')::DECIMAL(6,1),
  "width"  = replace((m)[2], ',', '.')::DECIMAL(6,1),
  "height" = replace((m)[3], ',', '.')::DECIMAL(6,1)
FROM (
  SELECT
    "id" AS "product_id",
    regexp_match(
      "dimensions",
      '^\s*(\d+(?:[.,]\d+)?)\s*[xX×]\s*(\d+(?:[.,]\d+)?)\s*[xX×]\s*(\d+(?:[.,]\d+)?)\s*(?:cm)?\s*$'
    ) AS m
  FROM "product"
) AS parsed
WHERE "product"."id" = parsed."product_id" AND parsed.m IS NOT NULL;

-- Rows whose text does not match the pattern stay NULL, so the NOT NULL
-- step below aborts the whole migration instead of guessing a value.
ALTER TABLE "product"
  ALTER COLUMN "width"  SET NOT NULL,
  ALTER COLUMN "height" SET NOT NULL,
  ALTER COLUMN "depth"  SET NOT NULL;

-- AlterTable
ALTER TABLE "product" DROP COLUMN "dimensions";
