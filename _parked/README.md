# 보류한 기능: 손님 주문 받기

어머니가 발주서 만들기에 먼저 익숙해지시도록, 손님이 사이트에서 직접 주문을 넣는 기능은 잠시 빼두었다.

나중에 다시 켜려면:

1. `customer-order-page.tsx` → `app/page.tsx` (손님 주문 폼 대문)
2. `order/` → `app/order/` (주문 완료 화면)
3. `admin-orders/` → `app/admin/orders/` (주문 접수함)
4. `app/admin/layout.tsx`의 NAV에 `{ href: "/admin/orders", label: "새 주문", icon: Inbox }` 다시 추가
5. `app/admin/page.tsx`에 새 주문 알림 카드 복원

주의: 그 사이 저장소가 localStorage → Supabase로 바뀌었다. 복원할 때는
`customer_orders` 테이블을 만들고 `lib/store.ts`에 주문 CRUD를 추가해야 한다
(손님 주문 넣기는 로그인 없이 가능해야 하므로 anon insert 정책도 필요).
