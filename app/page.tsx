import AionAuthLanding from "@/components/ui/aion-auth-landing";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "./chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();
  return <AionAuthLanding signInHref={chatGPTSignInPath("/painel")} dashboardHref="/painel" signedIn={Boolean(user)} displayName={user?.displayName} signOutHref={user ? chatGPTSignOutPath("/") : undefined} />;
}
