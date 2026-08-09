import { redirect } from "next/navigation";

/** 지금은 어머니 전용 사이트 — 대문은 로그인으로 바로 안내 */
export default function Home() {
  redirect("/login");
}
