
-- Transcript insights from daily analysis
CREATE TABLE public.transcript_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID REFERENCES public.call_records(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.outbound_leads(id) ON DELETE SET NULL,
  trigger_line TEXT,
  last_agent_sentence TEXT,
  last_prospect_sentence TEXT,
  objection_detected TEXT[],
  sentiment_shift TEXT, -- 'neutral_to_engaged', 'engaged_to_annoyed', etc.
  winning_phrases TEXT[],
  failing_phrases TEXT[],
  hangup_category TEXT, -- 'sub_10s', 'sub_45s', 'normal', null
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transcript_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access transcript_insights" ON public.transcript_insights FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Opener weights for A/B testing
CREATE TABLE public.opener_weights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variant TEXT NOT NULL UNIQUE, -- 'A','B','C','D','E'
  weight NUMERIC NOT NULL DEFAULT 20, -- percentage allocation
  is_paused BOOLEAN NOT NULL DEFAULT false,
  total_calls INTEGER NOT NULL DEFAULT 0,
  total_answered INTEGER NOT NULL DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  discovery_completion_rate NUMERIC DEFAULT 0,
  close_rate NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.opener_weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access opener_weights" ON public.opener_weights FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Seed default opener variants
INSERT INTO public.opener_weights (variant, weight) VALUES
  ('A', 20), ('B', 20), ('C', 20), ('D', 20), ('E', 20);

-- Lead source allocations
CREATE TABLE public.lead_source_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL UNIQUE,
  current_pct NUMERIC NOT NULL DEFAULT 0,
  min_pct NUMERIC NOT NULL DEFAULT 0,
  max_pct NUMERIC NOT NULL DEFAULT 100,
  cost_per_order NUMERIC,
  conversion_rate NUMERIC,
  total_leads INTEGER NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lead_source_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access lead_source_allocations" ON public.lead_source_allocations FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Optimization changelog with rollback support
CREATE TABLE public.optimization_changelog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  change_type TEXT NOT NULL, -- 'opener_weight','script_patch','template_patch','cadence_patch','lead_alloc'
  change_category TEXT NOT NULL DEFAULT 'safe', -- 'safe' or 'needs_approval'
  status TEXT NOT NULL DEFAULT 'applied', -- 'applied','pending','approved','rejected','rolled_back'
  title TEXT NOT NULL,
  reason TEXT,
  before_json JSONB,
  after_json JSONB,
  metrics_snapshot JSONB,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  rolled_back_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.optimization_changelog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access optimization_changelog" ON public.optimization_changelog FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Orchestrator reports
CREATE TABLE public.orchestrator_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL, -- 'daily','weekly','monthly'
  report_date DATE NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}',
  bottleneck TEXT,
  auto_applied JSONB DEFAULT '[]',
  needs_approval JSONB DEFAULT '[]',
  experiments JSONB DEFAULT '[]',
  audit_results JSONB,
  recommendations JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orchestrator_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access orchestrator_reports" ON public.orchestrator_reports FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Gold library for top calls
CREATE TABLE public.gold_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID REFERENCES public.call_records(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.outbound_leads(id) ON DELETE SET NULL,
  month DATE NOT NULL,
  outcome TEXT,
  duration_seconds INTEGER,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gold_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access gold_library" ON public.gold_library FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Index for performance
CREATE INDEX idx_transcript_insights_call_id ON public.transcript_insights(call_id);
CREATE INDEX idx_transcript_insights_created ON public.transcript_insights(created_at);
CREATE INDEX idx_optimization_changelog_type ON public.optimization_changelog(change_type);
CREATE INDEX idx_optimization_changelog_status ON public.optimization_changelog(status);
CREATE INDEX idx_orchestrator_reports_type_date ON public.orchestrator_reports(report_type, report_date);
CREATE INDEX idx_gold_library_month ON public.gold_library(month);
