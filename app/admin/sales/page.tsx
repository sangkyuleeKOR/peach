"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState, Loading, PageTitle, StatusBadge } from "@/components/ui";
import { formatDateKorean, useDB } from "@/lib/store";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/** 매출: 발주서에 적힌 수량 × 상품 가격. 연도와 달을 골라 볼 수 있다. */
export default function SalesPage() {
  const { db, loadError } = useDB();
  const now = new Date();

  const years = useMemo(() => {
    const ys = new Set(db?.sheets.map((s) => s.date.slice(0, 4)) ?? []);
    ys.add(String(now.getFullYear()));
    return [...ys].sort().reverse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db]);

  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState<number | "all">("all"); // "all" = 일 년 전체

  /* 고른 해에서 발주서가 있는 달 — 달 버튼에 점으로 표시 */
  const monthsWithData = useMemo(() => {
    const s = new Set<number>();
    for (const sheet of db?.sheets ?? []) {
      if (sheet.date.slice(0, 4) === year) s.add(Number(sheet.date.slice(5, 7)));
    }
    return s;
  }, [db, year]);

  const stats = useMemo(() => {
    if (!db) return null;
    const priceOf = new Map(db.products.map((p) => [p.name, p.price ?? 0]));

    const byMonth = new Map<number, { boxes: number; revenue: number; sheets: number }>();
    const byProduct = new Map<string, { boxes: number; revenue: number }>();
    const monthSheets: typeof db.sheets = [];
    let hasUnpriced = false;

    for (const sheet of db.sheets) {
      if (sheet.date.slice(0, 4) !== year) continue;
      const m = Number(sheet.date.slice(5, 7));
      if (month !== "all" && m !== month) continue;
      if (month !== "all") monthSheets.push(sheet);

      const acc = byMonth.get(m) ?? { boxes: 0, revenue: 0, sheets: 0 };
      acc.sheets += 1;
      for (const item of sheet.items) {
        const price = priceOf.get(item.product) ?? 0;
        if (!price) hasUnpriced = true;
        acc.boxes += item.quantity;
        acc.revenue += price * item.quantity;
        const p = byProduct.get(item.product) ?? { boxes: 0, revenue: 0 };
        p.boxes += item.quantity;
        p.revenue += price * item.quantity;
        byProduct.set(item.product, p);
      }
      byMonth.set(m, acc);
    }

    const months = [...byMonth.entries()].sort((a, b) => a[0] - b[0]);
    const products = [...byProduct.entries()].sort((a, b) => b[1].revenue - a[1].revenue);
    const total = months.reduce(
      (t, [, m]) => ({
        boxes: t.boxes + m.boxes,
        revenue: t.revenue + m.revenue,
        sheets: t.sheets + m.sheets,
      }),
      { boxes: 0, revenue: 0, sheets: 0 },
    );
    monthSheets.sort((a, b) => (a.date < b.date ? 1 : -1));
    return { months, products, total, monthSheets, hasUnpriced };
  }, [db, year, month]);

  if (!db || !stats) return <Loading error={loadError} />;

  const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
  const maxMonthRevenue = Math.max(1, ...stats.months.map(([, m]) => m.revenue));
  const maxProductRevenue = Math.max(1, ...stats.products.map(([, p]) => p.revenue));
  const label = month === "all" ? `${year}년 전체` : `${year}년 ${month}월`;

  const chip = (selected: boolean) =>
    `rounded-xl px-4 py-2.5 text-lg font-bold cursor-pointer transition-colors ${
      selected ? "bg-peach text-white" : "bg-white border-2 border-line text-stone-600 hover:border-peach"
    }`;

  return (
    <main>
      <PageTitle sub="발주서에 적은 수량과 상품 가격으로 계산해요">매출</PageTitle>

      {/* 연도 고르기 */}
      <div className="flex gap-2 mb-3 flex-wrap" role="group" aria-label="연도 선택">
        {years.map((y) => (
          <button key={y} onClick={() => setYear(y)} className={chip(year === y)}>
            {y}년
          </button>
        ))}
      </div>

      {/* 달 고르기 — 달력처럼 줄 맞춰서. 발주서 있는 달엔 점이 찍혀요 */}
      <div
        className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-[repeat(13,1fr)] gap-2 mb-6"
        role="group"
        aria-label="달 선택"
      >
        <button
          onClick={() => setMonth("all")}
          className={`rounded-xl py-3 text-lg font-bold cursor-pointer transition-colors ${
            month === "all"
              ? "bg-peach text-white"
              : "bg-white border-2 border-line text-stone-600 hover:border-peach"
          }`}
        >
          전체
        </button>
        {MONTHS.map((m) => {
          const selected = month === m;
          const hasData = monthsWithData.has(m);
          return (
            <button
              key={m}
              onClick={() => setMonth(m)}
              className={`rounded-xl py-3 text-lg font-bold cursor-pointer transition-colors ${
                selected
                  ? "bg-peach text-white"
                  : hasData
                    ? "bg-white border-2 border-line text-ink hover:border-peach"
                    : "bg-white border-2 border-line text-stone-300 hover:border-peach"
              }`}
            >
              {m}월
              <span
                className={`block mx-auto mt-1 w-1.5 h-1.5 rounded-full ${
                  hasData ? (selected ? "bg-white" : "bg-peach") : "bg-transparent"
                }`}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      {stats.total.sheets === 0 ? (
        <EmptyState title={`${label}에는 발주서가 없어요`} />
      ) : (
        <>
          {/* 큰 숫자 */}
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <div className="rounded-2xl bg-peach text-white p-6">
              <p className="text-lg font-bold text-orange-100">{label} 매출</p>
              <p className="mt-1 text-3xl font-bold tabular">{won(stats.total.revenue)}</p>
            </div>
            <div className="rounded-2xl bg-white border-2 border-line p-6">
              <p className="text-lg font-bold text-stone-500">보낸 박스</p>
              <p className="mt-1 text-3xl font-bold tabular">{stats.total.boxes}박스</p>
            </div>
            <div className="rounded-2xl bg-white border-2 border-line p-6">
              <p className="text-lg font-bold text-stone-500">발주서</p>
              <p className="mt-1 text-3xl font-bold tabular">{stats.total.sheets}장</p>
            </div>
          </div>

          {/* 일 년 전체를 볼 때만: 달별 표 */}
          {month === "all" && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">달별 매출</h2>
              <div className="overflow-x-auto rounded-xl border border-line bg-white">
                <table className="excel-table">
                  <thead>
                    <tr>
                      <th className="w-20">달</th>
                      <th className="w-24">박스</th>
                      <th className="w-36">매출</th>
                      <th>
                        <span className="sr-only">매출 크기 비교</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.months.map(([m, v]) => (
                      <tr key={m}>
                        <td className="whitespace-nowrap">
                          <button
                            onClick={() => setMonth(m)}
                            className="font-bold text-peach-dark underline underline-offset-4 cursor-pointer"
                          >
                            {m}월
                          </button>
                        </td>
                        <td className="tabular">{v.boxes}</td>
                        <td className="tabular whitespace-nowrap">{won(v.revenue)}</td>
                        <td className="w-full min-w-40">
                          <div
                            className="h-6 rounded-r bg-peach"
                            style={{ width: `${Math.max(2, (v.revenue / maxMonthRevenue) * 100)}%` }}
                            aria-hidden
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="font-bold">합계</td>
                      <td className="font-bold tabular">{stats.total.boxes}</td>
                      <td className="font-bold tabular whitespace-nowrap" colSpan={2}>
                        {won(stats.total.revenue)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          )}

          {/* 상품별 매출 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-3">{label} 상품별 매출</h2>
            <div className="overflow-x-auto rounded-xl border border-line bg-white">
              <table className="excel-table">
                <thead>
                  <tr>
                    <th className="w-44">상품</th>
                    <th className="w-24">박스</th>
                    <th className="w-36">매출</th>
                    <th>
                      <span className="sr-only">매출 크기 비교</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.products.map(([name, p]) => (
                    <tr key={name}>
                      <td className="font-bold">{name || "상품 없음"}</td>
                      <td className="tabular">{p.boxes}</td>
                      <td className="tabular whitespace-nowrap">{won(p.revenue)}</td>
                      <td className="w-full min-w-40">
                        <div
                          className="h-6 rounded-r bg-peach"
                          style={{ width: `${Math.max(2, (p.revenue / maxProductRevenue) * 100)}%` }}
                          aria-hidden
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 특정 달을 볼 때: 그 달 발주서 목록 */}
          {month !== "all" && (
            <section>
              <h2 className="text-2xl font-bold mb-3">{label} 발주서</h2>
              <div className="space-y-3">
                {stats.monthSheets.map((s) => (
                  <Link
                    key={s.id}
                    href={`/admin/sheets/${s.id}`}
                    className="flex items-center justify-between rounded-2xl bg-white border border-line px-6 py-4 hover:border-peach transition-colors"
                  >
                    <div>
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
          )}

          {stats.hasUnpriced && (
            <p className="mt-4 text-lg text-stone-500">
              가격을 안 적은 상품은 박스 수에는 들어가지만 매출 금액에는 안 잡혀요. 상품
              페이지에서 가격을 적어 주세요.
            </p>
          )}
        </>
      )}
    </main>
  );
}
