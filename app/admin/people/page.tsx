"use client";

import { useMemo, useState } from "react";
import { Pencil, Search, Trash2, UserPlus } from "lucide-react";
import { BigButton, EmptyState, Field, Loading, PageTitle, inputClass } from "@/components/ui";
import { useDB } from "@/lib/store";
import type { Person, PersonInput } from "@/lib/types";

type Editing = { mode: "new" } | { mode: "edit"; person: Person } | null;

/** 주소록: 엑셀 표 그대로 + 이름 검색 + 추가/수정/삭제 */
export default function PeoplePage() {
  const { db, loadError, addPerson, updatePerson, deletePerson } = useDB();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Editing>(null);

  const filtered = useMemo(() => {
    if (!db) return [];
    const q = query.trim();
    const list = q
      ? db.people.filter(
          (p) => p.name.includes(q) || p.phone.includes(q) || p.referrer.includes(q),
        )
      : db.people;
    return [...list].sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }, [db, query]);

  if (!db) return <Loading error={loadError} />;

  function remove(p: Person) {
    if (!window.confirm(`${p.name} 님을 주소록에서 지울까요?`)) return;
    deletePerson(p.id);
  }

  return (
    <main>
      <div className="flex items-start justify-between gap-4">
        <PageTitle sub={`모두 ${db.people.length}명`}>주소록</PageTitle>
        <BigButton onClick={() => setEditing({ mode: "new" })} className="shrink-0 whitespace-nowrap">
          <UserPlus className="w-6 h-6" aria-hidden /> 새 사람 추가
        </BigButton>
      </div>

      {/* 검색 */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-400" aria-hidden />
        <input
          className={`${inputClass} pl-12 text-xl`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름이나 전화번호로 검색"
          aria-label="주소록 검색"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={query ? `"${query}" 로 찾은 사람이 없어요` : "아직 저장된 사람이 없어요"}
          action={
            <BigButton onClick={() => setEditing({ mode: "new" })}>
              <UserPlus className="w-6 h-6" aria-hidden /> 새 사람 추가
            </BigButton>
          }
        />
      ) : (
        <>
        {/* 휴대폰: 카드 목록 (옆으로 밀 필요 없음) */}
        <div className="sm:hidden space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-2xl bg-white border border-line p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xl font-bold">{p.name}</p>
                  <p className="tabular text-lg text-stone-600">
                    {p.phone || <span className="text-stone-400">전화번호 없음</span>}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setEditing({ mode: "edit", person: p })}
                    className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-line px-3 py-2 text-base font-bold cursor-pointer hover:border-peach hover:text-peach-dark"
                  >
                    <Pencil className="w-4 h-4 shrink-0" aria-hidden /> 수정
                  </button>
                  <button
                    onClick={() => remove(p)}
                    aria-label={`${p.name} 삭제`}
                    className="inline-flex items-center rounded-lg border border-red-200 text-red-600 px-3 py-2 cursor-pointer hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-lg text-stone-700">{p.address}</p>
              {p.referrer && <p className="mt-1 text-base text-stone-500">소개: {p.referrer}</p>}
            </div>
          ))}
        </div>

        {/* 태블릿·컴퓨터: 엑셀식 표 */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border border-line bg-white">
          <table className="excel-table">
            <thead>
              <tr>
                <th className="w-28">이름</th>
                <th className="w-44">휴대전화</th>
                <th>주소</th>
                <th className="w-32">연고인</th>
                <th className="w-36">관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="font-bold whitespace-nowrap">{p.name}</td>
                  <td className="tabular whitespace-nowrap">{p.phone}</td>
                  <td>{p.address}</td>
                  <td>{p.referrer || <span className="text-stone-400">—</span>}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing({ mode: "edit", person: p })}
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
        </>
      )}

      {editing && (
        <PersonDialog
          person={editing.mode === "edit" ? editing.person : undefined}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            const ok =
              editing.mode === "edit"
                ? await updatePerson(editing.person.id, data)
                : await addPerson(data);
            if (ok) setEditing(null);
          }}
        />
      )}
    </main>
  );
}

function PersonDialog({
  person,
  onClose,
  onSave,
}: {
  person?: Person;
  onClose: () => void;
  onSave: (data: PersonInput) => void;
}) {
  const [name, setName] = useState(person?.name ?? "");
  const [phone, setPhone] = useState(person?.phone ?? "");
  const [address, setAddress] = useState(person?.address ?? "");
  const [referrer, setReferrer] = useState(person?.referrer ?? "");
  const [error, setError] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={person ? "사람 수정" : "새 사람 추가"}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 space-y-5 max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold">{person ? `${person.name} 님 수정` : "새 사람 추가"}</h2>
        <Field label="이름" required>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
        </Field>
        <Field label="휴대전화" required>
          <input className={inputClass} type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" />
        </Field>
        <Field label="주소" required>
          <textarea className={`${inputClass} min-h-24`} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="도로명 주소와 동·호수까지" />
        </Field>
        <Field label="연고인" hint="누구 소개로 알게 됐는지">
          <input className={inputClass} value={referrer} onChange={(e) => setReferrer(e.target.value)} placeholder="예: 김명신" />
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
              if (!name.trim()) return setError("이름을 적어 주세요.");
              if (!phone.trim()) return setError("휴대전화 번호를 적어 주세요.");
              if (!address.trim()) return setError("주소를 적어 주세요.");
              onSave({ name: name.trim(), phone: phone.trim(), address: address.trim(), referrer: referrer.trim() });
            }}
          >
            저장
          </BigButton>
        </div>
      </div>
    </div>
  );
}
