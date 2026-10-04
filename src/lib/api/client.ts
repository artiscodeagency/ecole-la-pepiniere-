const API_BASE = "/api";
const XSRF_COOKIE = "XSRF-TOKEN";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Error answered by the API, with Laravel's validation messages when there are some. */
export class ApiError extends Error {
  readonly status: number;
  readonly errors: Record<string, string[]>;

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  /** First message for a form field, e.g. `error.field("email")`. */
  field(name: string): string | undefined {
    return this.errors[name]?.[0];
  }
}

function readCookie(name: string) {
  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

/** Laravel sets the anti-forgery cookie; it must exist before any write. */
async function ensureCsrfCookie(renew = false) {
  if (!renew && readCookie(XSRF_COOKIE)) return;
  await fetch("/sanctum/csrf-cookie", {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
}

function send(path: string, method: Method, body: unknown) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
  const xsrf = readCookie(XSRF_COOKIE);
  if (xsrf) headers["X-XSRF-TOKEN"] = xsrf;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  return fetch(`${API_BASE}${path}`, {
    method,
    credentials: "same-origin",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function fallbackMessage(status: number) {
  if (status === 401) return "Votre session a expiré. Reconnectez-vous.";
  if (status === 403) return "Vous n'avez pas accès à cette action.";
  if (status === 404) return "Élément introuvable.";
  if (status === 419) return "Votre session a expiré. Rechargez la page.";
  if (status === 429) return "Trop de tentatives. Patientez un instant avant de réessayer.";
  return "Une erreur est survenue sur le serveur. Réessayez dans un instant.";
}

/**
 * Calls the API with the session cookie of the current site.
 * `path` is relative to /api, e.g. `api("/auth/me")`.
 *
 * @throws {ApiError} on an error answer or when the server cannot be reached.
 */
export async function api<T>(
  path: string,
  { method = "GET", body }: { method?: Method; body?: unknown } = {},
): Promise<T> {
  const writes = method !== "GET";
  let response: Response;

  try {
    if (writes) await ensureCsrfCookie();
    response = await send(path, method, body);
    // Expired anti-forgery token: renew it once and try again.
    if (response.status === 419 && writes) {
      await ensureCsrfCookie(true);
      response = await send(path, method, body);
    }
  } catch {
    throw new ApiError(
      0,
      "Impossible de joindre le serveur. Vérifiez votre connexion internet.",
    );
  }

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // Server errors keep a generic message: their details are not for staff.
    const message =
      response.status < 500 && typeof data?.message === "string"
        ? data.message
        : fallbackMessage(response.status);
    throw new ApiError(response.status, message, data?.errors ?? {});
  }

  return data as T;
}
