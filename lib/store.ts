"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import type {
  OrderSheet,
  Person,
  PersonInput,
  Product,
  ProductInput,
  SheetInput,
  SheetItem,
} from "./types";

/** Supabase에서 읽어온 전체 데이터 */
export type DB = {
  people: Person[];
  products: Product[];
  sheets: OrderSheet[];
};

/* ── DB 행(snake_case) ↔ 앱 타입(camelCase) 변환 ── */

type PersonRow = { id: number; name: string; phone: string; address: string; referrer: string; memo: string | null; created_at: string };
type ProductRow = { id: number; name: string; price: number | null; created_at: string };
type SheetRow = { id: number; date: string; memo: string; status: "작성중" | "발송완료"; items: SheetItem[]; created_at: string };

const toPerson = (r: PersonRow): Person => ({ id: r.id, name: r.name, phone: r.phone, address: r.address, referrer: r.referrer, memo: r.memo, createdAt: r.created_at });
const toProduct = (r: ProductRow): Product => ({ id: r.id, name: r.name, price: r.price, createdAt: r.created_at });
const toSheet = (r: SheetRow): OrderSheet => ({ id: r.id, date: r.date, memo: r.memo, status: r.status, items: r.items ?? [], createdAt: r.created_at });

/** Supabase는 한 번에 최대 1,000행까지만 주므로, 주소록(1,800명+)은 나눠서 다 가져온다 */
async function fetchAllPeople(supabase: ReturnType<typeof createClient>): Promise<PersonRow[]> {
  const pageSize = 1000;
  const rows: PersonRow[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("people")
      .select("*")
      .order("name")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...((data ?? []) as PersonRow[]));
    if (!data || data.length < pageSize) return rows;
  }
}

function reportError(e: unknown) {
  console.error(e);
  window.alert("저장하지 못했어요.\n인터넷 연결을 확인하고 다시 눌러 주세요.");
}

/**
 * 페이지에서 쓰는 훅.
 * db: 전체 데이터 (불러오는 중엔 null)
 * 나머지: 추가/수정/삭제 동작 — 서버에 저장한 뒤 화면 데이터도 맞춰 바꾼다
 */
export function useDB() {
  const supabase = createClient();
  const [db, setDb] = useState<DB | null>(null);
  const [loadError, setLoadError] = useState(false);

  const reload = useCallback(async () => {
    try {
      const [people, products, sheets] = await Promise.all([
        fetchAllPeople(supabase),
        supabase.from("products").select("*").order("id").then(({ data, error }) => {
          if (error) throw error;
          return (data ?? []) as ProductRow[];
        }),
        supabase.from("order_sheets").select("*").order("date", { ascending: false }).then(({ data, error }) => {
          if (error) throw error;
          return (data ?? []) as SheetRow[];
        }),
      ]);
      setDb({ people: people.map(toPerson), products: products.map(toProduct), sheets: sheets.map(toSheet) });
      setLoadError(false);
    } catch (e) {
      console.error(e);
      setLoadError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  /* ── 주소록 ── */

  async function addPerson(input: PersonInput): Promise<boolean> {
    const { data, error } = await supabase.from("people").insert(input).select().single();
    if (error) return (reportError(error), false);
    setDb((d) => d && { ...d, people: [toPerson(data as PersonRow), ...d.people] });
    return true;
  }

  async function updatePerson(id: number, input: PersonInput): Promise<boolean> {
    const { error } = await supabase.from("people").update(input).eq("id", id);
    if (error) return (reportError(error), false);
    setDb((d) => d && { ...d, people: d.people.map((p) => (p.id === id ? { ...p, ...input } : p)) });
    return true;
  }

  async function deletePerson(id: number): Promise<boolean> {
    const { error } = await supabase.from("people").delete().eq("id", id);
    if (error) return (reportError(error), false);
    setDb((d) => d && { ...d, people: d.people.filter((p) => p.id !== id) });
    return true;
  }

  /* ── 상품 ── */

  async function addProduct(input: ProductInput): Promise<boolean> {
    const { data, error } = await supabase
      .from("products")
      .insert({ name: input.name, price: input.price ?? null })
      .select()
      .single();
    if (error) return (reportError(error), false);
    setDb((d) => d && { ...d, products: [...d.products, toProduct(data as ProductRow)] });
    return true;
  }

  async function updateProduct(id: number, input: ProductInput): Promise<boolean> {
    const { error } = await supabase
      .from("products")
      .update({ name: input.name, price: input.price ?? null })
      .eq("id", id);
    if (error) return (reportError(error), false);
    setDb((d) => d && { ...d, products: d.products.map((p) => (p.id === id ? { ...p, ...input } : p)) });
    return true;
  }

  async function deleteProduct(id: number): Promise<boolean> {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return (reportError(error), false);
    setDb((d) => d && { ...d, products: d.products.filter((p) => p.id !== id) });
    return true;
  }

  /* ── 발주서 ── */

  async function createSheet(input: SheetInput): Promise<number | null> {
    const { data, error } = await supabase.from("order_sheets").insert(input).select().single();
    if (error) return (reportError(error), null);
    const sheet = toSheet(data as SheetRow);
    setDb((d) => d && { ...d, sheets: [sheet, ...d.sheets] });
    return sheet.id;
  }

  async function updateSheet(
    id: number,
    patch: Partial<Pick<OrderSheet, "date" | "memo" | "status" | "items">>,
  ): Promise<boolean> {
    const { error } = await supabase.from("order_sheets").update(patch).eq("id", id);
    if (error) return (reportError(error), false);
    setDb((d) => d && { ...d, sheets: d.sheets.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
    return true;
  }

  async function deleteSheet(id: number): Promise<boolean> {
    const { error } = await supabase.from("order_sheets").delete().eq("id", id);
    if (error) return (reportError(error), false);
    setDb((d) => d && { ...d, sheets: d.sheets.filter((s) => s.id !== id) });
    return true;
  }

  return {
    db,
    loadError,
    reload,
    addPerson,
    updatePerson,
    deletePerson,
    addProduct,
    updateProduct,
    deleteProduct,
    createSheet,
    updateSheet,
    deleteSheet,
  };
}

/** 발주서 줄 구분용 id */
export function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2);
}

export function today(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** 2026-08-03 → "2026년 8월 3일 (월)" */
export function formatDateKorean(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const day = ["일", "월", "화", "수", "목", "금", "토"][new Date(y, m - 1, d).getDay()];
  return `${y}년 ${m}월 ${d}일 (${day})`;
}
