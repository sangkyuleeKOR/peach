"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Phone, Truck } from "lucide-react";
import { BigButton, Field, QuantityStepper, inputClass } from "@/components/ui";
import { newId, useDB } from "@/lib/store";
// (보류 중) 다시 켤 때: db.products에서 판매 중 상품을 골라 쓰도록 이미 바꿔둠

/** 손님이 들어와서 주문을 넣는 페이지 (대문) */
export default function OrderPage() {
  const router = useRouter();
  const { db, update } = useDB();

  const [ordererName, setOrdererName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [referrer, setReferrer] = useState("");
  const [memo, setMemo] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (!ordererName.trim()) return setError("성함을 적어 주세요.");
    if (!phone.trim()) return setError("휴대전화 번호를 적어 주세요.");
    if (!isGift && !address.trim()) return setError("받으실 주소를 적어 주세요.");
    if (isGift && (!recipientName.trim() || !recipientAddress.trim()))
      return setError("받으시는 분의 성함과 주소를 적어 주세요.");

    update((d) => ({
      ...d,
      orders: [
        {
          id: newId(),
          createdAt: new Date().toISOString(),
          ordererName: ordererName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          product: product || (db?.products[0]?.name ?? ""),
          quantity,
          referrer: referrer.trim(),
          memo: memo.trim(),
          isGift,
          recipientName: recipientName.trim(),
          recipientPhone: recipientPhone.trim(),
          recipientAddress: recipientAddress.trim(),
          status: "신규",
        },
        ...d.orders,
      ],
    }));
    router.push("/order/complete");
  }

  return (
    <main className="flex-1">
      {/* 대문 */}
      <section className="bg-gradient-to-b from-peach-soft to-paper">
        <div className="mx-auto max-w-2xl px-5 py-12 text-center">
          <p className="text-xl font-bold text-peach-dark">해마다 여름이면</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold leading-tight">
            나무에서 갓 딴<br />복숭아를 보내드립니다
          </h1>
          <p className="mt-4 text-xl text-stone-600">
            아래에 주소만 남겨 주시면
            <br className="sm:hidden" /> 잘 익은 날 바로 따서 보내드려요.
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-lg text-stone-600">
            <span className="inline-flex items-center gap-2">
              <Truck className="w-6 h-6 text-peach-dark" aria-hidden /> 산지 직송
            </span>
            <span className="inline-flex items-center gap-2">
              <Phone className="w-6 h-6 text-peach-dark" aria-hidden /> 문의 010-0000-0000
            </span>
          </div>
        </div>
      </section>

      {/* 주문 폼 */}
      <section className="mx-auto max-w-2xl px-5 pb-16">
        <div className="rounded-2xl bg-white border border-line shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl font-bold">주문서 작성</h2>

          <Field label="성함" required>
            <input
              className={inputClass}
              value={ordererName}
              onChange={(e) => setOrdererName(e.target.value)}
              placeholder="홍길동"
              autoComplete="name"
            />
          </Field>

          <Field label="휴대전화" required hint="발송 안내를 문자로 드려요.">
            <input
              className={inputClass}
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-1234-5678"
              autoComplete="tel"
            />
          </Field>

          {/* 선물 여부 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsGift(false)}
              className={`flex-1 rounded-xl border-2 py-3.5 text-lg font-bold cursor-pointer transition-colors ${!isGift ? "border-peach bg-peach-soft text-peach-dark" : "border-line bg-white text-stone-500"}`}
            >
              제가 받아요
            </button>
            <button
              type="button"
              onClick={() => setIsGift(true)}
              className={`flex-1 rounded-xl border-2 py-3.5 text-lg font-bold cursor-pointer transition-colors ${isGift ? "border-peach bg-peach-soft text-peach-dark" : "border-line bg-white text-stone-500"}`}
            >
              선물로 보내요
            </button>
          </div>

          {!isGift ? (
            <Field label="받으실 주소" required>
              <textarea
                className={`${inputClass} min-h-24`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="도로명 주소와 동·호수까지 적어 주세요"
                autoComplete="street-address"
              />
            </Field>
          ) : (
            <div className="rounded-xl bg-stone-50 border border-line p-4 space-y-4">
              <p className="text-lg font-bold text-stone-700">받으시는 분</p>
              <Field label="성함" required>
                <input
                  className={inputClass}
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="받으시는 분 성함"
                />
              </Field>
              <Field label="휴대전화">
                <input
                  className={inputClass}
                  type="tel"
                  inputMode="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="010-0000-0000"
                />
              </Field>
              <Field label="주소" required>
                <textarea
                  className={`${inputClass} min-h-24`}
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="도로명 주소와 동·호수까지 적어 주세요"
                />
              </Field>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="상품">
              <div className="flex gap-3">
                {(db?.products ?? []).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProduct(p.name)}
                    className={`flex-1 rounded-xl border-2 py-3.5 text-lg font-bold cursor-pointer transition-colors ${product === p.name ? "border-peach bg-peach-soft text-peach-dark" : "border-line bg-white text-stone-500"}`}
                  >
                    {p.name}
                    {p.price ? ` · ${p.price.toLocaleString("ko-KR")}원` : ""}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="수량 (박스)">
              <QuantityStepper value={quantity} onChange={setQuantity} />
            </Field>
          </div>

          <Field label="소개해 주신 분" hint="어느 분 소개로 오셨는지 알려 주시면 좋아요.">
            <input
              className={inputClass}
              value={referrer}
              onChange={(e) => setReferrer(e.target.value)}
              placeholder="예: 김명신"
            />
          </Field>

          <Field label="요청사항">
            <textarea
              className={`${inputClass} min-h-20`}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 부재 시 경비실에 맡겨 주세요"
            />
          </Field>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-lg px-4 py-3">
              {error}
            </p>
          )}

          <BigButton onClick={submit} className="w-full text-xl py-4" disabled={!db}>
            주문 넣기
          </BigButton>
          <p className="text-center text-base text-stone-500">
            주문이 접수되면 농장에서 확인 후 연락드립니다.
          </p>
        </div>

        <p className="mt-10 text-center">
          <Link href="/login" className="text-stone-400 text-base underline underline-offset-4">
            농장주 로그인
          </Link>
        </p>
      </section>
    </main>
  );
}
