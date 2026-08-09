/** 주소록의 한 사람 — 엑셀 주소록 열과 동일: 이름 | 휴대전화 | 주소 | 연고인 */
export type Person = {
  id: number;
  name: string;
  phone: string;
  address: string;
  referrer: string; // 연고인(소개해 준 사람)
  memo?: string | null;
  createdAt: string;
};

export type PersonInput = Pick<Person, "name" | "phone" | "address" | "referrer">;

/** 파는 상품 — 예: 복숭아 4.5kg 한 박스. 여기 등록돼 있으면 판매 중이다. */
export type Product = {
  id: number;
  name: string;
  price?: number | null; // 원. 비워둘 수 있음
  createdAt: string;
};

export type ProductInput = Pick<Product, "name" | "price">;

/** 발주서의 한 줄 — 사람 정보를 그대로 담아둔다(주소록이 나중에 바뀌어도 발주서는 그대로) */
export type SheetItem = {
  id: string; // 줄 구분용 (클라이언트에서 생성)
  personId?: number; // 주소록에서 담았으면 연결
  name: string;
  phone: string;
  address: string;
  product: string; // 상품명 스냅샷
  quantity: number; // 박스 수량
  memo?: string;
  done?: boolean; // 이 줄 발송 확인 체크
};

/** 발주서 — "xxxx년 x월 x일 발주서" */
export type OrderSheet = {
  id: number;
  date: string; // YYYY-MM-DD
  memo: string;
  status: "작성중" | "발송완료";
  items: SheetItem[];
  createdAt: string;
};

export type SheetInput = Pick<OrderSheet, "date" | "memo" | "items">;
