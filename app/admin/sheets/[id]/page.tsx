"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CircleCheck, Download, Printer, Trash2, UserPlus } from "lucide-react";
import { PersonPicker } from "@/components/person-picker";
import { BigButton, Loading, QuantityStepper, StatusBadge } from "@/components/ui";
import { formatDateKorean, newId, useDB } from "@/lib/store";
import type { OrderSheet, Person, SheetItem } from "@/lib/types";

/** 발주서 한 장: 엑셀처럼 보고, 고치고, 인쇄하고, 엑셀 파일로 내려받는다 */
export default function SheetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const sheetId = Number(id);
  const router = useRouter();
  const { db, loadError, updateSheet, deleteSheet } = useDB();
  const [adding, setAdding] = useState(false);

  if (!db) return <Loading error={loadError} />;
  const sheet = db.sheets.find((s) => s.id === sheetId);
  if (!sheet) {
    return (
      <main className="py-16 text-center">
        <p className="text-xl text-stone-500">발주서를 찾을 수 없어요.</p>
        <Link href="/admin/sheets" className="mt-4 inline-block text-lg font-bold text-peach-dark underline underline-offset-4">
          발주서 목록으로
        </Link>
      </main>
    );
  }

  const totalBoxes = sheet.items.reduce((n, i) => n + i.quantity, 0);
  const pickedIds = new Set(sheet.items.map((i) => i.personId).filter((v): v is number => v != null));
  const productNames = db.products.map((p) => p.name);

  function patchSheet(patch: Partial<Pick<OrderSheet, "date" | "memo" | "status" | "items">>) {
    updateSheet(sheetId, patch);
  }

  function patchItem(itemId: string, patch: Partial<SheetItem>) {
    patchSheet({
      items: sheet!.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
    });
  }

  function addPerson(p: Person) {
    patchSheet({
      items: [
        ...sheet!.items,
        { id: newId(), personId: p.id, name: p.name, phone: p.phone, address: p.address, product: productNames[0] ?? "", quantity: 1 },
      ],
    });
  }

  /** 엑셀에서 바로 열리는 CSV 파일로 내려받기 */
  function downloadCsv() {
    const esc = (v: string | number) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const rows = [
      ["날짜", "이름", "휴대전화", "주소", "상품", "수량", "메모"],
      ...sheet!.items.map((i) => [sheet!.date, i.name, i.phone, i.address, i.product, i.quantity, i.memo ?? ""]),
    ];
    // ﻿(BOM)이 있어야 엑셀이 한글을 제대로 읽는다
    const csv = "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formatDateKorean(sheet!.date)} 발주서.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main>
      <Link
        href="/admin/sheets"
        className="no-print inline-flex items-center gap-1.5 text-lg font-bold text-stone-500 hover:text-stone-700 mb-4"
      >
        <ArrowLeft className="w-5 h-5" aria-hidden /> 발주서 목록
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-3xl font-bold">{formatDateKorean(sheet.date)} 발주서</h1>
          <p className="mt-1 text-lg text-stone-600">
            {sheet.items.length}명 · 총 {totalBoxes}박스
            {sheet.memo && <span className="ml-2 text-stone-400">· {sheet.memo}</span>}
          </p>
        </div>
        <StatusBadge status={sheet.status} />
      </div>

      {/* 도구 버튼들 */}
      <div className="no-print flex flex-wrap gap-3 mb-6">
        <BigButton variant="secondary" onClick={() => window.print()}>
          <Printer className="w-6 h-6" aria-hidden /> 인쇄하기
        </BigButton>
        <BigButton variant="secondary" onClick={downloadCsv}>
          <Download className="w-6 h-6" aria-hidden /> 엑셀로 내려받기
        </BigButton>
        <BigButton variant="secondary" onClick={() => setAdding((v) => !v)}>
          <UserPlus className="w-6 h-6" aria-hidden /> 사람 추가
        </BigButton>
        {sheet.status === "작성중" ? (
          <BigButton onClick={() => patchSheet({ status: "발송완료" })}>
            <CircleCheck className="w-6 h-6" aria-hidden /> 발송 완료로 표시
          </BigButton>
        ) : (
          <BigButton variant="ghost" onClick={() => patchSheet({ status: "작성중" })}>
            발송 완료 취소
          </BigButton>
        )}
      </div>

      {adding && (
        <div className="no-print rounded-2xl bg-white border-2 border-peach p-5 mb-6">
          <PersonPicker people={db.people} pickedIds={pickedIds} onPick={addPerson} />
        </div>
      )}

      {/* 휴대폰: 카드 목록 (옆으로 밀 필요 없음) */}
      <div className="sm:hidden print:hidden space-y-3">
        {sheet.items.map((i, idx) => (
          <div key={i.id} className="rounded-2xl bg-white border border-line p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xl font-bold">
                  <span className="text-stone-400 tabular mr-1.5">{idx + 1}.</span>
                  {i.name}
                </p>
                <p className="tabular text-lg text-stone-600">{i.phone}</p>
              </div>
              <button
                onClick={() => {
                  if (!window.confirm(`${i.name} 님을 이 발주서에서 뺄까요?`)) return;
                  patchSheet({ items: sheet.items.filter((x) => x.id !== i.id) });
                }}
                aria-label={`${i.name} 빼기`}
                className="shrink-0 inline-flex items-center rounded-lg border border-red-200 text-red-600 p-2 cursor-pointer hover:bg-red-50"
              >
                <Trash2 className="w-5 h-5" aria-hidden />
              </button>
            </div>
            <p className="mt-2 text-lg text-stone-700">{i.address}</p>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <select
                className="rounded-lg border border-line px-2 py-2.5 text-base bg-white cursor-pointer"
                value={i.product}
                onChange={(e) => patchItem(i.id, { product: e.target.value })}
                aria-label={`${i.name} 상품`}
              >
                {!productNames.includes(i.product) && (
                  <option value={i.product}>{i.product || "상품 없음"}</option>
                )}
                {productNames.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <QuantityStepper value={i.quantity} onChange={(v) => patchItem(i.id, { quantity: v })} />
            </div>
          </div>
        ))}
        <p className="text-right text-xl font-bold pr-1">합계 {totalBoxes}박스</p>
      </div>

      {/* 태블릿·컴퓨터·인쇄: 엑셀식 표 */}
      <div className="hidden sm:block print:block print-area overflow-x-auto rounded-xl border border-line bg-white">
        <table className="excel-table">
          <thead>
            <tr>
              <th className="w-12">번호</th>
              <th className="w-24">이름</th>
              <th className="w-40">휴대전화</th>
              <th>주소</th>
              <th className="w-28">상품</th>
              <th className="w-44 print:w-16">수량</th>
              <th className="no-print w-16">빼기</th>
            </tr>
          </thead>
          <tbody>
            {sheet.items.map((i, idx) => (
              <tr key={i.id}>
                <td className="tabular text-center">{idx + 1}</td>
                <td className="font-bold whitespace-nowrap">{i.name}</td>
                <td className="tabular whitespace-nowrap">{i.phone}</td>
                <td className="text-base">{i.address}</td>
                <td>
                  <select
                    className="no-print rounded-lg border border-line px-2 py-2 text-base bg-white cursor-pointer"
                    value={i.product}
                    onChange={(e) => patchItem(i.id, { product: e.target.value })}
                    aria-label={`${i.name} 상품`}
                  >
                    {!productNames.includes(i.product) && (
                      <option value={i.product}>{i.product || "상품 없음"}</option>
                    )}
                    {productNames.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <span className="hidden print:inline">{i.product}</span>
                </td>
                <td>
                  <span className="no-print">
                    <QuantityStepper value={i.quantity} onChange={(v) => patchItem(i.id, { quantity: v })} />
                  </span>
                  <span className="hidden print:inline tabular">{i.quantity}</span>
                </td>
                <td className="no-print">
                  <button
                    onClick={() => {
                      if (!window.confirm(`${i.name} 님을 이 발주서에서 뺄까요?`)) return;
                      patchSheet({ items: sheet.items.filter((x) => x.id !== i.id) });
                    }}
                    aria-label={`${i.name} 빼기`}
                    className="inline-flex items-center rounded-lg border border-red-200 text-red-600 p-2 cursor-pointer hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="font-bold text-right">
                합계
              </td>
              <td className="font-bold tabular" colSpan={2}>
                {totalBoxes}박스
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="no-print mt-8 text-right">
        <button
          onClick={async () => {
            if (!window.confirm("이 발주서를 완전히 지울까요?")) return;
            if (await deleteSheet(sheetId)) router.push("/admin/sheets");
          }}
          className="text-red-600 text-lg underline underline-offset-4 cursor-pointer"
        >
          발주서 지우기
        </button>
      </div>
    </main>
  );
}
