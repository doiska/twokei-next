import { env } from "@/app/env";
import { logger } from "@/lib/logger";

type ApiResponse<T> =
  | {
      status: "success";
      data: T;
    }
  | {
      status: "error";
      message: string;
    };

export async function fetchWebApi<T>(
  endpoint: string,
  { body, ...customConfig }: any = {},
): Promise<ApiResponse<T>> {
  const headers = {
    "Content-Type": "application/json",
    Authorization: env.RESOLVER_KEY,
  };

  const config = {
    method: body ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${env.WEBSITE_URL}${endpoint}`, config);

  try {
    if (response.ok || response.status !== 200) {
      return {
        status: "success",
        data: (await response.json()) as T,
      };
    } else {
      return {
        status: "error",
        message: await response.text(),
      };
    }
  } catch (error) {
    logger.error(`[API] ${response.status} ${response.statusText}`);
    return {
      status: "error",
      message: "Something went wrong",
    };
  }
}
