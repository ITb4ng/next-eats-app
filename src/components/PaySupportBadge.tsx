import { AiOutlineCheckCircle } from "react-icons/ai";

interface PaySupportBadgeProps {
  label?: string;
  className?: string;
}

export default function PaySupportBadge({
  label = "지원금 사용 가능",
  className = "",
}: PaySupportBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit max-w-full self-start items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold leading-none text-emerald-700 ${className}`}
    >
      <AiOutlineCheckCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="min-w-0 whitespace-nowrap leading-4">{label}</span>
    </span>
  );
}
