import { filterTodos } from './todo-filter.util';
import { searchTodos } from './todo-search.util';
import { sortTodos } from './todo-sort.util';

import { createMockTodo } from '../testing/todo-test.factory';
import type { Todo } from '../models/todo.model';

describe('Todo utility pipeline', () => {
  // 1. Test Active + Search + A–Z sorting
  it('should filter active todos, search by title, and sort A to Z', () => {
    // A. Start with five Todos
    const todos: Todo[] = [
      createMockTodo({
        id: 1,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 2,
        title: 'Build Portfolio',
        completed: false,
      }),
      createMockTodo({
        id: 3,
        title: 'Angular Testing',
        completed: true,
      }),
      createMockTodo({
        id: 4,
        title: 'Practice Angular',
        completed: false,
      }),
      createMockTodo({
        id: 5,
        title: 'Learn TypeScript',
        completed: true,
      }),
    ];

    // B. Filter Active tasks
    const activeTodos = filterTodos(todos, 'active');

    // C. Search for angular
    const matchingTodos = searchTodos(activeTodos, 'angular');

    // D. Sort alphabetically A–Z
    const sortedTodos = sortTodos(matchingTodos, 'asc');

    expect(sortedTodos.map((todo) => todo.id)).toEqual([4, 1]);
  });

  // 2. Test combined filtering with different search terms
  it('should filter active todos and search case-insensitively', () => {
    const todos: Todo[] = [
      createMockTodo({
        id: 1,
        title: 'Build Portfolio',
        completed: false,
      }),
      createMockTodo({
        id: 2,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 3,
        title: 'Portfolio Review',
        completed: true,
      }),
      createMockTodo({
        id: 4,
        title: 'Update Portfolio',
        completed: false,
      }),
      createMockTodo({
        id: 5,
        title: 'Portfolio Design',
        completed: false,
      }),
    ];

    const activeTodos = filterTodos(todos, 'active');

    const matchingTodos = searchTodos(activeTodos, 'PORTFOLIO');

    const sortedTodos = sortTodos(matchingTodos, 'desc');

    expect(sortedTodos.map((todo) => todo.id)).toEqual([4, 5, 1]);
  });
  // 3. Test combined Completed filtering and sorting
  it('should filter completed todos, search by title, and sort A to Z', () => {
    const todos: Todo[] = [
      createMockTodo({
        id: 1,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 2,
        title: 'Review Angular',
        completed: true,
      }),
      createMockTodo({
        id: 3,
        title: 'Build Portfolio',
        completed: true,
      }),
      createMockTodo({
        id: 4,
        title: 'Angular Testing',
        completed: true,
      }),
      createMockTodo({
        id: 5,
        title: 'Practice Angular',
        completed: false,
      }),
    ];

    // A. Filter completed tasks
    const completedTodos = filterTodos(todos, 'completed');
    // B. Search for ANGULAR
    const matchingTodos = searchTodos(completedTodos, 'ANGULAR');
    // C. Sort from A–Z
    const sortedTodos = sortTodos(matchingTodos, 'asc');

    expect(sortedTodos.map((todo) => todo.id)).toEqual([4, 2]);
  });

  // 4. Verify empty results and original array preservation
  // Add the empty-results test
  it('should return an empty array when no todos match', () => {
    const todos: Todo[] = [
      createMockTodo({
        id: 1,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 2,
        title: 'Build Portfolio',
        completed: true,
      }),
      createMockTodo({
        id: 3,
        title: 'Practice TypeScript',
        completed: false,
      }),
    ];

    const activeTodos = filterTodos(todos, 'active');

    const matchingTodos = searchTodos(activeTodos, 'portfolio');

    const sortedTodos = sortTodos(matchingTodos, 'asc');

    expect(sortedTodos).toEqual([]);
  });

  // Add the original-array preservation test
  it('should not modify the original todos array', () => {
    const todos: Todo[] = [
      createMockTodo({
        id: 1,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 2,
        title: 'Build Portfolio',
        completed: true,
      }),
      createMockTodo({
        id: 3,
        title: 'Practice Angular',
        completed: false,
      }),
    ];

    const originalOrder = todos.map((todo) => todo.id);

    const activeTodos = filterTodos(todos, 'active');

    const matchingTodos = searchTodos(activeTodos, 'angular');

    const sortedTodos = sortTodos(matchingTodos, 'asc');

    // Assertion 1 — The resulting array is a separate array.
    expect(sortedTodos).not.toBe(todos);
    // Assertion 2 — The original order remains unchanged.
    expect(todos.map((todo) => todo.id)).toEqual(originalOrder);
    // Assertion 3 — The result is correctly sorted.
    expect(sortedTodos.map((todo) => todo.id)).toEqual([3, 1]);
  });
  // Run all five pipeline tests
  // run: npx ng test --watch=false --include="src/app/utils/todo-pipeline.util.spec.ts"
  // 5. Final Angular Test Suite Verification
  // run: npm test -- --watch=false
});
