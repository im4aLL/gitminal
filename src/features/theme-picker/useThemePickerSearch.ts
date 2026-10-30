import { useCallback, useEffect, useState } from "react";
import { registerInputMode } from "@/app/hooks/inputMode.registry";
import { useAction } from "@/app/hooks/useAction";
import { useDebouncedValue } from "@/app/hooks/useDebouncedValue";
import { useFocusState } from "@/app/hooks/useFocusState";
import { registerInputEscapeClear } from "@/app/hooks/useInputEscapeClear";
import {
  THEME_PICKER_SEARCH_ACTION_ID,
  THEME_PICKER_SEARCH_DEBOUNCE_MS,
  THEME_PICKER_SEARCH_INPUT_ID,
} from "@/features/theme-picker/ThemePicker.constants";
import type { ThemePickerSearch } from "@/features/theme-picker/useThemePicker.types";
import { MODAL_FRAME_ID } from "@/ui/ModalFrame.constants";

/**
 * Owns the picker's search text, its quiet interval, and the search field focus.
 *
 * Clearing is never debounced, so an empty field restores the whole list in the same render, and the
 * `hasQuery` flag, the match list, and the no-match guard all read one settled query. The field
 * declares the `search` input mode, which is what routes Up, Down, and Enter to the row list while
 * the input keeps native focus, and it registers the first-Esc clear for both the field and the modal
 * frame, so the first Esc clears the filter and the next one closes the picker.
 *
 * @returns The query, its writers, and the focus trigger the picker registers.
 */
export function useThemePickerSearch(): ThemePickerSearch {
  const [query, setQuery] = useState("");
  const focus = useFocusState();
  const debouncedQuery = useDebouncedValue(query, THEME_PICKER_SEARCH_DEBOUNCE_MS);
  const activeQuery = query.length === 0 ? "" : debouncedQuery;

  /** Replaces the search text. */
  const setQueryValue = useCallback((value: string): void => {
    setQuery(value);
  }, []);

  /** Clears the search text. */
  const clearSearch = useCallback((): void => {
    setQuery("");
  }, []);

  /** Moves native focus to the search field. */
  const focusSearch = useCallback((): void => {
    focus.focusRenderable(THEME_PICKER_SEARCH_INPUT_ID);
  }, [focus]);

  useEffect(() => registerInputMode(THEME_PICKER_SEARCH_INPUT_ID, "search"), []);

  useEffect(() => {
    if (query.length === 0) {
      return;
    }

    const cleanups = [
      registerInputEscapeClear(THEME_PICKER_SEARCH_INPUT_ID, clearSearch),
      registerInputEscapeClear(MODAL_FRAME_ID, clearSearch),
    ];

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [clearSearch, query.length]);

  useAction(THEME_PICKER_SEARCH_ACTION_ID, { scope: "overlay" }, focusSearch);

  return {
    query,
    activeQuery,
    hasQuery: activeQuery.trim().length > 0,
    setQuery: setQueryValue,
    clearSearch,
    focusSearch,
  };
}
