"use client";

import { useState } from "react";
import { CircleCheck, Gift, Phone } from "lucide-react";
import { BigButton, EmptyState, PageTitle, StatusBadge } from "@/components/ui";
import { useDB } from "@/lib/store";
import type { CustomerOrder } from "@/lib/types";

const TABS = ["전체", "신규", "확인함", "발주완료"] as const;

/** 손님이 사이트에서 넣은 주문을 확인하는 곳 */
export default function OrdersPage() {
  const { db, update } = useDB();
  const [tab, setTab] = useState<(typeof TABS)[number]>("전체");

  if (!db) return null;

  const orders = db.orders
    .filter((o) => (tab === "전체" ? true : o.status === tab))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  function setStatus(o: CustomerOrder, status: CustomerOrder["status"]) {
    update((d) => ({
      ...d,
      orders: d.orders.map((x) => (x.id === o.id ? { ...x, status } : x)),
    }));
  }

  return (
    <main>
      <PageTitle sub="손님이 사이트에서 넣은 주문이에요. 확인하고 발주서에 옮겨 적으세요.">
        새 주문
      </PageTitle>

      {/* 상태 탭 */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map((t) => {
          const count =
            t === "전체" ? db.orders.length : db.orders.filter((o) => o.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-5 py-2.5 text-lg font-bold cursor-pointer transition-colors ${
                tab === t ? "bg-peach text-white" : "bg-white border-2 border-line text-stone-600 hover:border-peach"
              }`}
            >
              {t} {count > 0 && <span className="tabular">{count}</span>}
            </button>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <EmptyState title="여기에 해당하는 주문이 없어요" />
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl bg-white border border-line p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xl font-bold">
                    {o.ordererName}
                    {o.isGift && (
                      <span className="ml-2 inline-flex items-center gap-1 text-base font-bold text-peach-dark bg-peach-soft rounded-lg px-2 py-0.5">
                        <Gift className="w-4 h-4" aria-hidden /> 선물
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-base text-stone-500">
                    {new Date(o.createdAt).toLocaleString("ko-KR", {
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    접수
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </div>

              <dl className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-2 text-lg">
                <div className="flex gap-2">
                  <dt className="shrink-0 font-bold text-stone-500 w-20">연락처</dt>
                  <dd className="tabular">
                    <a href={`tel:${o.phone}`} className="inline-flex items-center gap-1.5 text-peach-dark font-bold">
                      <Phone className="w-5 h-5" aria-hidden /> {o.phone}
                    </a>
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="shrink-0 font-bold text-stone-500 w-20">주문</dt>
                  <dd>
                    {o.product} × {o.quantity}박스
                  </dd>
                </div>
                <div className="flex gap-2 sm:col-span-2">
                  <dt className="shrink-0 font-bold text-stone-500 w-20">
                    {o.isGift ? "받는 분" : "주소"}
                  </dt>
                  <dd>
                    {o.isGift ? (
                      <>
                        <span className="font-bold">{o.recipientName}</span>
                        {o.recipientPhone && <span className="tabular"> · {o.recipientPhone}</span>}
                        <br />
                        {o.recipientAddress}
                      </>
                    ) : (
                      o.address
                    )}
                  </dd>
                </div>
                {o.referrer && (
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-bold text-stone-500 w-20">소개</dt>
                    <dd>{o.referrer}</dd>
                  </div>
                )}
                {o.memo && (
                  <div className="flex gap-2 sm:col-span-2">
                    <dt className="shrink-0 font-bold text-stone-500 w-20">요청</dt>
                    <dd className="text-stone-700">{o.memo}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-5 flex gap-3 flex-wrap">
                {o.status === "신규" && (
                  <BigButton onClick={() => setStatus(o, "확인함")}>
                    <CircleCheck className="w-6 h-6" aria-hidden /> 확인했어요
                  </BigButton>
                )}
                {o.status === "확인함" && (
                  <BigButton onClick={() => setStatus(o, "발주완료")}>
                    <CircleCheck className="w-6 h-6" aria-hidden /> 발주서에 옮겨 적었어요
                  </BigButton>
                )}
                {o.status === "발주완료" && (
                  <BigButton variant="ghost" onClick={() => setStatus(o, "확인함")}>
                    발주완료 취소
                  </BigButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
