import { Context, Next } from "koa";
import { z } from "zod";
import { kil } from "@/db/Kil";
import { coreUsers } from "@/db/schemas/core-users";
import { BenefitsSchema, usersBenefits } from "@/db/schemas/users-benefits";
import { createGiftCard } from "@/lib/user/benefits";
import { eq } from "drizzle-orm";

const payload = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    locale: z.string().optional().default("pt_br"),
  }),
  benefits: BenefitsSchema,
  expiresAt: z.string(),
});

export async function POST(context: Context, next: Next) {
  const safeParse = payload.safeParse(context.request.body);

  if (!safeParse.success) {
    context.status = 400;
    context.body = {
      error: safeParse.error,
    };

    return next();
  }

  const {
    user: { id, name, locale },
    benefits,
    expiresAt,
  } = safeParse.data;

  await kil
    .insert(coreUsers)
    .values({
      id: id,
      name: name,
      locale: locale,
    })
    .onConflictDoNothing();

  await kil
    .insert(usersBenefits)
    .values({
      id: id,
      benefits: benefits,
      expires_at: new Date(expiresAt),
    })
    .onConflictDoUpdate({
      set: {
        benefits: benefits,
      },
      target: usersBenefits.id,
      where: eq(usersBenefits.id, id),
    });

  if (benefits.gift_card) {
    const codes = await Promise.all(
      Array.from({ length: benefits.gift_card }, () =>
        createGiftCard("friendly-gift"),
      ),
    );

    console.log(codes);

    context.response.body = {
      giftcards: codes,
    };
  }

  context.status = 200;
  return next();
}