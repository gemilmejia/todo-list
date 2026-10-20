import { searchTodos } from './todo-search.util';
import { createMockTodo } from '../testing/todo-test.factory';
import type { Todo } from '../models/todo.model';

describe('searchTodos', () => {
  // 1. Case-insensitive searching
  it('should find todos by title regardless of letter case', () => {
    const todos: Todo[] = [
      createMockTodo({
        id: 1,
        title: 'Study Angular',
      }),
      createMockTodo({
        id: 2,
        title: 'Build Portfolio',
      }),
      createMockTodo({
        id: 3,
        title: 'Practice Angular Testing',
      }),
    ];

    const result = searchTodos(todos, 'ANGULAR');

    expect(result.map((todo) => todo.id)).toEqual([1, 3]);
  });

  // 2. Leading and trailing whitespace
  it('should ignore leading and trailing whitespace in search terms', () => {
    const todos: Todo[] = [
      createMockTodo({
        id: 1,
        title: 'Study Angular',
      }),
      createMockTodo({
        id: 2,
        title: 'Build Portfolio',
      }),
      createMockTodo({
        id: 3,
        title: 'Practice Angular Testing',
      }),
    ];

    const result = searchTodos(todos, '   angular   ');

    expect(result.map((todo) => todo.id)).toEqual([1, 3]);
  });

  // 3. Empty search terms and unmatched search terms
  // Empty search terms
  it('should return all todos when the search term is empty', () => {
    const todos: Todo[] = [
      createMockTodo({
        id: 1,
        title: 'Study Angular',
      }),
      createMockTodo({
        id: 2,
        title: 'Build Portfolio',
      }),
      createMockTodo({
        id: 3,
        title: 'Practice TypeScript',
      }),
    ];

    const result = searchTodos(todos, '');

    expect(result.map((todo) => todo.id)).toEqual([1, 2, 3]);
  });

  // Unmatched search terms
  it('should return an empty array when no titles match', () => {
    const todos: Todo[] = [
      createMockTodo({
        id: 1,
        title: 'Study Angular',
      }),
      createMockTodo({
        id: 2,
        title: 'Build Portfolio',
      }),
      createMockTodo({
        id: 3,
        title: 'Practice TypeScript',
      }),
    ];

    const result = searchTodos(todos, 'nonexistent-task');

    // Assertion:
    expect(result).toEqual([]);
  });
  // 4. Search Input immutability
  it('should not modify the original todos array', () => {
    const todos: Todo[] = [
      createMockTodo({
        id: 1,
        title: 'Study Angular',
      }),
      createMockTodo({
        id: 2,
        title: 'Build Portfolio',
      }),
      createMockTodo({
        id: 3,
        title: 'Angular Testing',
      }),
    ];

    // A. Save the original Todo order
    const originalOrder = todos.map((todo) => todo.id);

    // B. Search for matching Todos
    const result = searchTodos(todos, 'angular');

    // C. Verify a separate array was returned
    expect(result).not.toBe(todos);

    // D. Verify the original Todo order
    expect(todos.map((todo) => todo.id)).toEqual(originalOrder);

    // E. Verify the search results
    expect(result.map((todo) => todo.id)).toEqual([1, 3]);
  });

  // Integrate searchTodos() into todo-list.component.ts and run all tests
  // run: npm test -- --watch=false
});
