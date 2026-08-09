"use client";

import Link from "next/link";
import { FilePlus2, Trash2 } from "lucide-react";
import { BigButton, EmptyState, PageTitle, StatusBadge } from "@/components/ui";
import { formatDateKorean, useDB } from "@/lib/store";

/** 발주서 목록: 날짜별로 한 장씩 */
export default function SheetsPage() {
  const { db, update } = useDB();
  if (!db) return null;

  const sheets = [...db.sheets].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <main>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageTitle sub="날짜별로 한 장씩 만들어요">발주서</PageTitle>
        <Link href="/admin/sheets/new">
          <BigButton>
            <FilePlus2 className="w-6 h-6" aria-hidden /> 새 발주서 만들기
          </BigButton>
        </Link>
      </div>

      {sheets.length === 0 ? (
        <EmptyState
          title="아직 발주서가 없어요"
          action={
            <Link href="/admin/sheets/new">
              <BigButton>
                <FilePlus2 className="w-6 h-6" aria-hidden /> 새 발주서 만들기
              </BigButton>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {sheets.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-2xl bg-white border border-line px-6 py-4 hover:border-peach transition-colors"
            >
              <Link href={`/admin/sheets/${s.id}`} className="flex-1 min-w-0">
                <p className="text-xl font-bold">{formatDateKorean(s.date)} 발주서</p>
                <p className="text-lg text-stone-500">
                  {s.items.length}명 · 총 {s.items.reduce((n, i) => n + i.quantity, 0)}박스
                  {s.memo && <span className="ml-2 text-stone-400">· {s.memo}</span>}
                </p>
              </Link>
              <StatusBadge status={s.status} />
              <button
                onClick={() => {
                  if (!window.confirm(`${formatDateKorean(s.date)} 발주서를 지울까요?`)) return;
                  update((d) => ({ ...d, sheets: d.sheets.filter((x) => x.id !== s.id) }));
                }}
                aria-label="발주서 삭제"
                className="shrink-0 inline-flex items-center rounded-lg border border-red-200 text-red-600 px-3 py-2 cursor-pointer hover:bg-red-50"
              >
                <Trash2 className="w-5 h-5" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
