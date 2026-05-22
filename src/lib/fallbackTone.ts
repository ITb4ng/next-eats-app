export type FallbackTone = "warning" | "critical";

export const fallbackToneClasses: Record<
  FallbackTone,
  {
    panelBorder: string;
    divider: string;
    debug: string;
    retryButton: string;
    toastBorder: string;
  }
> = {
  warning: {
    panelBorder: "border-orange-200",
    divider: "border-orange-100",
    debug: "bg-orange-50 text-orange-700",
    retryButton:
      "border border-orange-300 bg-white text-orange-700 hover:bg-orange-50 focus-visible:ring-orange-300",
    toastBorder: "border-orange-200",
  },
  critical: {
    panelBorder: "border-red-200",
    divider: "border-red-100",
    debug: "bg-red-50 text-red-700",
    retryButton:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400",
    toastBorder: "border-red-200",
  },
};
