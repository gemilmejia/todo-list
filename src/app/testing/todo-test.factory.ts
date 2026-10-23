// testing/ contains helpers intended for test files.

import type { Todo } from '../models/todo.model'; // Import the Todo type

export function createMockTodo(overrides: Partial<Todo> = {}): Todo {
  // Define the factory
  return {
    // Lines 6–12 — Return a complete Todo
    id: 1,
    title: 'Test Todo',
    completed: false,
    completedAt: null,
    ...overrides,
  };
}
