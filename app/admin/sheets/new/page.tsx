"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { PersonPicker } from "@/components/person-picker";
import { BigButton, Field, Loading, PageTitle, ProductChips, ProductSelect, QuantityStepper, inputClass } from "@/components/ui";
import { formatDateKorean, newId, today, useDB } from "@/lib/store";
import type { Person, SheetItem } from "@/lib/types";

/** 발주서 만들기: ① 날짜 고르고 ② 이름 찾아 담고 ③ 수량 적고 ④ 저장 */
export default function NewSheetPage() {
  const router = useRouter();
  const { db, loadError, createSheet } = useDB();

  const [date, setDate] = useState(today());
  const [memo, setMemo] = useState("");
  const [items, setItems] = useState<SheetItem[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!db) return <Loading error={loadError} />;

  const totalBoxes = items.reduce((n, i) => n + i.quantity, 0);
  const productNames = db.products.map((p) => p.name);

  function addPerson(p: Person) {
    setItems((prev) => [
      ...prev,
      {
        id: newId(),
        personId: p.id,
        name: p.name,
        phone: p.phone,
        address: p.address,
        product: productNames[0] ?? "",
        quantity: 1,
      },
    ]);
  }

  function patchItem(id: string, patch: Partial<SheetItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function save() {
    if (items.length === 0) return setError("보낼 사람을 한 명 이상 담아 주세요.");
    setSaving(true);
    const sheetId = await createSheet({ date, memo: memo.trim(), items });
    setSaving(false);
    if (sheetId != null) router.push(`/admin/sheets/${sheetId}`);
  }

  return (
    <main>
      <PageTitle sub="이름을 검색해서 담고, 수량만 적으면 돼요">
        새 발주서 만들기
      </PageTitle>

      <div className="space-y-8">
        {/* ① 날짜 */}
        <section className="rounded-2xl bg-white border border-line p-6">
          <h2 className="text-xl font-bold mb-3">
            <span className="text-peach-dark mr-2">①</span>보내는 날짜
          </h2>
          <input
            type="date"
            className={`${inputClass} w-full sm:max-w-xs text-xl`}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="발주 날짜"
          />
          <p className="mt-2 text-lg text-stone-500">{formatDateKorean(date)} 발주서가 만들어져요.</p>
        </section>

        {/* ② 사람 담기 */}
        <section className="rounded-2xl bg-white border border-line p-6">
          <h2 className="text-xl font-bold mb-3">
            <span className="text-peach-dark mr-2">②</span>보낼 사람
          </h2>
          <PersonPicker people={db.people} onPick={addPerson} />
        </section>

        {/* ③ 담은 사람 표 */}
        <section className="rounded-2xl bg-white border border-line p-6">
          <h2 className="text-xl font-bold mb-3">
            <span className="text-peach-dark mr-2">③</span>담은 사람{" "}
            <span className="text-stone-500 font-normal">
              {items.length}명 · 총 {totalBoxes}박스
            </span>
          </h2>

          {items.length === 0 ? (
            <p className="text-lg text-stone-500 py-6 text-center">
              위에서 이름을 검색해 담으면 여기에 표가 만들어져요.
            </p>
          ) : (
            <>
            {/* 휴대폰: 카드 목록 */}
            <div className="sm:hidden space-y-3">
              {items.map((i) => (
                <div key={i.id} className="rounded-xl border border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-lg font-bold">{i.name}</p>
                      <p className="text-base text-stone-600">{i.address}</p>
                    </div>
                    <button
                      onClick={() => setItems((prev) => prev.filter((x) => x.id !== i.id))}
                      aria-label={`${i.name} 삭제`}
                      className="shrink-0 inline-flex items-center rounded-lg text-red-600 p-2 cursor-pointer hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" aria-hidden />
                    </button>
                  </div>
                  <div className="mt-3 space-y-2.5">
                    <ProductChips
                      options={productNames}
                      value={i.product}
                      onChange={(v) => patchItem(i.id, { product: v })}
                      label={`${i.name} 상품`}
                    />
                    <QuantityStepper value={i.quantity} onChange={(v) => patchItem(i.id, { quantity: v })} />
                  </div>
                </div>
              ))}
            </div>

            {/* 태블릿·컴퓨터: 표 */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-line">
              <table className="excel-table">
                <thead>
                  <tr>
                    <th className="w-[1%]">이름</th>
                    <th>주소</th>
                    <th className="w-[1%]">상품</th>
                    <th className="w-[1%]">수량</th>
                    <th className="w-[1%]">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id}>
                      <td className="font-bold whitespace-nowrap">{i.name}</td>
                      <td className="text-base">{i.address}</td>
                      <td>
                        <ProductSelect
                          options={productNames}
                          value={i.product}
                          onChange={(v) => patchItem(i.id, { product: v })}
                          label={`${i.name} 상품`}
                        />
                      </td>
                      <td>
                        <QuantityStepper
                          value={i.quantity}
                          onChange={(v) => patchItem(i.id, { quantity: v })}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => setItems((prev) => prev.filter((x) => x.id !== i.id))}
                          aria-label={`${i.name} 삭제`}
                          className="inline-flex items-center rounded-lg text-red-600 p-2 cursor-pointer hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" aria-hidden />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </section>

        {/* ④ 메모 */}
        <section className="rounded-2xl bg-white border border-line p-6">
          <Field label="메모" hint="예: 월요일 발송분, 후숙 조금 더 된 것">
            <input className={inputClass} value={memo} onChange={(e) => setMemo(e.target.value)} />
          </Field>
        </section>
      </div>

      {/* 저장 바 — 스크롤해도 화면 아래에 붙어 있음 */}
      <div className="sticky bottom-24 lg:bottom-6 z-10 mt-6">
        {error && (
          <p role="alert" className="mb-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-lg px-4 py-3">
            {error}
          </p>
        )}
        <div className="flex items-center gap-4 rounded-2xl bg-white border border-line shadow-lg px-5 py-3.5">
          <span className="text-xl font-bold whitespace-nowrap tabular">
            {items.length}명 · {totalBoxes}박스
          </span>
          <BigButton onClick={save} disabled={saving} className="flex-1 text-xl">
            {saving ? "저장하는 중…" : "발주서 저장하기"}
          </BigButton>
        </div>
      </div>
    </main>
  );
}
