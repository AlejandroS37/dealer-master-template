export function introStorageKey(dealerId: string, version: string) {
  return `dealer-intro-seen:${dealerId}:${version}`;
}
export function shouldShowIntro({
  enabled,
  reducedMotion,
  replay,
  seen,
}: {
  enabled: boolean;
  reducedMotion: boolean;
  replay: boolean;
  seen: boolean;
}) {
  return enabled && !reducedMotion && (replay || !seen);
}
