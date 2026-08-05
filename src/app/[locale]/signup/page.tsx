import { AuthForm } from "@/components/auth-form";
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  return <AuthForm mode="signup" notice={await searchParams} />;
}
