-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION check_trackable_record_uniqueness()
RETURNS TRIGGER AS $$
DECLARE
  existing_record_id UUID;
  trackable_type TEXT;
BEGIN
  -- Get trackable type
  SELECT type INTO trackable_type
  FROM "TYL_trackable"
  WHERE id = NEW."trackable_id";

  -- Logic for simple trackable types -- 
  IF trackable_type IN ('boolean', 'number', 'text') THEN
    -- Truncate date --
    NEW."date" = DATE_TRUNC('day', NEW."date");
    
    -- Check for existing record -- 
    SELECT tr."record_id" INTO existing_record_id
    FROM "TYL_trackableRecord" tr
    WHERE tr."trackable_id" = NEW."trackable_id"
    AND DATE_TRUNC('day', tr."date") = NEW."date"
    AND tr."record_id" != NEW."record_id";

    -- If record exists, update it instead --
    IF existing_record_id IS NOT NULL THEN
      UPDATE "TYL_trackableRecord"
      SET "value" = NEW."value"
      WHERE "record_id" = existing_record_id;
      
      RETURN NULL; -- Cancel the current INSERT
    END IF;
  -- Logic for tag type --
  ELSIF trackable_type = 'tags' THEN
    -- Check if record with same value exists
    IF EXISTS (
      SELECT 1
      FROM "TYL_trackableRecord" tr
      WHERE tr."trackable_id" = NEW."trackable_id"
      AND DATE_TRUNC('day', tr."date") = DATE_TRUNC('day', NEW."date")
      AND tr."value" = NEW."value"
      AND tr."record_id" != NEW."record_id"
    ) THEN
      RETURN NULL; -- Cancel the INSERT if tag already exists
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_trackable_record_uniqueness ON "TYL_trackableRecord";
CREATE TRIGGER enforce_trackable_record_uniqueness
BEFORE INSERT OR UPDATE ON "TYL_trackableRecord"
FOR EACH ROW
EXECUTE FUNCTION check_trackable_record_uniqueness();