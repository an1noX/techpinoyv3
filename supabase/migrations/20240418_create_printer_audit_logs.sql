
-- Create the printer_audit_logs table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS printer_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  printer_id UUID NOT NULL REFERENCES printers(id),
  changed_by TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries by printer_id
CREATE INDEX IF NOT EXISTS printer_audit_logs_printer_id_idx ON printer_audit_logs (printer_id);
