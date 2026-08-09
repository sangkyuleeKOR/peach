/** 전화번호 표시/입력 포맷 — 항상 010-2222-2222 처럼 대시를 붙인다 */

/** 입력 중 실시간 포맷: 숫자만 남기고 자리수에 맞춰 대시를 넣는다 (최대 11자리) */
export function formatPhoneInput(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length < 11) return `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

/** 화면 표시용: 10~11자리 번호면 대시 형태로, 아니면(메모가 섞였거나 이상하면) 원본 그대로 */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) return formatPhoneInput(d);
  return raw;
}
