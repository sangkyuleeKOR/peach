"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { inputClass } from "./ui";
import { formatPhone } from "@/lib/format";
import type { Person } from "@/lib/types";

/** 이름을 검색해서 발주서에 담는 부품 — 같은 사람을 여러 번 담을 수도 있다 */
export function PersonPicker({
  people,
  onPick,
}: {
  people: Person[];
  onPick: (p: Person) => void;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().normalize("NFC");
    if (!q) return [];
    const digits = q.replace(/\D/g, "");
    return people
      .filter(
        (p) =>
          p.name.normalize("NFC").includes(q) ||
          (digits && p.phone.replace(/\D/g, "").includes(digits)),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "ko"))
      .slice(0, 8);
  }, [people, query]);

  return (
    <div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-400" aria-hidden />
        <input
          className={`${inputClass} pl-12 text-xl`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름을 적으면 주소록에서 찾아져요"
          aria-label="주소록에서 사람 찾기"
        />
      </div>

      {query.trim() && (
        <ul className="mt-2 rounded-xl border border-line bg-white divide-y divide-line overflow-hidden">
          {results.length === 0 && (
            <li className="px-5 py-4 text-lg text-stone-500">
              &ldquo;{query}&rdquo; 로 찾은 사람이 없어요. 주소록에 먼저 추가해 주세요.
            </li>
          )}
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(p);
                  setQuery("");
                }}
                className="w-full text-left px-5 py-3.5 cursor-pointer hover:bg-peach-soft transition-colors"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="text-lg font-bold">{p.name}</span>
                    <span className="ml-3 text-base text-stone-500 tabular">{formatPhone(p.phone)}</span>
                    <span className="block text-base text-stone-500 truncate">{p.address}</span>
                  </span>
                  <span className="shrink-0 text-peach-dark font-bold text-lg">담기 +</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
