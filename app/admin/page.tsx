"use client";

import Link from "next/link";
import { BookUser, FilePlus2 } from "lucide-react";
import { StatusBadge } from "@/components/ui";
import { formatDateKorean, useDB } from "@/lib/store";

/** 어머니 첫 화면: 오늘 할 일이 한눈에 */
export default function AdminHome() {
  const { db } = useDB();
  if (!db) return null;

  const recentSheets = [...db.sheets].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);

  return (
    <main>
      <h1 className="text-3xl font-bold">안녕하세요 👋</h1>
      <p className="mt-1 text-xl text-stone-600">오늘도 맛있는 복숭아 보내는 날이에요.</p>

      {/* 큰 버튼 두 개 */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/sheets/new"
          className="rounded-2xl bg-peach text-white p-6 hover:bg-peach-dark transition-colors"
        >
          <FilePlus2 className="w-9 h-9" aria-hidden />
          <p className="mt-3 text-2xl font-bold">발주서 만들기</p>
          <p className="mt-1 text-lg text-orange-100">주소록에서 이름을 찾아 담아요</p>
        </Link>
        <Link
          href="/admin/people"
          className="rounded-2xl bg-white border-2 border-line p-6 hover:border-peach transition-colors"
        >
          <BookUser className="w-9 h-9 text-peach-dark" aria-hidden />
          <p className="mt-3 text-2xl font-bold">주소록</p>
          <p className="mt-1 text-lg text-stone-500">{db.people.length}명 저장되어 있어요</p>
        </Link>
      </div>

      {/* 최근 발주서 */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">최근 발주서</h2>
          <Link href="/admin/sheets" className="text-lg font-bold text-peach-dark hover:underline">
            전체 보기 →
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {recentSheets.map((s) => (
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
    </main>
  );
}
