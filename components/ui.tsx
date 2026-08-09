"use client";

import { Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";

/** 큰 글자, 큰 버튼 — 연세 있으신 분 기준의 공용 부품들 */

export function BigButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-peach text-white hover:bg-peach-dark",
    secondary: "bg-white text-ink border-2 border-line hover:border-peach hover:text-peach-dark",
    danger: "bg-white text-red-700 border-2 border-red-200 hover:bg-red-50",
    ghost: "bg-transparent text-stone-600 hover:bg-stone-100",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 min-h-14 text-lg font-bold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-4 focus-visible:outline-peach/50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-lg font-bold mb-1.5">
        {label}
        {required && <span className="text-peach-dark ml-1">*</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-base text-stone-500">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border-2 border-line bg-white px-4 py-3 text-lg focus:border-peach focus:outline-none placeholder:text-stone-400";

/** 수량처럼 숫자를 크게 +/- 로 조절 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-xl border-2 border-line bg-white overflow-hidden">
      <button
        type="button"
        aria-label="수량 줄이기"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-14 h-14 flex items-center justify-center cursor-pointer hover:bg-stone-100 text-stone-700"
      >
        <Minus className="w-6 h-6" />
      </button>
      <span className="w-16 text-center text-2xl font-bold tabular">{value}</span>
      <button
        type="button"
        aria-label="수량 늘리기"
        onClick={() => onChange(value + 1)}
        className="w-14 h-14 flex items-center justify-center cursor-pointer hover:bg-stone-100 text-stone-700"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}

export function PageTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold">{children}</h1>
      {sub && <p className="mt-1 text-lg text-stone-600">{sub}</p>}
    </div>
  );
}

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-line bg-white py-16 text-center">
      <p className="text-xl text-stone-500">{title}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Loading({ error }: { error?: boolean }) {
  return (
    <div className="py-20 text-center text-xl text-stone-500">
      {error ? (
        <>
          데이터를 불러오지 못했어요.
          <br />
          인터넷 연결을 확인하고 새로고침해 주세요.
        </>
      ) : (
        "불러오는 중이에요…"
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const color =
    status === "발송완료" || status === "발주완료"
      ? "bg-green-100 text-green-800 border-green-300"
      : "bg-orange-100 text-orange-800 border-orange-300";
  return (
    <span className={`inline-block whitespace-nowrap rounded-lg border px-3 py-1 text-base font-bold ${color}`}>
      {status}
    </span>
  );
}

/** 상품 고르기 — 드롭다운 대신 눌러서 고르는 버튼 (수량 버튼과 같은 높이) */
export function ProductChips({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const opts = !value || options.includes(value) ? options : [value, ...options];
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {opts.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`rounded-xl border-2 px-4 min-h-14 text-lg font-bold cursor-pointer transition-colors ${
            value === t
              ? "border-peach bg-peach-soft text-peach-dark"
              : "border-line bg-white text-stone-500 hover:border-peach"
          }`}
        >
          {t || "상품 없음"}
        </button>
      ))}
    </div>
  );
}
