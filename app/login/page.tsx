"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BigButton, Field, inputClass } from "@/components/ui";

/** 로그인 화면 뼈대 — 나중에 Supabase Auth를 붙인다. 지금은 무엇을 넣어도 통과. */
export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="flex-1 flex items-center justify-center px-5">
      <div className="w-full max-w-sm py-16">
        <h1 className="text-3xl font-bold text-center">농장주 로그인</h1>
        <p className="mt-2 text-lg text-stone-600 text-center">
          발주서 관리는 로그인 후 이용해요.
        </p>
        <form
          className="mt-8 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/admin");
          }}
        >
          <Field label="휴대전화" required>
            <input
              className={inputClass}
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              autoComplete="tel"
            />
          </Field>
          <Field label="비밀번호" required>
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              autoComplete="current-password"
            />
          </Field>
          <BigButton type="submit" className="w-full">
            로그인
          </BigButton>
        </form>
      </div>
    </main>
  );
}
