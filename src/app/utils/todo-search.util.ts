import type { Todo } from '../models/todo.model'; // Import the Todo interface

// Define the search function
export function searchTodos(
  todos: readonly Todo[],
  searchTerm: string,
): Todo[] {
  // Normalize the search term
  const search = searchTerm.trim().toLowerCase();

  // Handle an empty search
  if (!search) {
    return [...todos];
  }

  // Find matching titles
  return todos.filter((todo) => todo.title.toLowerCase().includes(search));
}
