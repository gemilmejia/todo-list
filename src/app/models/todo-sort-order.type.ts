// Configuration array
// value is what our component uses internally. label is what the user sees.
export const TODO_SORT_OPTIONS = [
  { value: 'default', label: 'Default order' },
  { value: 'asc', label: 'Title: A–Z' },
  { value: 'desc', label: 'Title: Z–A' },
  { value: 'active-first', label: 'Active Tasks First' },
  { value: 'completed-first', label: 'Completed Tasks First' },
] as const;

// Deriving the type
export type TodoSortOrder = (typeof TODO_SORT_OPTIONS)[number]['value'];

// Runtime validation
export function isTodoSortOrder(value: string | null): value is TodoSortOrder {
  return (
    value !== null && TODO_SORT_OPTIONS.some((option) => option.value === value)
  );
}
