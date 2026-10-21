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

  // 1. Active filter with whitespace-only search
  it('should preserve active todos when search contains only whitespace', () => {
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
      createMockTodo({
        id: 4,
        title: 'Review Unit Testing',
        completed: true,
      }),
    ];

    // A. Filter active Todos.
    const activeTodos = filterTodos(todos, 'active');
    // B. Search using whitespace only.
    const matchingTodos = searchTodos(activeTodos, '   ');
    // C. Verify the expected result.
    expect(matchingTodos.map((todo) => todo.id)).toEqual([1, 3]);
  });

  // 2. Mixed-case title searching
  it('should search active todos using mixed-case text', () => {
    const todos: Todo[] = [
      createMockTodo({
        id: 1,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 2,
        title: 'Angular Testing',
        completed: true,
      }),
      createMockTodo({
        id: 3,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 4,
        title: 'Learn ANGULAR Basics',
        completed: false,
      }),
      createMockTodo({
        id: 5,
        title: 'Build Portfolio',
        completed: true,
      }),
    ];

    // A. Filter Active tasks
    const activeTodos = filterTodos(todos, 'active');
    // B. Search using mixed-case text
    const matchingTodos = searchTodos(activeTodos, 'aNgUlAr');
    // C. Verify the final result
    expect(matchingTodos.map((todo) => todo.id)).toEqual([1, 4]);
  });

  // 3. Search terms with no matching active Todos
  it('should return no results when only completed todos match the search', () => {
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
      createMockTodo({
        id: 4,
        title: 'Portfolio Review',
        completed: true,
      }),
    ];

    const activeTodos = filterTodos(todos, 'active');

    const matchingTodos = searchTodos(activeTodos, 'portfolio');

    expect(matchingTodos).toEqual([]);
  });

  // 4. Original array preservation
  it('should preserve the original array when filtering and searching active todos', () => {
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
      createMockTodo({
        id: 4,
        title: 'Angular Testing',
        completed: true,
      }),
    ];

    const originalOrder = todos.map((todo) => todo.id);

    const activeTodos = filterTodos(todos, 'active');

    const matchingTodos = searchTodos(activeTodos, 'angular');

    // Assertion 1 — Filtering creates a separate array
    expect(activeTodos).not.toBe(todos);
    // Assertion 2 — Searching creates another separate array
    expect(matchingTodos).not.toBe(activeTodos);
    // Assertion 3 — The original order remains unchanged
    expect(todos.map((todo) => todo.id)).toEqual(originalOrder);
    // Assertion 4 — Only matching Active tasks are returned
    expect(matchingTodos.map((todo) => todo.id)).toEqual([1, 3]);
  });

  // 1. Completed + A–Z sorting
  it('should sort completed todos alphabetically from A to Z', () => {
    const todos: Todo[] = [
      createMockTodo({
        id: 1,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 2,
        title: 'Write Documentation',
        completed: true,
      }),
      createMockTodo({
        id: 3,
        title: 'Build Portfolio',
        completed: true,
      }),
      createMockTodo({
        id: 4,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 5,
        title: 'Angular Testing',
        completed: true,
      }),
    ];
    // A. Filter completed tasks
    const completedTodos = filterTodos(todos, 'completed');
    // B. Sort alphabetically
    const sortedTodos = sortTodos(completedTodos, 'asc');
    // C. Verify the correct order
    expect(sortedTodos.map((todo) => todo.id)).toEqual([5, 3, 2]);
    // D. Verify that every returned task is completed
    expect(sortedTodos.every((todo) => todo.completed)).toBeTrue();
  });

  // 2. Completed + Z–A sorting
  it('should sort completed todos alphabetically from Z to A', () => {
    const todos: Todo[] = [
      createMockTodo({
        id: 1,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 2,
        title: 'Write Documentation',
        completed: true,
      }),
      createMockTodo({
        id: 3,
        title: 'Build Portfolio',
        completed: true,
      }),
      createMockTodo({
        id: 4,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 5,
        title: 'Angular Testing',
        completed: true,
      }),
    ];

    const completedTodos = filterTodos(todos, 'completed');

    const sortedTodos = sortTodos(completedTodos, 'desc');
    // Assertion 1 — Verify descending order.
    expect(sortedTodos.map((todo) => todo.id)).toEqual([2, 3, 5]);
    // Assertion 2 — Verify completion status.
    expect(sortedTodos.every((todo) => todo.completed)).toBeTrue();
  });

  // 3. Completed + default sorting
  it('should preserve completed todo order with default sorting', () => {
    const todos: Todo[] = [
      createMockTodo({
        id: 1,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 2,
        title: 'Write Documentation',
        completed: true,
      }),
      createMockTodo({
        id: 3,
        title: 'Angular Testing',
        completed: true,
      }),
      createMockTodo({
        id: 4,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 5,
        title: 'Build Portfolio',
        completed: true,
      }),
    ];

    const completedTodos = filterTodos(todos, 'completed');

    const sortedTodos = sortTodos(completedTodos, 'default');
    // Assertion 1 — Original relative order is preserved
    expect(sortedTodos.map((todo) => todo.id)).toEqual([2, 3, 5]);
    // Assertion 2 — Sorting returns a separate array
    expect(sortedTodos).not.toBe(completedTodos);
    // Assertion 3 — Every returned task remains completed
    expect(sortedTodos.every((todo) => todo.completed)).toBeTrue();
  });

  // 4. Empty results and array preservation
  // Add the empty-results test
  it('should return an empty array when no completed todos exist', () => {
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
        title: 'Practice TypeScript',
        completed: false,
      }),
    ];

    // returns an empty array.
    const completedTodos = filterTodos(todos, 'completed');

    const sortedTodos = sortTodos(completedTodos, 'asc');

    expect(completedTodos).toEqual([]);

    expect(sortedTodos).toEqual([]);
  });

  // Add the original-array preservation test
  it('should preserve the original array when sorting completed todos', () => {
    const todos: Todo[] = [
      createMockTodo({
        id: 1,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 2,
        title: 'Write Documentation',
        completed: true,
      }),
      createMockTodo({
        id: 3,
        title: 'Angular Testing',
        completed: true,
      }),
      createMockTodo({
        id: 4,
        title: 'Build Portfolio',
        completed: true,
      }),
    ];

    const originalOrder = todos.map((todo) => todo.id);

    const completedTodos = filterTodos(todos, 'completed');

    const sortedTodos = sortTodos(completedTodos, 'asc');

    expect(completedTodos).not.toBe(todos);

    expect(sortedTodos).not.toBe(completedTodos);

    expect(todos.map((todo) => todo.id)).toEqual(originalOrder);

    expect(sortedTodos.map((todo) => todo.id)).toEqual([3, 4, 2]);

    expect(sortedTodos.every((todo) => todo.completed)).toBeTrue();
  });
});
