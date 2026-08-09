"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CircleCheck, Download, Printer, Trash2, UserPlus } from "lucide-react";
import { PersonPicker } from "@/components/person-picker";
import { BigButton, Loading, ProductChips, QuantityStepper, StatusBadge } from "@/components/ui";
import { formatPhone } from "@/lib/format";
import { formatDateKorean, newId, useDB } from "@/lib/store";
import type { OrderSheet, Person, SheetItem } from "@/lib/types";

/** 발주서 한 장: 엑셀처럼 보고, 고치고, 인쇄하고, 엑셀 파일로 내려받는다 */
export default function SheetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const sheetId = Number(id);
  const router = useRouter();
  const { db, loadError, updateSheet, deleteSheet } = useDB();
  const [adding, setAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

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

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold">{formatDateKorean(sheet.date)} 발주서</h1>
          <p className="mt-1 text-lg text-stone-600">
            {sheet.items.length}명 · 총 {totalBoxes}박스
            {sheet.memo && <span className="ml-2 text-stone-400">· {sheet.memo}</span>}
          </p>
        </div>
        <div className="no-print flex items-center gap-3 shrink-0">
          <StatusBadge status={sheet.status} />
          <button
            onClick={async () => {
              if (!window.confirm(`${formatDateKorean(sheet.date)} 발주서를 완전히 지울까요?`)) return;
              if (await deleteSheet(sheetId)) router.push("/admin/sheets");
            }}
            aria-label="발주서 지우기"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border-2 border-red-200 text-red-600 px-3 py-1.5 text-base font-bold cursor-pointer hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 shrink-0" aria-hidden /> 지우기
          </button>
        </div>
      </div>

      {/* 도구 버튼: 휴대폰은 작은 3버튼, 넓은 화면은 한 줄 (발송 완료는 휴대폰에선 하단 고정) */}
      <div className="no-print grid grid-cols-3 gap-3 mb-6 sm:flex sm:flex-wrap">
        <BigButton variant="secondary" onClick={() => window.print()} className="max-sm:px-2 max-sm:text-base">
          <Printer className="w-6 h-6 max-sm:w-5 max-sm:h-5" aria-hidden /> 인쇄
        </BigButton>
        <BigButton variant="secondary" onClick={downloadCsv} className="max-sm:px-2 max-sm:text-base">
          <Download className="w-6 h-6 max-sm:w-5 max-sm:h-5" aria-hidden /> 엑셀
        </BigButton>
        <BigButton variant="secondary" onClick={() => setAdding((v) => !v)} className="max-sm:px-2 max-sm:text-base">
          <UserPlus className="w-6 h-6 max-sm:w-5 max-sm:h-5" aria-hidden /> 사람 추가
        </BigButton>
        <div className="hidden sm:block">
          {sheet.status === "작성중" ? (
            <BigButton onClick={() => patchSheet({ status: "발송완료" })}>
              <CircleCheck className="w-6 h-6" aria-hidden /> 발송 완료
            </BigButton>
          ) : (
            <BigButton variant="ghost" onClick={() => patchSheet({ status: "작성중" })}>
              발송 완료 취소
            </BigButton>
          )}
        </div>
      </div>

      {adding && (
        <div className="no-print rounded-2xl bg-white border-2 border-peach p-5 mb-6">
          <PersonPicker people={db.people} pickedIds={pickedIds} onPick={addPerson} />
        </div>
      )}

      {/* 휴대폰: 미니 엑셀 표 — 줄을 누르면 수정 창이 올라온다 */}
      <div className="sm:hidden print:hidden">
        <div className="rounded-xl border border-line bg-white overflow-hidden">
          <table className="excel-table">
            <thead>
              <tr>
                <th>이름</th>
                <th className="w-[1%]">상품</th>
                <th className="w-[1%]">수량</th>
              </tr>
            </thead>
            <tbody>
              {sheet.items.map((i) => (
                <tr
                  key={i.id}
                  onClick={() => setEditingItemId(i.id)}
                  className="cursor-pointer"
                >
                  <td className="font-bold">{i.name}</td>
                  <td className="whitespace-nowrap text-base">
                    {i.product.replace("복숭아 ", "") || "—"}
                  </td>
                  <td className="tabular text-center">{i.quantity}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="font-bold">합계</td>
                <td className="font-bold text-right">{sheet.items.length}명</td>
                <td className="font-bold tabular text-center">{totalBoxes}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="mt-2 text-center text-base text-stone-500">줄을 누르면 고칠 수 있어요</p>

        {/* 발송 완료 — 스크롤해도 하단에 붙어 있음 */}
        <div className="no-print sticky bottom-24 z-10 mt-4">
          {sheet.status === "작성중" ? (
            <BigButton onClick={() => patchSheet({ status: "발송완료" })} className="w-full text-xl shadow-lg">
              <CircleCheck className="w-6 h-6" aria-hidden /> 발송 완료하기
            </BigButton>
          ) : (
            <BigButton
              variant="secondary"
              onClick={() => patchSheet({ status: "작성중" })}
              className="w-full shadow-lg"
            >
              발송 완료 취소
            </BigButton>
          )}
        </div>
      </div>

      {/* 태블릿·컴퓨터·인쇄: 엑셀식 표 */}
      <div className="hidden sm:block print:block print-area overflow-x-auto rounded-xl border border-line bg-white">
        <table className="excel-table">
          <thead>
            <tr>
              <th className="w-[1%]">번호</th>
              <th className="w-[1%]">이름</th>
              <th className="w-[1%]">휴대전화</th>
              <th>주소</th>
              <th className="w-[1%]">상품</th>
              <th className="w-[1%] print:w-16">수량</th>
              <th className="no-print w-[1%]">빼기</th>
            </tr>
          </thead>
          <tbody>
            {sheet.items.map((i, idx) => (
              <tr key={i.id}>
                <td className="tabular text-center">{idx + 1}</td>
                <td className="font-bold whitespace-nowrap">{i.name}</td>
                <td className="tabular whitespace-nowrap">{formatPhone(i.phone)}</td>
                <td className="text-base">{i.address}</td>
                <td>
                  <select
                    className="no-print h-14 rounded-xl border-2 border-line px-3 text-lg bg-white cursor-pointer"
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

      {/* 줄 수정 창 (휴대폰) */}
      {(() => {
        const item = sheet.items.find((i) => i.id === editingItemId);
        if (!item) return null;
        return (
          <ItemEditSheet
            item={item}
            productNames={productNames}
            onChange={(patch) => patchItem(item.id, patch)}
            onRemove={() => {
              if (!window.confirm(`${item.name} 님을 이 발주서에서 뺄까요?`)) return;
              patchSheet({ items: sheet.items.filter((x) => x.id !== item.id) });
              setEditingItemId(null);
            }}
            onClose={() => setEditingItemId(null)}
          />
        );
      })()}
    </main>
  );
}

/** 표의 한 줄을 고치는 창 — 아래에서 올라온다 */
function ItemEditSheet({
  item,
  productNames,
  onChange,
  onRemove,
  onClose,
}: {
  item: SheetItem;
  productNames: string[];
  onChange: (patch: Partial<SheetItem>) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${item.name} 수정`}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-2xl font-bold">
            {item.name}
            <span className="ml-3 tabular text-lg font-normal text-stone-500">
              {formatPhone(item.phone)}
            </span>
          </p>
          <button
            onClick={onRemove}
            className="shrink-0 whitespace-nowrap text-red-600 text-base font-bold cursor-pointer hover:underline underline-offset-4"
          >
            이 줄 빼기
          </button>
        </div>
        <p className="text-lg text-stone-600">{item.address}</p>
        <ProductChips
          options={productNames}
          value={item.product}
          onChange={(v) => onChange({ product: v })}
          label={`${item.name} 상품`}
        />
        <div className="flex items-center gap-3">
          <QuantityStepper value={item.quantity} onChange={(v) => onChange({ quantity: v })} />
          <BigButton onClick={onClose} className="flex-1">
            확인
          </BigButton>
        </div>
      </div>
    </div>
  );
}
