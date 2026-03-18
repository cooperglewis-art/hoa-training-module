import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export default async function DebugPage() {
  let sessionData: any = null;
  let error: string | null = null;

  try {
    const session = await auth();
    sessionData = session;
  } catch (e: any) {
    error = e.message;
  }

  const userCount = await db.user.count();

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <h1>Debug Page</h1>
      <h2>Session:</h2>
      <pre>{JSON.stringify(sessionData, null, 2)}</pre>
      {error && (
        <>
          <h2>Error:</h2>
          <pre style={{ color: "red" }}>{error}</pre>
        </>
      )}
      <h2>DB connection:</h2>
      <p>User count: {userCount}</p>
    </div>
  );
}
