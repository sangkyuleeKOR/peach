/** 주소록의 한 사람 — 엑셀 주소록 열과 동일: 이름 | 휴대전화 | 주소 | 연고인 */
export type Person = {
  id: string;
  name: string;
  phone: string;
  address: string;
  referrer: string; // 연고인(소개해 준 사람)
  memo?: string;
  createdAt: string;
};

/** 파는 상품 — 예: 복숭아 4.5kg 한 박스. 여기 등록돼 있으면 판매 중이다. */
export type Product = {
  id: string;
  name: string;
  price?: number; // 원. 비워둘 수 있음
  createdAt: string;
};

/** 발주서의 한 줄 — 사람 정보를 그대로 담아둔다(주소록이 나중에 바뀌어도 발주서는 그대로) */
export type SheetItem = {
  id: string;
  personId?: string; // 주소록에서 담았으면 연결
  name: string;
  phone: string;
  address: string;
  product: string; // 상품명 스냅샷
  quantity: number; // 박스 수량
  memo?: string;
};

/** 발주서 — "xxxx년 x월 x일 발주서" */
export type OrderSheet = {
  id: string;
  date: string; // YYYY-MM-DD
  memo?: string;
  status: "작성중" | "발송완료";
  items: SheetItem[];
  createdAt: string;
};

/** 손님이 사이트에서 넣은 주문 (지금은 보류 — _parked 참고) */
export type CustomerOrder = {
  id: string;
  createdAt: string;
  ordererName: string; // 주문하시는 분
  phone: string;
  address: string;
  product: string;
  quantity: number;
  referrer?: string; // 누구 소개로 오셨는지
  memo?: string;
  isGift: boolean; // 다른 분께 보내는 선물인지
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  status: "신규" | "확인함" | "발주완료";
};
