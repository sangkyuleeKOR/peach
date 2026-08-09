"use client";

import Link from "next/link";
import { ChevronRight, FilePlus2 } from "lucide-react";
import { Loading, StatusBadge } from "@/components/ui";
import { formatDateKorean, useDB } from "@/lib/store";

/** 어머니 첫 화면: 오늘 할 일 하나(발주서 만들기)에 집중 */
export default function AdminHome() {
  const { db, loadError } = useDB();
  if (!db) return <Loading error={loadError} />;

  const recentSheets = [...db.sheets].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);

  // 이번 달 매출 한 줄 요약
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const priceOf = new Map(db.products.map((p) => [p.name, p.price ?? 0]));
  const monthRevenue = db.sheets
    .filter((s) => s.date.startsWith(ym))
    .flatMap((s) => s.items)
    .reduce((sum, i) => sum + (priceOf.get(i.product) ?? 0) * i.quantity, 0);

  return (
    <main>
      <h1 className="text-3xl font-bold">안녕하세요 👋</h1>
      <p className="mt-1 text-xl text-stone-600">오늘도 맛있는 복숭아 보내는 날이에요.</p>

      {/* 제일 자주 하는 일: 전체 폭 큰 버튼 */}
      <Link
        href="/admin/sheets/new"
        className="mt-6 flex items-center justify-center gap-3 rounded-2xl bg-peach text-white p-6 text-2xl font-bold hover:bg-peach-dark transition-colors"
      >
        <FilePlus2 className="w-8 h-8" aria-hidden />
        발주서 만들기
      </Link>

      {/* 이번 달 매출 한 줄 */}
      <Link
        href="/admin/sales"
        className="mt-4 flex items-center justify-between rounded-2xl bg-white border border-line px-6 py-4 hover:border-peach transition-colors"
      >
        <span className="text-xl">
          이번 달 매출{" "}
          <b className="tabular text-peach-dark">{monthRevenue.toLocaleString("ko-KR")}원</b>
        </span>
        <ChevronRight className="w-6 h-6 text-stone-400" aria-hidden />
      </Link>

      {/* 최근 발주서 */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">최근 발주서</h2>
          <Link href="/admin/sheets" className="text-lg font-bold text-peach-dark hover:underline">
            전체 보기 →
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {recentSheets.length === 0 && (
            <p className="text-lg text-stone-500 py-6 text-center">
              아직 발주서가 없어요. 위의 큰 버튼으로 첫 발주서를 만들어 보세요.
            </p>
          )}
          {recentSheets.map((s) => (
            <Link
              key={s.id}
              href={`/admin/sheets/${s.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white border border-line px-6 py-4 hover:border-peach transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xl font-bold">{formatDateKorean(s.date)} 발주서</p>
                <p className="text-lg text-stone-500">
                  {s.items.length}명 · {s.items.reduce((n, i) => n + i.quantity, 0)}박스
                </p>
              </div>
              <StatusBadge status={s.status} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
