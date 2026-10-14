export const TODO_SORT_ORDERS = [
  'default',
  'asc',
  'desc',
  'active-first',
  'completed-first',
] as const; // as const is a TypeScript const assertion.

export type TodoSortOrder = (typeof TODO_SORT_ORDERS)[number];

export function isTodoSortOrder(value: string | null): value is TodoSortOrder {
  return value !== null && TODO_SORT_ORDERS.some((order) => order === value);
}
