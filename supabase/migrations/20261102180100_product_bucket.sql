-- Bucket das fotos de produto.
-- A leitura pública usa a URL /storage/v1/object/public/produtos/<caminho>,
-- que o bucket público entrega sem policy de SELECT. Sem essa policy, a
-- listagem do bucket continua bloqueada para anon e authenticated.
-- Não há policy de INSERT, UPDATE ou DELETE: a escrita fica só com a
-- service_role, usada no servidor depois de conferir o admin.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'produtos',
  'produtos',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "produtos_select" on storage.objects;
drop policy if exists "produtos_insert" on storage.objects;
drop policy if exists "produtos_update" on storage.objects;
drop policy if exists "produtos_delete" on storage.objects;
