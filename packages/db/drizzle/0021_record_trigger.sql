CREATE OR REPLACE FUNCTION check_trackable_record_uniqueness()
RETURNS TRIGGER AS $$
DECLARE
  existing_record_id UUID;
BEGIN
  -- Logic for simple trackable types -- 
  IF EXISTS (
    SELECT 1 FROM "TYL_trackable" t
    WHERE t.id = NEW."trackableId" 
    AND t.type IN ('boolean', 'number', 'range')
  ) THEN
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_trackable_record_uniqueness ON "TYL_trackableRecord";
CREATE TRIGGER enforce_trackable_record_uniqueness
BEFORE INSERT OR UPDATE ON "TYL_trackableRecord"
FOR EACH ROW
EXECUTE FUNCTION check_trackable_record_uniqueness();