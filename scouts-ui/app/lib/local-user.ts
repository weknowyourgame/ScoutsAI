export type LocalScoutUser = {
  id: string;
  email?: string;
};

const STORAGE_KEY = "scouts.localUser";

export function getOrCreateLocalScoutUser(email?: string): LocalScoutUser {
  if (typeof window === "undefined") {
    return { id: "test-user-local", email };
  }

  const existingRaw = window.localStorage.getItem(STORAGE_KEY);
  const existing = existingRaw ? JSON.parse(existingRaw) as LocalScoutUser : null;
  const user = {
    id: existing?.id || `test-user-${crypto.randomUUID()}`,
    email: email || existing?.email,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}
