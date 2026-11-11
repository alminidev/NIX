-- A API de dados do Supabase alcança o schema public com a chave anon.
-- RLS ligado e sem policies nega leitura e escrita para anon e authenticated.
-- O Postgres do Prisma é dono das tabelas e segue lendo e gravando.
-- Tabelas novas criadas por esse papel também nascem com RLS e sem privilégio
-- para anon e authenticated.

do $$
declare
  table_name text;
begin
  for table_name in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
  end loop;
end $$;

create or replace function public.nix_enable_rls()
returns event_trigger
language plpgsql
as $$
declare
  command record;
begin
  for command in
    select object_identity
    from pg_event_trigger_ddl_commands()
    where command_tag = 'CREATE TABLE'
      and schema_name = 'public'
  loop
    execute format('alter table %s enable row level security', command.object_identity);
    execute format('revoke all on table %s from anon, authenticated', command.object_identity);
  end loop;
end;
$$;

drop event trigger if exists nix_enable_rls;

create event trigger nix_enable_rls
  on ddl_command_end
  when tag in ('CREATE TABLE')
  execute function public.nix_enable_rls();

revoke all on function public.nix_enable_rls() from public, anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;
