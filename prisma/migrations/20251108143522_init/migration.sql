-- CreateTable
CREATE TABLE "Poi" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "destination" TEXT NOT NULL,

    CONSTRAINT "Poi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Poi_destination_idx" ON "Poi"("destination");

-- CreateIndex
CREATE INDEX "Poi_category_idx" ON "Poi"("category");

-- CreateIndex
CREATE INDEX "Poi_location_idx" ON "Poi"("location");

-- CreateIndex
CREATE INDEX "Poi_lat_lng_idx" ON "Poi"("lat", "lng");
