export type TodoSortOrder =
  | 'default'
  | 'asc'
  | 'desc'
  | 'active-first'
  | 'completed-first';

export const TODO_SORT_ORDERS: readonly TodoSortOrder[] = [
  'default',
  'asc',
  'desc',
  'active-first',
  'completed-first',
];

export function isTodoSortOrder(value: string | null): value is TodoSortOrder {
  return value !== null && TODO_SORT_ORDERS.some((order) => order === value);
}
