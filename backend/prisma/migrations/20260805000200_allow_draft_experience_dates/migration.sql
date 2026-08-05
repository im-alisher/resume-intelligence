-- Allow authenticated users to save partially completed draft experiences.
ALTER TABLE "Experience" ALTER COLUMN "startDate" DROP NOT NULL;
