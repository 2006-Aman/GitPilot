import { ObjectId } from "mongodb";
import getClientPromise from "./mongodb";

export async function getGithubToken(
  userId: string
): Promise<string | null> {
  try {
    const client = await getClientPromise();
    const db = client.db();
    const account = await db.collection("accounts").findOne({
      userId: new ObjectId(userId),
      provider: "github",
    });

    if (account && account.access_token) {
      return account.access_token as string;
    }
    return null;
  } catch {
    return null;
  }
}
