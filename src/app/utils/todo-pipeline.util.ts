// This imports the TypeScript type for compile-time checking.
import type { Todo } from '../models/todo.model';

import type { TodoFilter } from './todo-filter.util';
import type { TodoSortOrder } from '../models/todo-sort-order.type';

// This imports an actual function that our application will execute.
import { filterTodos } from './todo-filter.util';
import { searchTodos } from './todo-search.util';
import { sortTodos } from './todo-sort.util';

// This interface defines the three settings required to process a Todo list.
export interface TodoProcessingOptions {
  filter: TodoFilter;
  searchTerm: string;
  sortOrder: TodoSortOrder;
}

// For Example:

// const options: TodoProcessingOptions = {
//   filter: 'active',
//   searchTerm: 'angular',
//   sortOrder: 'asc',
// };

// 1. Create processTodos():
// Our new function takes two arguments:
export function processTodos(
  todos: readonly Todo[], // This prevents the function from directly using array-mutating methods such as push() or splice() on the input. However, it doesn't make each Todo object deeply immutable.
  options: TodoProcessingOptions,
): Todo[] {
  // Our processing utilities return new arrays containing the selected Todos. That means the caller receives a result array that can be displayed independently of the original array structure.
  const filteredTodos = filterTodos(todos, options.filter);

  const matchingTodos = searchTodos(filteredTodos, options.searchTerm);

  return sortTodos(matchingTodos, options.sortOrder);
}
