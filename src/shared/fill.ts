// A `[FILL]` marker (docs/content.md) stands for a value only Arthur can supply. An optional
// field that is missing or still a marker is omitted from the page, never shown: callers wrap
// it in `isFilled(value) &&`. Prose that always renders is shown as written, so a marker in it
// reaches dist/ and scripts/check-fill.mjs fails the build.
export function isFilled(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim() !== '' && !value.includes('[FILL')
}
