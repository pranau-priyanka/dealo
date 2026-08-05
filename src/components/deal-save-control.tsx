import { getTranslations } from "next-intl/server";
import { saveDeal, unsaveDeal } from "@/features/saved/actions";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";

type Props = {
  dealId: string;
  isSaved: boolean;
  isSignedIn: boolean;
  locale: "en-GB" | "pt-PT";
  returnTo: string;
};

export async function DealSaveControl({
  dealId,
  isSaved,
  isSignedIn,
  locale,
  returnTo,
}: Props) {
  const t = await getTranslations("deals");

  if (!isSignedIn) {
    return (
      <Link
        className="text-brand inline-flex min-h-11 items-center text-sm font-bold underline"
        href={`/signup?next=${encodeURIComponent(returnTo)}`}
      >
        {t("savePrompt")}
      </Link>
    );
  }

  return (
    <form action={isSaved ? unsaveDeal : saveDeal}>
      <input name="dealId" type="hidden" value={dealId} />
      <input name="locale" type="hidden" value={locale} />
      <input name="returnTo" type="hidden" value={returnTo} />
      <Button
        className="mt-5 w-full sm:w-auto"
        variant={isSaved ? "secondary" : "primary"}
      >
        {isSaved ? t("removeSaved") : t("save")}
      </Button>
    </form>
  );
}
