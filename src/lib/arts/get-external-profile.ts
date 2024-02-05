import { z } from "zod";

const schema = z.object({
  data: z.object({
    id: z.string(),
    username: z.string(),
    profile_theme: z.array(z.string()),
  }),
});

export async function getExternalProfile(userId: string) {
  const response = await fetch(`https://discord-arts.asure.dev/user/${userId}`);

  if (response.status !== 200) {
    return null;
  }

  const data = await response.json();

  const result = schema.safeParse(data);

  if (!result.success) {
    return;
  }

  return result.data;
}
