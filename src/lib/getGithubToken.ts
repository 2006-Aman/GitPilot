import { ObjectId } from "mongodb";
import getClientPromise from "./mongodb";

export async function getGithubToken(
  userId: string
): Promise<string | null> {
  try {
    const client = await getClientPromise();
    const db = client.db();

    let objectId: ObjectId | null = null;
    try {
      objectId = new ObjectId(userId);
    } catch {}

    const account = await db.collection("accounts").findOne({
      $or: [
        ...(objectId ? [{ userId: objectId }] : []),
        { userId: userId },
      ],
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
