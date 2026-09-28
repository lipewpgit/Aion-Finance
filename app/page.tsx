import AionAuthLanding from "@/components/ui/saa-s-template";
import { getCurrentUser } from "./auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  return <AionAuthLanding signInHref="/entrar" dashboardHref="/painel" signedIn={Boolean(user)} displayName={user?.displayName} signOutHref={user ? "/api/auth/logout" : undefined} />;
}
