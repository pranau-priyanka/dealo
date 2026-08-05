import { getTranslations } from "next-intl/server";
import type { DealComment } from "@/features/deals/queries";
import { addDealComment } from "@/features/community/actions";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";

type Props = {
  comments: DealComment[];
  dealId: string;
  isSignedIn: boolean;
  locale: "en-GB" | "pt-PT";
  returnTo: string;
};

export async function DealComments({
  comments,
  dealId,
  isSignedIn,
  locale,
  returnTo,
}: Props) {
  const t = await getTranslations("community");
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  });

  return (
    <section className="mt-8 border-t pt-8" id="comments">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-black tracking-[-0.04em]">
          {t("comments", { count: comments.length })}
        </h2>
        {!isSignedIn && (
          <Link
            className="text-brand text-sm font-bold"
            href={`/signup?next=${encodeURIComponent(returnTo)}`}
          >
            {t("signInToComment")}
          </Link>
        )}
      </div>

      {isSignedIn && (
        <form action={addDealComment} className="mt-5">
          <input name="dealId" type="hidden" value={dealId} />
          <input name="locale" type="hidden" value={locale} />
          <input name="returnTo" type="hidden" value={returnTo} />
          <label className="sr-only" htmlFor="deal-comment">
            {t("commentLabel")}
          </label>
          <textarea
            className="bg-background min-h-28 w-full rounded-[var(--radius-sm)] border p-4 text-sm leading-6"
            id="deal-comment"
            maxLength={2_000}
            name="body"
            placeholder={t("commentPlaceholder")}
            required
          />
          <Button className="mt-3" type="submit">
            {t("commentAction")}
          </Button>
        </form>
      )}

      {comments.length === 0 ? (
        <p className="text-foreground-muted mt-6 text-sm leading-6">
          {t("commentsEmpty")}
        </p>
      ) : (
        <ol className="mt-6 space-y-4">
          {comments.map((comment) => (
            <li
              className="bg-background rounded-[var(--radius-sm)] p-4"
              key={comment.id}
            >
              <p className="text-sm leading-6 whitespace-pre-line">
                {comment.body}
              </p>
              <p className="text-foreground-muted mt-3 text-xs font-semibold">
                {t("communityMember")} ·{" "}
                {dateFormatter.format(new Date(comment.createdAt))}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
