import LoginCardSection from "@/components/ui/login-signup";
import { redirect } from "next/navigation";

import { getCurrentUser } from "../auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser();
  if (user) redirect("/painel");
  const params = await searchParams;
  const mode = params.mode === "register" ? "register" : "login";
  const error = typeof params.error === "string" ? params.error.slice(0, 180) : undefined;
  return <LoginCardSection mode={mode} error={error} />;
}
