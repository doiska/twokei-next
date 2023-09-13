import { Benefits, usersBenefits } from "@/db/schemas/users-benefits";
import { kil } from "@/db/Kil";
import { eq } from "drizzle-orm";

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
