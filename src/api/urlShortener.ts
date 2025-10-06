const KNOWN_LIST_ENDPOINTS = [
  '/api/v1/urls',
  '/api/v1/short-urls',
  '/api/v1/links',
  '/api/urls',
  '/api/links',
  '/urls',
  '/links',
];

const KNOWN_CREATE_ENDPOINTS = [
  '/api/v1/urls',
  '/api/v1/links',
  '/api/urls',
  '/api/links',
  '/urls',
  '/links',
  '/shorten',
];

const KNOWN_DELETE_PATTERNS = [
  (id: string) => `/api/v1/urls/${id}`,
  (id: string) => `/api/v1/links/${id}`,
  (id: string) => `/api/urls/${id}`,
  (id: string) => `/api/links/${id}`,
  (id: string) => `/urls/${id}`,
  (id: string) => `/links/${id}`,
  (id: string) => `/url/${id}`,
];

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const SHORT_BASE_URL = (import.meta.env.VITE_SHORT_BASE_URL ?? '').replace(/\/$/, '');

type FetchMethod = 'GET' | 'POST' | 'DELETE';

type FetchResult<T> = {
  data: T;
  endpoint: string;
};

const endpointCache = new Map<string, string>();

const buildUrl = (path: string) => {
  if (!API_BASE_URL) {
    return path;
  }

  if (!path.startsWith('/')) {
    return `${API_BASE_URL}/${path}`;
  }

  return `${API_BASE_URL}${path}`;
};

const pickString = (obj: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
};

const pickNumber = (obj: Record<string, unknown>, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
};

