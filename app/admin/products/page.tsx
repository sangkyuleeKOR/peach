"use client";

import { useState } from "react";
import { PackagePlus, Pencil, Trash2 } from "lucide-react";
import { BigButton, EmptyState, Field, Loading, PageTitle, inputClass } from "@/components/ui";
import { useDB } from "@/lib/store";
import type { Product, ProductInput } from "@/lib/types";

type Editing = { mode: "new" } | { mode: "edit"; product: Product } | null;

/** 상품 관리: 파는 복숭아 종류를 등록해 두면 발주서에서 골라 쓸 수 있다 */
export default function ProductsPage() {
  const { db, loadError, addProduct, updateProduct, deleteProduct } = useDB();
  const [editing, setEditing] = useState<Editing>(null);

  if (!db) return <Loading error={loadError} />;

  function remove(p: Product) {
    if (!window.confirm(`"${p.name}" 상품을 지울까요?`)) return;
    deleteProduct(p.id);
  }

  return (
    <main>
      <div className="flex items-start justify-between gap-4">
        <PageTitle sub="여기 등록한 상품을 발주서에서 골라요">상품</PageTitle>
        <BigButton onClick={() => setEditing({ mode: "new" })} className="shrink-0 whitespace-nowrap">
          <PackagePlus className="w-6 h-6" aria-hidden /> 새 상품 추가
        </BigButton>
      </div>

      {db.products.length === 0 ? (
        <EmptyState
          title="아직 등록한 상품이 없어요"
          action={
            <BigButton onClick={() => setEditing({ mode: "new" })}>
              <PackagePlus className="w-6 h-6" aria-hidden /> 새 상품 추가
            </BigButton>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="excel-table">
            <thead>
              <tr>
                <th>상품명</th>
                <th className="w-36">가격</th>
                <th className="w-36">관리</th>
              </tr>
            </thead>
            <tbody>
              {db.products.map((p) => (
                <tr key={p.id}>
                  <td className="font-bold">{p.name}</td>
                  <td className="tabular whitespace-nowrap">
                    {p.price ? `${p.price.toLocaleString("ko-KR")}원` : <span className="text-stone-400">—</span>}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing({ mode: "edit", product: p })}
                        className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-line px-3 py-1.5 text-base font-bold cursor-pointer hover:border-peach hover:text-peach-dark"
                      >
                        <Pencil className="w-4 h-4 shrink-0" aria-hidden /> 수정
                      </button>
                      <button
                        onClick={() => remove(p)}
                        aria-label={`${p.name} 삭제`}
                        className="inline-flex items-center rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-base cursor-pointer hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProductDialog
          product={editing.mode === "edit" ? editing.product : undefined}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            const ok =
              editing.mode === "edit"
                ? await updateProduct(editing.product.id, data)
                : await addProduct(data);
            if (ok) setEditing(null);
          }}
        />
      )}
    </main>
  );
}

function ProductDialog({
  product,
  onClose,
  onSave,
}: {
  product?: Product;
  onClose: () => void;
  onSave: (data: ProductInput) => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price ? String(product.price) : "");
  const [error, setError] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={product ? "상품 수정" : "새 상품 추가"}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold">{product ? "상품 수정" : "새 상품 추가"}</h2>
        <Field label="상품명" required hint="예: 복숭아 4.5kg, 백도 선물세트">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="복숭아 4.5kg" />
        </Field>
        <Field label="가격 (원)" hint="비워둬도 돼요">
          <input
            className={inputClass}
            type="number"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="35000"
          />
        </Field>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-lg px-4 py-3">
            {error}
          </p>
        )}
        <div className="flex gap-3 pt-1">
          <BigButton variant="secondary" onClick={onClose} className="flex-1">
            취소
          </BigButton>
          <BigButton
            className="flex-1"
            onClick={() => {
              if (!name.trim()) return setError("상품명을 적어 주세요.");
              const n = Number(price);
              onSave({ name: name.trim(), price: price && n > 0 ? n : undefined });
            }}
          >
            저장
          </BigButton>
        </div>
      </div>
    </div>
  );
}
