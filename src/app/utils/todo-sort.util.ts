// Imports
import type { Todo } from '../models/todo.model'; // The first import provides the structure of a Todo object, including its title and completion status.
import type { TodoSortOrder } from '../models/todo-sort-order.type'; // The second import provides our five valid sorting values.

// Function Declaration
export function sortTodos(
  todos: readonly Todo[],
  sortOrder: TodoSortOrder,
): Todo[] {
  const sortedTodos = [...todos]; // This creates a new array containing the same Todo objects.

  // The switch statement
  switch (sortOrder) {
    case 'asc':
      return sortedTodos.sort((a, b) => a.title.localeCompare(b.title));

    case 'desc':
      return sortedTodos.sort((a, b) => b.title.localeCompare(a.title));

    case 'active-first':
      return sortedTodos.sort(
        (a, b) => Number(a.completed) - Number(b.completed),
      );

    case 'completed-first':
      return sortedTodos.sort(
        (a, b) => Number(b.completed) - Number(a.completed),
      );

    case 'default':
      return sortedTodos;
  }
}
