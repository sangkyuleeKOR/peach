"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookUser, ChartColumn, FileSpreadsheet, House, LogOut, Package } from "lucide-react";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin", label: "홈", icon: House, exact: true },
  { href: "/admin/people", label: "주소록", icon: BookUser },
  { href: "/admin/sheets", label: "발주서", icon: FileSpreadsheet },
  { href: "/admin/products", label: "상품", icon: Package },
  { href: "/admin/sales", label: "매출", icon: ChartColumn },
];

/** 관리 화면 공통 뼈대: 큰 상단 메뉴(컴퓨터) + 하단 메뉴(휴대폰) */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function signOut() {
    if (!window.confirm("로그아웃할까요?\n다음에 쓸 때 다시 로그인해야 해요.")) return;
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="no-print bg-white border-b border-line sticky top-0 z-20">
        <div className="mx-auto max-w-5xl px-5 flex items-center justify-between gap-4 h-16">
          <Link href="/admin" className="shrink-0 whitespace-nowrap text-xl font-bold text-peach-dark">
            복숭아 발주 관리
          </Link>
          {/* 넓은 화면 메뉴 (좁으면 하단 메뉴로 대신함) */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="주 메뉴">
            {NAV.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href, exact) ? "page" : undefined}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-lg font-bold transition-colors ${
                  isActive(href, exact)
                    ? "bg-peach-soft text-peach-dark"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden />
                {label}
              </Link>
            ))}
          </nav>
          <button
            onClick={signOut}
            className="shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap text-base text-stone-500 hover:text-stone-700 cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" aria-hidden />
            로그아웃
          </button>
        </div>
      </header>

      <div className="flex-1 mx-auto w-full max-w-5xl px-5 py-8 pb-28 lg:pb-8">{children}</div>

      {/* 휴대폰·태블릿 하단 메뉴 */}
      <nav
        className="no-print lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-line pb-[env(safe-area-inset-bottom)]"
        aria-label="주 메뉴"
      >
        <div className="grid grid-cols-5">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href, exact) ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-base font-bold ${
                isActive(href, exact) ? "text-peach-dark" : "text-stone-500"
              }`}
            >
              <Icon className="w-7 h-7" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
