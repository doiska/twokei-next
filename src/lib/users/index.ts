import { User } from "discord.js";
import { kil } from "@/db/Kil";
import { coreUsers } from "@/db/schemas/core-users";
import { eq } from "drizzle-orm";

export async function getCoreUser(user: User) {
  const [dbUser] = await kil
    .select()
    .from(coreUsers)
    .where(eq(coreUsers.id, user.id));

  if (dbUser) {
    return dbUser;
  }

  const result = await kil
    .insert(coreUsers)
    .values({
      id: user.id,
      name: user.username,
    })
    .returning();

  return result[0];
}
