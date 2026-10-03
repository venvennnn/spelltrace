-- Spelltrace athlete-owned schema + RLS. Apply in Supabase SQL editor or CLI.

create extension if not exists "pgcrypto";

create table if not exists athletes (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  bowling_arm text check (bowling_arm in ('left', 'right')),
  timezone text not null default 'UTC',
  created_at timestamptz not null default now()
);

create table if not exists watch_connections (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  provider text not null,
  status text not null,
  scopes_json jsonb not null default '[]',
  last_synced_at timestamptz,
  sync_cursor text,
  preferred_metrics_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists watch_sync_runs (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references watch_connections(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null,
  imported_count int not null default 0,
  skipped_count int not null default 0,
  error_code text
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  started_at_utc timestamptz not null,
  timezone text not null,
  view text not null check (view in ('side', 'front')),
  drill text not null check (drill in ('nets', 'match', 'controlled')),
  effort text not null check (effort in ('easy', 'normal', 'high')),
  environment_json jsonb,
  status text not null default 'draft'
);

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  private_object_path text,
  duration_ms int,
  width int,
  height int,
  captured_at_utc timestamptz,
  consent_status text not null default 'athlete',
  deleted_at timestamptz
);

create table if not exists deliveries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  video_id uuid references videos(id) on delete set null,
  start_ms int not null,
  end_ms int not null,
  front_foot_contact_ms int,
  quality_json jsonb,
  excluded boolean not null default false
);

create table if not exists movement_traces (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references deliveries(id) on delete cascade,
  private_object_path text,
  frame_timestamps_ms int[],
  keypoint_schema text not null,
  algorithm_version text not null,
  retention_state text not null,
  created_at timestamptz not null default now()
);

create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  recorded_at_utc timestamptz not null default now(),
  sleep_feeling text,
  fatigue int,
  soreness int,
  rpe int,
  notes text,
  sensitive_json jsonb
);

create table if not exists watch_records (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  session_id uuid references sessions(id) on delete set null,
  timestamp_utc timestamptz not null,
  end_utc timestamptz,
  metric text not null,
  value double precision not null,
  unit text not null,
  device text,
  source_import_id text,
  unique (athlete_id, source_import_id)
);

create table if not exists features (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references deliveries(id) on delete cascade,
  algorithm_version text not null,
  values_json jsonb not null,
  quality_json jsonb
);

create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  session_id uuid not null references sessions(id) on delete cascade,
  evidence_hash text not null,
  model_version text,
  prompt_version text,
  consent_scope text not null,
  output_json jsonb,
  validation_status text not null,
  created_at timestamptz not null default now()
);

create table if not exists baselines (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  comparator_key text not null,
  feature_version text not null,
  cutoff_at_utc timestamptz not null,
  sample_counts_json jsonb,
  summary_json jsonb
);

create table if not exists anomalies (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references deliveries(id) on delete cascade,
  baseline_id uuid references baselines(id),
  modality text not null,
  score double precision,
  evidence_json jsonb,
  status text not null
);

create table if not exists processing_jobs (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references videos(id) on delete cascade,
  algorithm_version text not null,
  state text not null,
  error_code text,
  updated_at timestamptz not null default now(),
  unique (video_id, algorithm_version)
);

create table if not exists share_sets (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  title text not null,
  token_hash text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz
);

create table if not exists share_items (
  id uuid primary key default gen_random_uuid(),
  share_set_id uuid not null references share_sets(id) on delete cascade,
  delivery_id uuid,
  video_id uuid,
  movement_trace_id uuid,
  allowed_fields_json jsonb not null,
  sort_order int not null default 0
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  event text not null,
  occurred_at timestamptz not null default now()
);

alter table athletes enable row level security;
alter table watch_connections enable row level security;
alter table watch_sync_runs enable row level security;
alter table sessions enable row level security;
alter table videos enable row level security;
alter table deliveries enable row level security;
alter table movement_traces enable row level security;
alter table checkins enable row level security;
alter table watch_records enable row level security;
alter table features enable row level security;
alter table insights enable row level security;
alter table baselines enable row level security;
alter table anomalies enable row level security;
alter table processing_jobs enable row level security;
alter table share_sets enable row level security;
alter table share_items enable row level security;
alter table audit_events enable row level security;

create or replace function public.current_athlete_id()
returns uuid language sql stable as $$
  select id from athletes where auth_user_id = auth.uid()
$$;

create policy athletes_self on athletes for all using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
create policy sessions_self on sessions for all using (athlete_id = public.current_athlete_id()) with check (athlete_id = public.current_athlete_id());
create policy videos_self on videos for all using (
  session_id in (select id from sessions where athlete_id = public.current_athlete_id())
);
create policy deliveries_self on deliveries for all using (
  session_id in (select id from sessions where athlete_id = public.current_athlete_id())
);
create policy checkins_self on checkins for all using (
  session_id in (select id from sessions where athlete_id = public.current_athlete_id())
);
create policy watch_records_self on watch_records for all using (athlete_id = public.current_athlete_id());
create policy shares_self on share_sets for all using (athlete_id = public.current_athlete_id());
create policy insights_self on insights for all using (athlete_id = public.current_athlete_id());
create policy audit_self on audit_events for all using (athlete_id = public.current_athlete_id());
create policy connections_self on watch_connections for all using (athlete_id = public.current_athlete_id());
create policy jobs_self on processing_jobs for all using (
  video_id in (
    select v.id from videos v join sessions s on s.id = v.session_id
    where s.athlete_id = public.current_athlete_id()
  )
);

-- Public share reads go through a Next.js endpoint that checks token_hash, expiry, and revocation.
-- Do not grant anon select on videos or checkins.
