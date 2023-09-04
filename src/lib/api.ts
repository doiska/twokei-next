import { env } from "@/app/env";

type ApiResponse<T> =
  | {
      status: "success";
      data: T;
    }
  | {
      status: "error";
      message: string;
    };

export async function fetchApi<T>(
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

  const response = await fetch(`${env.RESOLVER_URL}${endpoint}`, config);

  if (response.ok) {
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
}
