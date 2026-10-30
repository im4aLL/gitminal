/**
 * Merges theme warning lists into one bounded, de-duplicated list.
 *
 * Theme warnings arrive from more than one place: the catalogue records rejected files, resolution
 * records the selected name and the `theme.json` layer, and the provider adds the reason a requested
 * detected theme is unavailable. `resolveTheme` already carries the catalogue warnings, so a provider
 * that merges again would otherwise publish the same line twice. Order is first occurrence, which
 * keeps catalogue warnings ahead of resolution warnings and keeps the status strip on the warning that
 * explains why a configured name is missing.
 *
 * @param lists - Warning lists in publication order.
 * @returns The merged warnings, with duplicates removed.
 */
export function mergeThemeWarnings(...lists: readonly (readonly string[])[]): readonly string[] {
  const merged: string[] = [];

  for (const list of lists) {
    for (const warning of list) {
      if (!merged.includes(warning)) {
        merged.push(warning);
      }
    }
  }

  return Object.freeze(merged);
}