const tryFetch = async <T>(
  method: FetchMethod,
  paths: string[],
  body?: unknown,
  preferredKey?: string
): Promise<FetchResult<T>> => {
  const cacheKey = `${method}:${preferredKey ?? ''}`;
  const cachedEndpoint = preferredKey ? endpointCache.get(cacheKey) : undefined;

  if (cachedEndpoint) {
    const response = await fetch(buildUrl(cachedEndpoint), {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.ok) {
      const data = (await response.json()) as T;
      return { data, endpoint: cachedEndpoint };
    }
  }

  let lastError: unknown;

  for (const path of paths) {
    try {
      const response = await fetch(buildUrl(path), {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error(`Server responded with ${response.status}`);
        }
        continue;
      }

      const data = (await response.json()) as T;

      if (preferredKey) {
        endpointCache.set(cacheKey, path);
      }

      return { data, endpoint: path };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Unable to reach URL shortener service');
};

export type ShortLink = {
  id: string;
  slug: string;
  originalUrl: string;
  shortUrl: string;
  createdAt?: string;
  expiresAt?: string;
  clicks?: number;
};

const normaliseDate = (input?: string) => {
  if (!input) {
    return undefined;
  }

  const numericValue = Number(input);

  if (!Number.isNaN(numericValue) && numericValue > 0) {
    return new Date(numericValue).toISOString();
  }

  const timestamp = Date.parse(input);
  if (!Number.isNaN(timestamp)) {
    return new Date(timestamp).toISOString();
  }

  return undefined;
};

const extractShortUrl = (
  raw: Record<string, unknown>,
  slug: string
): string => {
  const direct = pickString(raw, [
    'shortUrl',
    'shortURL',
    'short_url',
    'shortLink',
    'short_link',
    'short',
    'shortened',
  ]);

  if (direct) {
    return direct;
  }

  if (SHORT_BASE_URL) {
    return `${SHORT_BASE_URL}/${slug}`;
  }

  const inferred = pickString(raw, ['domain', 'host', 'baseUrl']);
  if (inferred) {
    return `${inferred.replace(/\/$/, '')}/${slug}`;
  }

  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/${slug}`;
  }

  return slug;
};

const parseShortLink = (raw: unknown): ShortLink | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;

  const slug = pickString(record, [
    'slug',
    'shortCode',
    'code',
    'short_code',
    'hash',
    'id',
    'shortId',
    'short_id',
    'alias',
    'key',
  ]);

  const originalUrl = pickString(record, [
    'originalUrl',
    'original_url',
    'original',
    'destination',
    'target',
    'targetUrl',
    'url',
    'longUrl',
    'long_url',
  ]);

  if (!slug || !originalUrl) {
    return null;
  }

  const id = pickString(record, ['id', 'uuid', 'key', 'slug', 'shortId', 'short_id']) ?? slug;

  const shortUrl = extractShortUrl(record, slug);

  const clicks = pickNumber(record, ['clicks', 'visits', 'usageCount', 'count']);

  const createdAt = normaliseDate(
    pickString(record, ['createdAt', 'created_at', 'created', 'createdDate', 'createdTime'])
  );

  const expiresAt = normaliseDate(pickString(record, ['expiresAt', 'expires_at', 'expiry', 'expireAt']));

  return { id, slug, originalUrl, shortUrl, clicks, createdAt, expiresAt };
};

export const fetchShortLinks = async (): Promise<ShortLink[]> => {
  const { data, endpoint } = await tryFetch<unknown>(
    'GET',
    KNOWN_LIST_ENDPOINTS,
    undefined,
    'list'
  );

  endpointCache.set('GET:list', endpoint);

  const items: unknown[] = Array.isArray(data)
    ? data
    : typeof data === 'object' && data !== null
      ? (() => {
          const container = data as Record<string, unknown>;
          const possibleCollections = [
            container.items,
            container.urls,
            container.links,
            container.data,
            container.results,
            container.list,
          ];

          for (const value of possibleCollections) {
            if (Array.isArray(value)) {
              return value;
            }
          }

          return [] as unknown[];
        })()
      : [];

  const parsed = items
    .map((item) => parseShortLink(item))
    .filter((item): item is ShortLink => Boolean(item));

  return parsed;
};

type CreatePayload = {
  url: string;
  alias?: string;
};

const createPayloadVariants = (payload: CreatePayload) => {
  const variants: Record<string, unknown>[] = [];

  variants.push({ originalUrl: payload.url, alias: payload.alias });
  variants.push({ url: payload.url, alias: payload.alias });
  variants.push({ target: payload.url, alias: payload.alias });
  variants.push({ longUrl: payload.url, alias: payload.alias });
  variants.push({ original_url: payload.url, alias: payload.alias });
  variants.push({ url: payload.url, customAlias: payload.alias });
  variants.push({ url: payload.url, shortCode: payload.alias });

  return variants;
};

export const createShortLink = async (
  payload: CreatePayload
): Promise<ShortLink> => {
  const variants = createPayloadVariants(payload);
  let lastError: unknown;

  const cachedEndpoint = endpointCache.get('POST:create');
  const endpoints = cachedEndpoint ? [cachedEndpoint] : KNOWN_CREATE_ENDPOINTS;

  for (const endpoint of endpoints) {
    for (const variant of variants) {
      try {
        const response = await fetch(buildUrl(endpoint), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(variant),
        });

        if (!response.ok) {
          if (response.status >= 500) {
            throw new Error(`Server responded with ${response.status}`);
          }
          continue;
        }

        const data = await response.json();
        const parsed = parseShortLink(data);

        if (!parsed) {
          throw new Error('Unexpected response format from URL shortener');
        }

        endpointCache.set('POST:create', endpoint);

        return parsed;
      } catch (error) {
        lastError = error;
      }
    }
  }

  throw lastError ?? new Error('Unable to create short link');
};

export const deleteShortLink = async (identifier: string): Promise<void> => {
  const cachedListEndpoint = endpointCache.get('GET:list');
  const cachedCreateEndpoint = endpointCache.get('POST:create');

  const dynamicPatterns = [
    ...(cachedListEndpoint ? [(id: string) => `${cachedListEndpoint}/${id}`] : []),
    ...(cachedCreateEndpoint ? [(id: string) => `${cachedCreateEndpoint}/${id}`] : []),
  ];

  const attempts = [...dynamicPatterns, ...KNOWN_DELETE_PATTERNS];

  let lastError: unknown;

  for (const buildPath of attempts) {
    const path = buildPath(identifier);

    try {
      const response = await fetch(buildUrl(path), { method: 'DELETE' });

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error(`Server responded with ${response.status}`);
        }
        continue;
      }

      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Unable to delete short link');
};
