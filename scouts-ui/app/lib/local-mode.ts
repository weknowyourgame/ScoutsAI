export function isServerLocalOnlyMode() {
  return process.env.SCOUTS_LOCAL_ONLY !== "false" && !process.env.DATABASE_URL;
}

export function isBrowserLocalOnlyMode() {
  return process.env.NEXT_PUBLIC_SCOUTS_LOCAL_ONLY !== "false";
}
