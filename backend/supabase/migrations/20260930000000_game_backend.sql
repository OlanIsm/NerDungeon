create table if not exists public.game_states (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null,
  version integer not null default 0 check (version >= 0)
);

alter table public.game_states enable row level security;
revoke all on public.game_states from anon, authenticated;
grant select, insert, update on public.game_states to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'expeditions', 'expeditions', false, 26214400,
  array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;
