import { clearedSessionCookie, destroyCurrentSession } from "@/app/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await destroyCurrentSession();
  return new Response(null, {
    status: 302,
    headers: {
      location: new URL("/", request.url).toString(),
      "set-cookie": clearedSessionCookie(),
    },
  });
}
