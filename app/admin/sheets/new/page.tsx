"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BigButton, Field, Loading, PageTitle, inputClass } from "@/components/ui";
import { formatDateKorean, today, useDB } from "@/lib/store";

/** 발주서 만들기: 날짜와 메모만 정하면 바로 만들어지고, 사람은 발주서 안에서 담는다 */
export default function NewSheetPage() {
  const router = useRouter();
  const { db, loadError, createSheet } = useDB();

  const [date, setDate] = useState(today());
  const [saving, setSaving] = useState(false);

  if (!db) return <Loading error={loadError} />;

  async function save() {
    setSaving(true);
    const sheetId = await createSheet({ date, memo: "", items: [] });
    setSaving(false);
    if (sheetId != null) router.push(`/admin/sheets/${sheetId}`);
  }

  return (
    <main className="mx-auto max-w-xl">
      <PageTitle sub="만들고 나서 발주서 안에서 사람을 담아요">새 발주서 만들기</PageTitle>

      <div className="rounded-2xl bg-white border border-line p-6 space-y-6">
        <Field label="보내는 날짜" required>
          <input
            type="date"
            className={`${inputClass} text-xl`}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <p className="-mt-3 text-lg text-stone-500">
          {formatDateKorean(date)} 발주서가 만들어져요.
        </p>

        <div className="flex gap-3 pt-1">
          <BigButton variant="secondary" onClick={() => router.push("/admin/sheets")} className="flex-1">
            취소
          </BigButton>
          <BigButton onClick={save} disabled={saving} className="flex-[2] text-xl">
            {saving ? "만드는 중…" : "발주서 만들기"}
          </BigButton>
        </div>
      </div>
    </main>
  );
}
