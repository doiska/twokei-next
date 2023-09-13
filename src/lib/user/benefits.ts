import { Benefits, usersBenefits } from "@/db/schemas/users-benefits";
import { kil } from "@/db/Kil";
import { eq } from "drizzle-orm";
import { createFriendlyHash } from "@/utils/helpers";
import { usersGiftcards } from "@/db/schemas/users-giftcards";
import { add } from "date-fns";

export async function getBenefits(userId: string, benefit?: keyof Benefits) {
  const [result] = await kil
    .select({
      benefits: usersBenefits.benefits,
    })
    .from(usersBenefits)
    .where(eq(usersBenefits.id, userId));

  if (!result || !result.benefits) {
    return;
  }

  if (benefit) {
    return result.benefits[benefit];
  }

  return result.benefits;
}

export async function hasBenefit(userId: string, benefit: keyof Benefits) {
  const [result] = await kil
    .select({
      benefits: usersBenefits.benefits,
    })
    .from(usersBenefits)
    .where(eq(usersBenefits.id, userId));

  if (!result || !result.benefits) {
    return false;
  }

  return !!result.benefits[benefit];
}

export async function createGiftCard(source: string, retries = 0) {
  const code = createFriendlyHash();

  const exists = await kil
    .select()
    .from(usersGiftcards)
    .where(eq(usersGiftcards.code, code));

  if (exists.length > 0 && retries < 5) {
    return createGiftCard(source, retries + 1);
  }

  if (exists.length > 0) {
    throw new Error("Failed to create gift card");
  }

  await kil.insert(usersGiftcards).values({
    code: code,
    source: source,
    expires_at: add(new Date(), {
      days: 30,
    }),
  });

  return code;
}
