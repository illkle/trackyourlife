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
  WHERE id = NEW."trackableId";

  -- Logic for simple trackable types -- 
  IF trackable_type IN ('boolean', 'number', 'text') THEN
    -- Truncate date --
    NEW."date" = DATE_TRUNC('day', NEW."date");
    
    -- Check for existing record -- 
    SELECT tr."recordId" INTO existing_record_id
    FROM "TYL_trackableRecord" tr
    WHERE tr."trackableId" = NEW."trackableId"
    AND DATE_TRUNC('day', tr."date") = NEW."date"
    AND tr."recordId" != NEW."recordId";

    -- If record exists, update it instead --
    IF existing_record_id IS NOT NULL THEN
      UPDATE "TYL_trackableRecord"
      SET "value" = NEW."value"
      WHERE "recordId" = existing_record_id;
      
      RETURN NULL; -- Cancel the current INSERT
    END IF;
  -- Logic for tag type --
  ELSIF trackable_type = 'tags' THEN
    -- Check if record with same value exists
    IF EXISTS (
      SELECT 1
      FROM "TYL_trackableRecord" tr
      WHERE tr."trackableId" = NEW."trackableId"
      AND DATE_TRUNC('day', tr."date") = DATE_TRUNC('day', NEW."date")
      AND tr."value" = NEW."value"
      AND tr."recordId" != NEW."recordId"
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