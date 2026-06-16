import { useState } from "react";

export function useDropdownKeyboard<T>(
  items: T[],
  onSelect: (item: T) => void,
  onClose: () => void
) {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const reset = () => setHighlightedIndex(-1);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        onSelect(items[highlightedIndex]);
        reset();
      }
    } else if (e.key === "Escape") {
      onClose();
      reset();
    }
  };

  return { highlightedIndex, setHighlightedIndex, handleKeyDown, reset };
}