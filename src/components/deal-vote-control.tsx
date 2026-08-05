import { getTranslations } from "next-intl/server";
import { voteOnDeal } from "@/features/community/actions";
import { Link } from "@/i18n/navigation";

type Props = {
  dealId: string;
  isSignedIn: boolean;
  locale: "en-GB" | "pt-PT";
  returnTo: string;
  score: number;
  userVote: -1 | 1 | null;
};

export async function DealVoteControl({
  dealId,
  isSignedIn,
  locale,
  returnTo,
  score,
  userVote,
}: Props) {
  const t = await getTranslations("community");

  if (!isSignedIn) {
    return (
      <div className="bg-surface-muted inline-flex min-h-10 items-center gap-2 rounded-full px-3">
        <span
          aria-label={t("score", { value: score })}
          className="text-xs font-extrabold"
        >
          ↑ {score}
        </span>
        <Link
          className="text-brand text-xs font-bold"
          href={`/signup?next=${encodeURIComponent(returnTo)}`}
        >
          {t("signInToVote")}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface-muted inline-flex min-h-10 items-center rounded-full p-1">
      <form action={voteOnDeal}>
        <input name="dealId" type="hidden" value={dealId} />
        <input name="locale" type="hidden" value={locale} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <input name="value" type="hidden" value="1" />
        <button
          aria-label={t("upvote")}
          aria-pressed={userVote === 1}
          className={`grid size-8 place-items-center rounded-full text-sm font-black transition-colors ${
            userVote === 1
              ? "bg-brand text-white"
              : "text-foreground-muted hover:bg-surface"
          }`}
        >
          ↑
        </button>
      </form>
      <span
        aria-label={t("score", { value: score })}
        className="min-w-8 text-center text-xs font-extrabold"
      >
        {score}
      </span>
      <form action={voteOnDeal}>
        <input name="dealId" type="hidden" value={dealId} />
        <input name="locale" type="hidden" value={locale} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <input name="value" type="hidden" value="-1" />
        <button
          aria-label={t("downvote")}
          aria-pressed={userVote === -1}
          className={`grid size-8 place-items-center rounded-full text-sm font-black transition-colors ${
            userVote === -1
              ? "bg-foreground text-white"
              : "text-foreground-muted hover:bg-surface"
          }`}
        >
          ↓
        </button>
      </form>
    </div>
  );
}
