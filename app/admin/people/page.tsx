"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ChevronRight, Pencil, Search, Trash2, UserPlus } from "lucide-react";
import { BigButton, EmptyState, Field, Loading, PageTitle, inputClass } from "@/components/ui";
import { formatPhone, formatPhoneInput } from "@/lib/format";
import { useDB } from "@/lib/store";
import type { Person, PersonInput } from "@/lib/types";

type Editing = { mode: "new" } | { mode: "edit"; person: Person } | null;

/** 주소록: 이름 검색 + 추가/수정/삭제. 휴대폰은 카드(누르면 수정), 컴퓨터는 엑셀식 표 */
export default function PeoplePage() {
  const { db, loadError, addPerson, updatePerson, deletePerson } = useDB();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query); // 타이핑이 끊기지 않게 검색은 한 박자 늦게
  const [limit, setLimit] = useState(100); // 한 번에 그리는 사람 수 (렉 방지)
  const [editing, setEditing] = useState<Editing>(null);

  // 정렬과 검색용 문자열은 데이터가 바뀔 때 한 번만 준비
  const sorted = useMemo(() => {
    if (!db) return [];
    const collator = new Intl.Collator("ko");
    return db.people
      .map((p) => ({
        p,
        // 검색 대상은 이름과 전화번호만 (연고인은 검색 안 함)
        key: `${p.name} ${p.phone.replace(/\D/g, "")}`.normalize("NFC"),
      }))
      .sort((a, b) => collator.compare(a.p.name, b.p.name));
  }, [db]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().normalize("NFC");
    if (!q) return sorted.map((x) => x.p);
    const digits = q.replace(/\D/g, "");
    return sorted
      .filter(({ key }) => key.includes(q) || (digits.length >= 2 && key.includes(digits)))
      .map((x) => x.p);
  }, [sorted, deferredQuery]);

  useEffect(() => setLimit(100), [deferredQuery]);
  const visible = filtered.slice(0, limit);

  if (!db) return <Loading error={loadError} />;

  function remove(p: Person) {
    if (!window.confirm(`${p.name} 님을 주소록에서 지울까요?`)) return;
    deletePerson(p.id);
    setEditing(null);
  }

  return (
    <main>
      <div className="flex items-start justify-between gap-4">
        <PageTitle sub={`모두 ${db.people.length}명`}>주소록</PageTitle>
        {/* 컴퓨터: 제목 오른쪽 버튼 */}
        <div className="hidden sm:block shrink-0">
          <BigButton onClick={() => setEditing({ mode: "new" })} className="whitespace-nowrap">
            <UserPlus className="w-6 h-6" aria-hidden /> 새 사람 추가
          </BigButton>
        </div>
      </div>

      {/* 검색 — 휴대폰에선 스크롤해도 위에 고정 */}
      <div className="max-sm:sticky max-sm:top-16 max-sm:z-10 max-sm:bg-paper max-sm:pb-2 mb-3 sm:mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-400" aria-hidden />
          <input
            className={`${inputClass} pl-12 text-xl`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름이나 전화번호로 검색"
            aria-label="주소록 검색"
          />
        </div>
      </div>

      {/* 휴대폰: 전체 폭 추가 버튼 */}
      <div className="sm:hidden mb-4">
        <BigButton
          variant="secondary"
          onClick={() => setEditing({ mode: "new" })}
          className="w-full"
        >
          <UserPlus className="w-6 h-6" aria-hidden /> 새 사람 추가
        </BigButton>
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
        {/* 휴대폰: 카드 — 누르면 수정 창이 열림 */}
        <div className="sm:hidden space-y-3">
          {visible.map((p) => (
            <button
              key={p.id}
              onClick={() => setEditing({ mode: "edit", person: p })}
              className="w-full text-left rounded-2xl bg-white border border-line p-5 cursor-pointer hover:border-peach transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xl font-bold">
                    {p.name}
                    <span className="ml-3 tabular text-lg font-normal text-stone-600">
                      {p.phone ? formatPhone(p.phone) : ""}
                    </span>
                  </p>
                  <p className="mt-1 text-lg text-stone-600 truncate">{p.address}</p>
                  {p.referrer && <p className="text-base text-stone-400">소개: {p.referrer}</p>}
                </div>
                <ChevronRight className="w-6 h-6 shrink-0 text-stone-300" aria-hidden />
              </div>
            </button>
          ))}
        </div>

        {/* 태블릿·컴퓨터: 엑셀식 표 */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border border-line bg-white">
          <table className="excel-table">
            <thead>
              <tr>
                <th className="w-[1%]">이름</th>
                <th className="w-[1%]">휴대전화</th>
                <th>주소</th>
                <th className="w-[1%]">연고인</th>
                <th className="w-[1%]">관리</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id}>
                  <td className="font-bold whitespace-nowrap">{p.name}</td>
                  <td className="tabular whitespace-nowrap">{formatPhone(p.phone)}</td>
                  <td>{p.address}</td>
                  <td className="whitespace-nowrap">
                    {p.referrer || <span className="text-stone-400">—</span>}
                  </td>
                  <td>
                    <button
                      onClick={() => setEditing({ mode: "edit", person: p })}
                      className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-line px-3 py-1.5 text-base font-bold cursor-pointer hover:border-peach hover:text-peach-dark"
                    >
                      <Pencil className="w-4 h-4 shrink-0" aria-hidden /> 수정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 나머지는 눌러서 더 보기 (한꺼번에 다 그리면 느려짐) */}
        {filtered.length > limit && (
          <div className="mt-4 text-center">
            <BigButton variant="secondary" onClick={() => setLimit((l) => l + 200)}>
              더 보기 ({(filtered.length - limit).toLocaleString("ko-KR")}명 남음)
            </BigButton>
          </div>
        )}
        </>
      )}

      {editing && (
        <PersonDialog
          person={editing.mode === "edit" ? editing.person : undefined}
          onClose={() => setEditing(null)}
          onDelete={editing.mode === "edit" ? () => remove(editing.person) : undefined}
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
  onDelete,
}: {
  person?: Person;
  onClose: () => void;
  onSave: (data: PersonInput) => void;
  onDelete?: () => void;
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
          <input className={inputClass} type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(formatPhoneInput(e.target.value))} placeholder="010-0000-0000" />
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
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 text-red-600 text-lg font-bold py-3 cursor-pointer hover:bg-red-50"
          >
            <Trash2 className="w-5 h-5" aria-hidden /> 주소록에서 지우기
          </button>
        )}
      </div>
    </div>
  );
}
