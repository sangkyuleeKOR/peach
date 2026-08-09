"use client";

import Link from "next/link";
import { ChevronRight, FilePlus2 } from "lucide-react";
import { BigButton, EmptyState, Loading, PageTitle, StatusBadge } from "@/components/ui";
import { formatDateKorean, useDB } from "@/lib/store";

/** 발주서 목록: 날짜별로 한 장씩. 지우기는 발주서를 열어서 안에서. */
export default function SheetsPage() {
  const { db, loadError } = useDB();
  if (!db) return <Loading error={loadError} />;

  const sheets = [...db.sheets].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <main>
      <div className="flex items-start justify-between gap-4">
        <PageTitle sub="날짜별로 한 장씩 만들어요">발주서</PageTitle>
        {/* 컴퓨터: 제목 오른쪽 버튼 */}
        <Link href="/admin/sheets/new" className="hidden sm:block shrink-0">
          <BigButton className="whitespace-nowrap">
            <FilePlus2 className="w-6 h-6" aria-hidden /> 새 발주서 만들기
          </BigButton>
        </Link>
      </div>

      {/* 휴대폰: 전체 폭 버튼 */}
      <Link href="/admin/sheets/new" className="sm:hidden block mb-4">
        <BigButton className="w-full">
          <FilePlus2 className="w-6 h-6" aria-hidden /> 새 발주서 만들기
        </BigButton>
      </Link>

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
            <Link
              key={s.id}
              href={`/admin/sheets/${s.id}`}
              className="flex items-center gap-3 rounded-2xl bg-white border border-line px-6 py-4 hover:border-peach transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold">{formatDateKorean(s.date)} 발주서</p>
                <p className="text-lg text-stone-500">
                  {s.items.length}명 · 총 {s.items.reduce((n, i) => n + i.quantity, 0)}박스
                  {s.memo && <span className="ml-2 text-stone-400">· {s.memo}</span>}
                </p>
              </div>
              <StatusBadge status={s.status} />
              <ChevronRight className="w-6 h-6 shrink-0 text-stone-300" aria-hidden />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
