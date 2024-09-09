-- Create a new junction table for applications and LLMs
DROP TABLE IF EXISTS application_models;
CREATE TABLE application_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(application_id, model_id)
);

-- Add indexes for better query performance
CREATE INDEX idx_application_models_application_id ON application_models(application_id);
CREATE INDEX idx_application_models_model_id ON application_models(model_id);