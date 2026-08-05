type Props = {
  inverse?: boolean;
  showWordmark?: boolean;
};

export function DealoMark({ inverse = false, showWordmark = true }: Props) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        aria-hidden
        className="grid size-[34px] place-items-center rounded-[10px] bg-[linear-gradient(135deg,#6E56FF_10%,#00C2FF_145%)] text-lg font-black tracking-[-0.08em] text-white"
      >
        D
      </span>
      {showWordmark && (
        <span
          className={`text-xl font-extrabold tracking-[-0.055em] ${
            inverse ? "text-white" : "text-foreground"
          }`}
        >
          Dealo
        </span>
      )}
    </span>
  );
}
