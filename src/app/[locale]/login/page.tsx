import { AuthForm } from "@/components/auth-form";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  return <AuthForm mode="login" notice={await searchParams} />;
}
