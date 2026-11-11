-- The first side of the product dimensions is the length ("C" in "C x L x A").
-- Rename the column in place so existing values are kept.
ALTER TABLE "product" RENAME COLUMN "depth" TO "length";
