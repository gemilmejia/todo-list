import { filterTodos } from './todo-filter.util'; // import function
import { createMockTodo } from '../testing/todo-test.factory';
import type { Todo } from '../models/todo.model'; // import type todo

// Create a test suite
describe('filterTodos', () => {
  // 1. Create filtering utility and test All
  it('should return all todos when filter is all', () => {
    // Define one test case
    const todos: Todo[] = [
      // Create sample data
      // each mock Todo contained three properties:
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

    const result = filterTodos(todos, 'all'); // Call the function

    expect(result.map((todo) => todo.id)).toEqual([1, 2, 3]); // Checking the result
  });

  // 2. Test Active filtering
  it('should return only active todos', () => {
    const todos: Todo[] = [
      // A. Create four mock Todos
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

    // B. Call the filtering utility
    const result = filterTodos(todos, 'active');

    // C. Verify the expected result
    expect(result.map((todo) => todo.id)).toEqual([1, 3]);
  });

  // 3. Test Completed filtering
  it('should return only completed todos', () => {
    const todos: Todo[] = [
      // A. Create four mock Todos
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

    // B. Call the filtering utility
    const result = filterTodos(todos, 'completed');

    // C. Verify the expected result
    expect(result.map((todo) => todo.id)).toEqual([2, 4]);
  });

  // 4. Test Empty Arrays and Input Immutability
  // A. Test an empty Todo array
  it('should return an empty array when no todos are provided', () => {
    const todos: Todo[] = [];

    expect(filterTodos(todos, 'all')).toEqual([]);
    expect(filterTodos(todos, 'active')).toEqual([]);
    expect(filterTodos(todos, 'completed')).toEqual([]);
  });

  // B. Test input immutability
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
        title: 'Practice TypeScript',
        completed: false,
      }),
    ];

    // a. Save the original order
    const originalOrder = todos.map((todo) => todo.id);

    // b. Filter the active Todos
    const result = filterTodos(todos, 'active');

    // c. Verify the result is a different array
    expect(result).not.toBe(todos);

    // d. Verify the original array remains unchanged
    expect(todos.map((todo) => todo.id)).toEqual(originalOrder);

    // e. Verify the filtered result
    expect(result.map((todo) => todo.id)).toEqual([1, 3]);
  });
});
