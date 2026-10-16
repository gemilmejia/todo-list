// testing/ contains helpers intended for test files.

import type { Todo } from '../models/todo.model';

export function createMockTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 1,
    title: 'Test Todo',
    completed: false,
    completedAt: null,
    ...overrides,
  };
}
