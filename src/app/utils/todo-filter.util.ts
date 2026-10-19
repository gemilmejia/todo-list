import type { Todo } from '../models/todo.model'; // Import the Todo interface

export type TodoFilter = 'all' | 'active' | 'completed'; // Create a filter type. This is called a union type.

// Define the function
export function filterTodos(
  todos: readonly Todo[],
  filter: TodoFilter,
): Todo[] {
  // Handle the filtering options
  switch (filter) {
    case 'active':
      return todos.filter((todo) => !todo.completed);

    case 'completed':
      return todos.filter((todo) => todo.completed);

    case 'all':
      return [...todos];
  }
}
