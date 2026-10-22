import { filterTodos } from './todo-filter.util';
import { searchTodos } from './todo-search.util';
import { sortTodos } from './todo-sort.util';
import { processTodos } from './todo-pipeline.util';

import { createMockTodo } from '../testing/todo-test.factory';
import type { Todo } from '../models/todo.model';

// for filterTodos() → searchTodos() → sortTodos()
describe('Todo utility pipeline', () => {
  // 1. Jasmine
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

  // 2. Jasmine
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

  // 3. Jasmine
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

  // 4. Jasmine
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

  // 5. Jasmine
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

  // 6. Jasmine
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

  // 7. Jasmine
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

  // 8. Jasmine
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

  // 9. Jasmine
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

  // 10. Jasmine
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

  // 11. Jasmine
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

  // 12. Jasmine
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
  // 13. Add the empty-results test
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

  // 14. Add the original-array preservation test
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

  // 15. Jasmine
  // 1. Empty Todo array with All filter, search, and sorting A–Z.
  it('should handle an empty todo array across all operations', () => {
    // A. Create an empty Todo array
    const todos: Todo[] = [];

    // B. Filter the Todo array
    const filteredTodos = filterTodos(todos, 'all');

    // C. Search the filtered array
    const matchingTodos = searchTodos(filteredTodos, 'angular');

    // D. Sort the matching results
    const sortedTodos = sortTodos(matchingTodos, 'asc');

    // E. Verify all three operations
    expect(filteredTodos).toEqual([]);

    expect(matchingTodos).toEqual([]);

    expect(sortedTodos).toEqual([]);
  });

  // 16. Jasmine
  // 2. Empty Todo array with Active and Completed filters
  // a. Add the Active filter test
  it('should handle an empty array with active filtering', () => {
    const todos: Todo[] = [];

    const activeTodos = filterTodos(todos, 'active');

    const matchingTodos = searchTodos(activeTodos, 'angular');

    const sortedTodos = sortTodos(matchingTodos, 'asc');

    expect(activeTodos).toEqual([]);

    expect(matchingTodos).toEqual([]);

    expect(sortedTodos).toEqual([]);
  });

  // 17. Jasmine
  // b. Add the Completed filter test
  it('should handle an empty array with completed filtering', () => {
    const todos: Todo[] = [];

    const completedTodos = filterTodos(todos, 'completed');

    const matchingTodos = searchTodos(completedTodos, 'portfolio');

    const sortedTodos = sortTodos(matchingTodos, 'desc');

    expect(completedTodos).toEqual([]);

    expect(matchingTodos).toEqual([]);

    expect(sortedTodos).toEqual([]);
  });

  // 18. Jasmine
  // 3. Unmatched search terms across combined operations
  it('should return empty results when search matches only excluded todos', () => {
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

    const sortedTodos = sortTodos(matchingTodos, 'asc');
    // Assertion 1 — Verify filtering actually returned tasks.
    expect(activeTodos.map((todo) => todo.id)).toEqual([1, 3]);
    // Assertion 2 — Verify searching removes all remaining matches.
    expect(matchingTodos).toEqual([]);
    // Assertion 3 — Verify sorting handles the empty search result.
    expect(sortedTodos).toEqual([]);
  });

  // // 19. Jasmine
  // // 4. Array preservation with empty results
  it('should preserve original todos when the pipeline returns no matches', () => {
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

    const originalOrder = todos.map((todo) => todo.id);

    const filteredTodos = filterTodos(todos, 'all');

    const matchingTodos = searchTodos(filteredTodos, 'nonexistent-task');

    const sortedTodos = sortTodos(matchingTodos, 'asc');

    // Assertion 1 — Filtering returns a separate array
    expect(filteredTodos).not.toBe(todos);
    // Assertion 2 — Searching returns another array
    expect(matchingTodos).not.toBe(filteredTodos);
    // Assertion 3 — Sorting returns another array
    expect(sortedTodos).not.toBe(matchingTodos);
    // Assertion 4 — No matching tasks are displayed
    expect(sortedTodos).toEqual([]);
    // Assertion 5 — The original order is preserved
    expect(todos.map((todo) => todo.id)).toEqual(originalOrder);
    // Assertion 6 — The original number of tasks is unchanged
    expect(todos.length).toBe(4);
  });
});

// for processTodos()
// 2. Integrate processTodos()
describe('processTodos', () => {
  // Added utility test
  it('should filter, search, and sort todos using the provided options', () => {
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
        completed: false,
      }),
    ];

    const result = processTodos(todos, {
      filter: 'active',
      searchTerm: 'angular',
      sortOrder: 'asc',
    });

    expect(result.map((todo) => todo.id)).toEqual([4, 1]);

    expect(result.every((todo) => !todo.completed)).toBeTrue();
  });

  // 2. All filtering + empty search + Default sorting
  it('should preserve all todos with default processing options', () => {
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

    const result = processTodos(todos, {
      filter: 'all',
      searchTerm: '',
      sortOrder: 'default',
    });

    // Assertion 1 — Verify all Todos remain in their original order.
    expect(result.map((todo) => todo.id)).toEqual([1, 2, 3, 4]);
    // Assertion 2 — Verify the result is a separate array.
    expect(result).not.toBe(todos);
  });

  // 2. Completed filtering + Z–A sorting
  it('should filter completed todos and sort them from Z to A', () => {
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

    const result = processTodos(todos, {
      filter: 'completed',
      searchTerm: '',
      sortOrder: 'desc',
    });

    // Assertion 1 — Checks that the correct tasks are included and sorted in descending alphabetical order.
    expect(result.map((todo) => todo.id)).toEqual([2, 3, 5]);
    // Assertion 2 — Checks that every returned task is completed.
    expect(result.every((todo) => todo.completed)).toBeTrue();
  });

  // 3. Mixed-case searching with whitespace
  it('should handle mixed-case search terms with surrounding whitespace', () => {
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
        title: 'Build Portfolio',
        completed: false,
      }),
      createMockTodo({
        id: 4,
        title: 'Learn ANGULAR Basics',
        completed: false,
      }),
      createMockTodo({
        id: 5,
        title: 'Practice TypeScript',
        completed: true,
      }),
    ];

    const result = processTodos(todos, {
      filter: 'active',
      searchTerm: '   aNgUlAr   ',
      sortOrder: 'asc',
    });

    // Assertion 1 — Verifies that filtering, normalized searching, and sorting produce the expected final order.
    expect(result.map((todo) => todo.id)).toEqual([4, 1]);
    // Assertion 2 — Verifies that every returned Todo remains active.
    expect(result.every((todo) => !todo.completed)).toBeTrue();
  });

  // 4. Empty results and input-array preservation
  // a. Test Empty Results
  it('should return an empty array when no todos match the search', () => {
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

    const result = processTodos(todos, {
      filter: 'all',
      searchTerm: 'nonexistent-task',
      sortOrder: 'asc',
    });

    expect(result).toEqual([]);

    expect(todos.length).toBe(3);
  });

  // b. Add the input-array preservation test
  it('should preserve the original array when processing todos', () => {
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

    const result = processTodos(todos, {
      filter: 'active',
      searchTerm: 'angular',
      sortOrder: 'asc',
    });

    expect(result).not.toBe(todos);

    expect(todos.map((todo) => todo.id)).toEqual(originalOrder);

    expect(todos.length).toBe(4);

    expect(result.map((todo) => todo.id)).toEqual([3, 1]);

    expect(result.every((todo) => !todo.completed)).toBeTrue();
  });
});
