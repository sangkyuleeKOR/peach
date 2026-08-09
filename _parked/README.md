# 보류한 기능: 손님 주문 받기

어머니가 발주서 만들기에 먼저 익숙해지시도록, 손님이 사이트에서 직접 주문을 넣는 기능은 잠시 빼두었다.

나중에 다시 켜려면:

1. `customer-order-page.tsx` → `app/page.tsx` (손님 주문 폼 대문)
2. `order/` → `app/order/` (주문 완료 화면)
3. `admin-orders/` → `app/admin/orders/` (주문 접수함)
4. `app/admin/layout.tsx`의 NAV에 `{ href: "/admin/orders", label: "새 주문", icon: Inbox }` 다시 추가
5. `app/admin/page.tsx`에 새 주문 알림 카드 복원

데이터 쪽(`lib/types.ts`의 CustomerOrder, `lib/mock.ts`, `lib/store.ts`)은 그대로 남겨두었으므로 화면만 되돌리면 된다.
