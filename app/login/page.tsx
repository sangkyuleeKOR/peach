"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BigButton, Field, inputClass } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

/** 전화번호를 아이디처럼 쓴다 — 내부적으로 가짜 이메일로 바꿔 로그인 */
function phoneToEmail(phone: string): string {
  return `p${phone.replace(/\D/g, "")}@peach.farm`;
}

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn() {
    if (!phone.trim() || !password) {
      setError("전화번호와 비밀번호를 적어 주세요.");
      return;
    }
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: phoneToEmail(phone),
      password,
    });
    setBusy(false);
    if (error) {
      setError("전화번호나 비밀번호가 맞지 않아요.\n다시 한 번 확인해 주세요.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex-1 flex items-center justify-center px-5">
      <div className="w-full max-w-sm py-16">
        <h1 className="text-3xl font-bold text-center">농장주 로그인</h1>
        <p className="mt-2 text-lg text-stone-600 text-center">
          처음 한 번만 로그인하면 계속 유지돼요.
        </p>
        <form
          className="mt-8 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            signIn();
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
          {error && (
            <p role="alert" className="whitespace-pre-line rounded-xl bg-red-50 border border-red-200 text-red-700 text-lg px-4 py-3">
              {error}
            </p>
          )}
          <BigButton type="submit" className="w-full" disabled={busy}>
            {busy ? "확인하는 중…" : "로그인"}
          </BigButton>
        </form>
      </div>
    </main>
  );
}
