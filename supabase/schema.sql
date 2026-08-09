-- 복숭아 발주 관리 스키마
-- 가족(어머니, 아들)만 로그인해서 쓰는 단일 가구 앱:
--   * 로그인한 사람(authenticated)은 전부 읽고 쓸 수 있다
--   * 로그인 안 한 사람(anon)은 아무것도 못 본다 (grant 자체를 안 줌)
--   * 회원가입은 대시보드에서 꺼 둔다 (Auth > Sign In / Up > Allow new users to sign up = off)

-- 주소록
create table public.people (
  id bigint generated always as identity primary key,
  name text not null,
  phone text not null default '',
  address text not null default '',
  referrer text not null default '', -- 연고인
  memo text,
  created_at timestamptz not null default now()
);

-- 상품 (등록돼 있으면 판매 중)
create table public.products (
  id bigint generated always as identity primary key,
  name text not null,
  price integer, -- 원. 비워둘 수 있음
  created_at timestamptz not null default now()
);

-- 발주서. 줄(사람+수량)은 jsonb로 통째로 저장 —
-- 발주서는 항상 한 장 단위로 열고 고치므로 별도 테이블보다 단순하다.
create table public.order_sheets (
  id bigint generated always as identity primary key,
  date date not null,
  memo text not null default '',
  status text not null default '작성중' check (status in ('작성중', '발송완료')),
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index order_sheets_date_idx on public.order_sheets (date desc);

-- RLS: 로그인한 가족만 전부 접근
alter table public.people enable row level security;
alter table public.products enable row level security;
alter table public.order_sheets enable row level security;

create policy "family_all_people" on public.people
  for all to authenticated using (true) with check (true);
create policy "family_all_products" on public.products
  for all to authenticated using (true) with check (true);
create policy "family_all_order_sheets" on public.order_sheets
  for all to authenticated using (true) with check (true);

-- 2026-04 이후 새 테이블은 Data API에 자동 노출되지 않으므로 명시적으로 grant
-- (anon에는 일부러 아무것도 주지 않는다)
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.people to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.order_sheets to authenticated;
