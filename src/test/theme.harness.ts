import type { HexColor, ThemeDefinition, ThemeTokens } from "@/domain/theme/theme.types";

/**
 * Builds a `#RRGGBB` value from six digits.
 *
 * Test files keep the `#` outside the literal so the boundary check never mistakes a pinned palette
 * value for a production hex color.
 *
 * @param digits - Six hexadecimal digits without the leading `#`.
 * @returns The color value.
 */
export function hex(digits: string): HexColor {
  return `#${digits}` as HexColor;
}

/**
 * Reads one definition by position, failing loudly instead of returning `undefined`.
 *
 * Palette tests assert against a fixed catalogue order, so a missing entry is a broken fixture
 * rather than a condition under test.
 *
 * @param definitions - Definitions in catalogue order.
 * @param index - Position to read.
 * @returns The definition at that position.
 * @throws When the position is empty.
 */
export function readDefinition(
  definitions: readonly ThemeDefinition[],
  index: number,
): ThemeDefinition {
  const definition = definitions[index];

  if (definition === undefined) {
    throw new Error(`Missing theme definition at index ${index}.`);
  }

  return definition;
}

/**
 * Reads the tokens of one definition by position.
 *
 * @param definitions - Definitions in catalogue order.
 * @param index - Position to read.
 * @returns The tokens at that position.
 * @throws When the position is empty.
 */
export function readTokens(definitions: readonly ThemeDefinition[], index: number): ThemeTokens {
  return readDefinition(definitions, index).tokens;
}

/**
 * Reads the names of every definition, in catalogue order.
 *
 * @param definitions - Definitions in catalogue order.
 * @returns The definition names.
 */
export function readNames(definitions: readonly ThemeDefinition[]): readonly string[] {
  return definitions.map((definition) => definition.name);
}
