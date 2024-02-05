import { GuildMember, User } from "discord.js";
import { kil } from "@/db/Kil";
import { coreUsers } from "@/db/schemas/core-users";
import { eq } from "drizzle-orm";
import { isGuildMember } from "@sapphire/discord.js-utilities";

export async function getCoreUser(user: string | User) {
  const id = typeof user === "string" ? user : user.id;

  const [dbUser] = await kil
    .select()
    .from(coreUsers)
    .where(eq(coreUsers.id, id));

  if (dbUser) {
    return dbUser;
  }

  if (typeof user === "string") {
    const result = await kil
      .insert(coreUsers)
      .values({
        id,
      })
      .returning();

    return result[0];
  }

  const result = await kil
    .insert(coreUsers)
    .values({
      id,
      name: user.username,
    })
    .returning();

  return result[0];
}
