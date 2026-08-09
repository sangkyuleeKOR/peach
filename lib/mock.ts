import type { CustomerOrder, OrderSheet, Person, Product } from "./types";

/** 시연용 가짜 데이터 — 나중에 Supabase를 붙이면 이 파일은 사라진다 */
export const MOCK_PRODUCTS: Product[] = [
  { id: "pr1", name: "복숭아 4.5kg", price: 35000, createdAt: "2026-06-01" },
  { id: "pr2", name: "복숭아 10kg", price: 60000, createdAt: "2026-06-01" },
];

export const MOCK_PEOPLE: Person[] = [
  { id: "p1", name: "강미례", phone: "010-1234-4770", address: "경기도 안양시 동안구 학의로 46 관악아파트 101동 202호", referrer: "백동화", createdAt: "2026-01-05" },
  { id: "p2", name: "강선모", phone: "010-2345-7060", address: "경기도 수원시 팔달구 고등로 15 푸르지오 205동 1503호", referrer: "화서초", createdAt: "2026-01-05" },
  { id: "p3", name: "김지선", phone: "010-3456-0742", address: "경기도 용인시 수지구 수풍로 47 동문아파트 302동 401호", referrer: "김명신", createdAt: "2026-01-05" },
  { id: "p4", name: "김명신", phone: "010-4567-0742", address: "경기도 용인시 수지구 풍덕천1동 풍림아파트 103동 902호", referrer: "", createdAt: "2026-01-05" },
  { id: "p5", name: "박종숙", phone: "010-5678-0743", address: "경기도 용인시 수지구 동천동 952-5번지 누리빌 201호", referrer: "김명신", createdAt: "2026-01-05" },
  { id: "p6", name: "김승연", phone: "010-6789-4921", address: "경기도 용인시 수지구 진산로 108 삼성래미안 110동 803호", referrer: "박종숙", createdAt: "2026-01-05" },
  { id: "p7", name: "이미영", phone: "010-7890-7851", address: "경기도 수원시 팔달구 덕영대로 735번길 18 행복빌라 302호", referrer: "강선모", createdAt: "2026-01-05" },
  { id: "p8", name: "이정순", phone: "010-8901-2233", address: "서울특별시 관악구 남부순환로 1801 관악푸르지오 502동 301호", referrer: "이미영", createdAt: "2026-02-11" },
  { id: "p9", name: "정혜숙", phone: "010-9012-3344", address: "서울특별시 서초구 반포대로 275 반포자이 112동 2201호", referrer: "이정순", createdAt: "2026-02-11" },
  { id: "p10", name: "최은자", phone: "010-0123-4455", address: "대전광역시 유성구 대학로 99 한빛아파트 3동 1102호", referrer: "정혜숙", createdAt: "2026-03-02" },
  { id: "p11", name: "한미옥", phone: "010-1122-5566", address: "경기도 수원시 영통구 도청로 18번길 26 힐스테이트 501동 902호", referrer: "", createdAt: "2026-03-02" },
  { id: "p12", name: "강수정", phone: "010-2233-6677", address: "경기도 수원시 영통구 광교로 145 광교자연앤힐 706동 1204호", referrer: "한미옥", createdAt: "2026-03-15" },
];

export const MOCK_SHEETS: OrderSheet[] = [
  {
    id: "s1",
    date: "2026-08-03",
    memo: "월요일 발송분",
    status: "발송완료",
    createdAt: "2026-08-02",
    items: [
      { id: "i1", personId: "p3", name: "김지선", phone: "010-3456-0742", address: "경기도 용인시 수지구 수풍로 47 동문아파트 302동 401호", product: "복숭아 4.5kg", quantity: 2 },
      { id: "i2", personId: "p4", name: "김명신", phone: "010-4567-0742", address: "경기도 용인시 수지구 풍덕천1동 풍림아파트 103동 902호", product: "복숭아 4.5kg", quantity: 1 },
      { id: "i3", personId: "p5", name: "박종숙", phone: "010-5678-0743", address: "경기도 용인시 수지구 동천동 952-5번지 누리빌 201호", product: "복숭아 10kg", quantity: 1, memo: "부재시 경비실" },
    ],
  },
  {
    id: "s2",
    date: "2026-08-07",
    memo: "",
    status: "작성중",
    createdAt: "2026-08-06",
    items: [
      { id: "i4", personId: "p7", name: "이미영", phone: "010-7890-7851", address: "경기도 수원시 팔달구 덕영대로 735번길 18 행복빌라 302호", product: "복숭아 4.5kg", quantity: 3 },
    ],
  },
];

/** 손님 주문 기능은 보류 중이지만, 되살릴 때를 대비해 시연 데이터는 남겨둔다 */
export const MOCK_ORDERS: CustomerOrder[] = [
  {
    id: "o1",
    createdAt: "2026-08-08T10:20:00",
    ordererName: "박서준",
    phone: "010-5555-1111",
    address: "서울특별시 마포구 월드컵북로 400 상암아파트 101동 1001호",
    product: "복숭아 4.5kg",
    quantity: 2,
    referrer: "이미영",
    memo: "말랑한 걸로 부탁드려요",
    isGift: false,
    status: "신규",
  },
  {
    id: "o2",
    createdAt: "2026-08-08T14:03:00",
    ordererName: "김하늘",
    phone: "010-6666-2222",
    address: "경기도 성남시 분당구 판교역로 235",
    product: "복숭아 10kg",
    quantity: 1,
    referrer: "",
    isGift: true,
    recipientName: "김순례",
    recipientPhone: "010-7777-3333",
    recipientAddress: "충청남도 천안시 동남구 병천면 아우내순대길 12",
    memo: "어머니 생신 선물이에요",
    status: "신규",
  },
];
