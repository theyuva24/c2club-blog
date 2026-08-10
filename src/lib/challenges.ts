export type ChallengePrize = {
  placement?: string;
  reward?: string;
};

export type Challenge = {
  id: string;
  title: string;
  tagline?: string;
  bannerUrl?: string;
  cardUrl?: string;
  category?: string;
  overview?: string;
  rules?: string | string[];
  prizes?: ChallengePrize[];
  startTime?: string;
  submissionEndTime?: string;
  status?: string;
};

type FirestoreValue = Record<string, unknown>;

const CHALLENGES_ENDPOINT =
  'https://firestore.googleapis.com/v1/projects/c2club-fd6722/databases/(default)/documents/challenges?pageSize=100';

const decodeValue = (value: FirestoreValue | undefined): unknown => {
  if (!value) return undefined;
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return String(value.stringValue ?? '');
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('timestampValue' in value) return String(value.timestampValue ?? '');
  if ('arrayValue' in value) {
    const values = (value.arrayValue as { values?: FirestoreValue[] } | undefined)?.values;
    return Array.isArray(values) ? values.map(decodeValue) : [];
  }
  if ('mapValue' in value) {
    const fields = (value.mapValue as { fields?: Record<string, FirestoreValue> } | undefined)?.fields || {};
    return Object.fromEntries(Object.entries(fields).map(([key, nested]) => [key, decodeValue(nested)]));
  }
  return undefined;
};

const decodeFields = (fields: Record<string, FirestoreValue> | undefined) =>
  Object.fromEntries(Object.entries(fields || {}).map(([key, value]) => [key, decodeValue(value)]));

const normalizeTimestamp = (value: unknown): string | undefined => {
  if (typeof value === 'string' && Number.isFinite(Date.parse(value))) return new Date(value).toISOString();
  if (typeof value === 'number' && Number.isFinite(value)) {
    const millis = value > 10_000_000_000 ? value : value * 1000;
    return new Date(millis).toISOString();
  }
  if (value && typeof value === 'object') {
    const seconds = Number((value as { seconds?: unknown; _seconds?: unknown }).seconds ?? (value as { _seconds?: unknown })._seconds);
    const nanos = Number((value as { nanoseconds?: unknown; _nanoseconds?: unknown }).nanoseconds ?? (value as { _nanoseconds?: unknown })._nanoseconds ?? 0);
    if (Number.isFinite(seconds)) return new Date((seconds * 1000) + Math.floor(nanos / 1_000_000)).toISOString();
  }
  return undefined;
};

const normalizeRules = (value: unknown): string | string[] | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const rules = value.map((item) => typeof item === 'string' ? item : '').filter(Boolean);
    return rules.length ? rules : undefined;
  }
  return undefined;
};

const normalizePrizes = (value: unknown): ChallengePrize[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const placement = String((item as Record<string, unknown>).placement ?? (item as Record<string, unknown>).position ?? '').trim();
    const reward = String((item as Record<string, unknown>).reward ?? (item as Record<string, unknown>).prize ?? '').trim();
    return placement || reward ? [{ placement, reward }] : [];
  });
};

const normalizeDocument = (document: { name?: string; fields?: Record<string, FirestoreValue> }): Challenge | null => {
  const fields = decodeFields(document.fields);
  const id = String(document.name || '').split('/').pop()?.trim() || '';
  const title = typeof fields.title === 'string' ? fields.title.trim() : '';
  if (!id || !title) return null;

  return {
    id,
    title,
    tagline: typeof fields.tagline === 'string' ? fields.tagline : undefined,
    bannerUrl: typeof fields.bannerUrl === 'string' ? fields.bannerUrl : undefined,
    cardUrl: typeof fields.cardUrl === 'string' ? fields.cardUrl : undefined,
    category: typeof fields.category === 'string' ? fields.category : undefined,
    overview: typeof fields.overview === 'string' ? fields.overview : undefined,
    rules: normalizeRules(fields.rules),
    prizes: normalizePrizes(fields.prizes),
    startTime: normalizeTimestamp(fields.startTime),
    submissionEndTime: normalizeTimestamp(fields.submissionEndTime),
    status: typeof fields.status === 'string' ? fields.status : undefined,
  };
};

export const listChallenges = async (): Promise<Challenge[]> => {
  const response = await fetch(CHALLENGES_ENDPOINT, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Challenge request failed with ${response.status}`);
  const payload = await response.json() as { documents?: Array<{ name?: string; fields?: Record<string, FirestoreValue> }> };
  return (payload.documents || []).map(normalizeDocument).filter((item): item is Challenge => item !== null);
};
