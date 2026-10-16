// utils/ contains functions used by the application itself.

import { sortTodos } from './todo-sort.util'; // Import the function
import type { Todo } from '../models/todo.model'; // Import the Todo type
import { createMockTodo } from '../testing/todo-test.factory'; //

// Create a test suite
describe('sortTodos', () => {
  // 1. Asc
  it('should sort todos alphabetically from A to Z', () => {
    // Define one test case
    const todos: Todo[] = [
      // Create sample data
      // each mock Todo contained two properties:
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
        title: 'Review TypeScript',
        completed: true,
      }),
    ];

    const result = sortTodos(todos, 'asc'); // Call the function

    // Check the result
    expect(result.map((todo) => todo.title)).toEqual([
      'Build Portfolio',
      'Review TypeScript',
      'Study Angular',
    ]);
  });

  // 2. Desc
  // Test description
  it('should sort todos alphabetically from Z to A', () => {
    // Test data
    const todos: Todo[] = [
      // each mock Todo contained two or three properties:
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
        title: 'Review TypeScript',
        completed: true,
      }),
    ];

    // Calling the utility
    const result = sortTodos(todos, 'desc');

    // Checking the result
    expect(result.map((todo) => todo.title)).toEqual([
      'Study Angular',
      'Review TypeScript',
      'Build Portfolio',
    ]);
  });

  // 3. Active-first
  // 1. Test description
  it('should place active todos before completed todos', () => {
    // 2. Mock data
    const todos: Todo[] = [
      // each mock Todo contained three properties:
      createMockTodo({
        id: 1,
        title: 'Study Angular',
        completed: true,
      }),
      createMockTodo({
        id: 2,
        title: 'Build Portfolio',
        completed: false,
      }),
      createMockTodo({
        id: 3,
        title: 'Review TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 4,
        title: 'Practice JavaScript',
        completed: false,
      }),
    ];

    const result = sortTodos(todos, 'active-first'); // 3. Call the utility

    expect(result.map((todo) => todo.id)).toEqual([2, 4, 1, 3]); // 4. Verify the result
  });

  // 4. Completed First
  // 1. Define the test
  it('should place completed todos before active todos', () => {
    // 2. Create sample Todo data
    const todos: Todo[] = [
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
        title: 'Review TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 4,
        title: 'Practice JavaScript',
        completed: true,
      }),
    ];

    const result = sortTodos(todos, 'completed-first'); // 3. Call the sorting utility

    expect(result.map((todo) => todo.id)).toEqual([2, 4, 1, 3]); // 4. Verify the expected task order
  });

  // 5. Default order
  // 1. Define Test
  it('should preserve the original order when using default sorting', () => {
    // 2. Create Test Data
    const todos: Todo[] = [
      // each mock Todo contained three properties:
      createMockTodo({
        id: 3,
        title: 'Study Angular',
        completed: true,
      }),
      createMockTodo({
        id: 1,
        title: 'Build Portfolio',
        completed: false,
      }),
      createMockTodo({
        id: 2,
        title: 'Review TypeScript',
        completed: true,
      }),
    ];

    const result = sortTodos(todos, 'default'); // 3. Call the utility

    expect(result.map((todo) => todo.id)).toEqual([3, 1, 2]); // 4. Verify the result
  });

  // 6. Empty Array Test
  // 1. Creates a Jasmine test describing what our utility should do when there are no tasks.
  it('should return an empty array when no todos are provided', () => {
    // 2. Creates an empty array and explicitly types it as an array of Todo objects. ven though the array currently has no items, TypeScript understands which kinds of objects it may contain.
    const todos: Todo[] = [];

    // 3. Calls our utility with an empty array and the A–Z sorting option.
    const result = sortTodos(todos, 'asc');

    // 4. Verifies that the returned value is an empty array. If the utility unexpectedly returns undefined, null, or another value, this test will fail.
    expect(result).toEqual([]);
  });

  // 7. Immutability Test
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
        title: 'Review TypeScript',
        completed: false,
      }),
    ];

    // A. Store the original order
    const originalOrder = todos.map((todo) => todo.id);

    // B. Run the sorting utility
    const result = sortTodos(todos, 'asc');

    // C. Verify a different array was returned
    expect(result).not.toBe(todos);

    // D. Verify the original order is unchanged
    expect(todos.map((todo) => todo.id)).toEqual(originalOrder);

    // E. Verify the sorted result
    expect(result.map((todo) => todo.id)).toEqual([2, 3, 1]);
  });
});
