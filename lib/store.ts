"use client";

import { useCallback, useEffect, useState } from "react";
import { MOCK_ORDERS, MOCK_PEOPLE, MOCK_PRODUCTS, MOCK_SHEETS } from "./mock";
import type { CustomerOrder, OrderSheet, Person, Product } from "./types";

/**
 * 임시 저장소 — 브라우저 localStorage에 저장한다.
 * 나중에 Supabase를 붙일 때 이 파일의 함수들만 API 호출로 바꾸면 된다.
 */

export type DB = {
  people: Person[];
  products: Product[];
  sheets: OrderSheet[];
  orders: CustomerOrder[];
};

const KEY = "peach-order-db-v2"; // 상품 추가하면서 v2로 올림

function seed(): DB {
  return { people: MOCK_PEOPLE, products: MOCK_PRODUCTS, sheets: MOCK_SHEETS, orders: MOCK_ORDERS };
}

export function loadDB(): DB {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const db = seed();
      window.localStorage.setItem(KEY, JSON.stringify(db));
      return db;
    }
    return JSON.parse(raw) as DB;
  } catch {
    return seed();
  }
}

export function saveDB(db: DB) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    // 저장 실패는 시연용이므로 무시
  }
}

export function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2);
}

/** 페이지에서 쓰는 훅: const { db, update } = useDB() */
export function useDB() {
  const [db, setDb] = useState<DB | null>(null);

  useEffect(() => {
    setDb(loadDB());
  }, []);

  const update = useCallback((fn: (d: DB) => DB) => {
    setDb((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      saveDB(next);
      return next;
    });
  }, []);

  return { db, update };
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
