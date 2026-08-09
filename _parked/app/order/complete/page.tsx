import Link from "next/link";
import { CircleCheck } from "lucide-react";

export default function OrderCompletePage() {
  return (
    <main className="flex-1 flex items-center justify-center px-5">
      <div className="text-center max-w-md py-20">
        <CircleCheck className="w-20 h-20 text-leaf mx-auto" aria-hidden />
        <h1 className="mt-6 text-3xl font-bold">주문이 접수되었습니다</h1>
        <p className="mt-3 text-xl text-stone-600 leading-relaxed">
          복숭아가 잘 익은 날 정성껏 담아 보내드릴게요.
          <br />
          발송 전에 문자로 안내드립니다.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-peach text-white text-lg font-bold px-8 py-4 hover:bg-peach-dark transition-colors"
        >
          처음으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
