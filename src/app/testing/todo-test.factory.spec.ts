import { createMockTodo } from './todo-test.factory'; // 1. Import the factory

// Create a test suite
describe('createMockTodo', () => {
  // 1. Verify default Todo properties
  // Define the test case
  it('should create a Todo with default values', () => {
    // Call the factory
    const todo = createMockTodo();

    // Verify the output
    expect(todo).toEqual({
      id: 1,
      title: 'Test Todo',
      completed: false,
      completedAt: null,
    });
  });

  // 2. Verify custom property overrides test
  it('should override default Todo properties', () => {
    const todo = createMockTodo({
      id: 25,
      title: 'Learn Angular Unit Testing',
      completed: true,
      completedAt: '2026-10-16T10:00:00.000Z',
    });

    expect(todo).toEqual({
      id: 25,
      title: 'Learn Angular Unit Testing',
      completed: true,
      completedAt: '2026-10-16T10:00:00.000Z',
    });
  });

  // 3. Verify Unspecified Default Properties
  it('should preserve default values for unspecified properties', () => {
    // First, we create a Todo with just one override:
    const todo = createMockTodo({
      //
      title: 'Practice TypeScript',
    });

    // Second, Jasmine verifies the complete object:
    expect(todo).toEqual({
      id: 1,
      title: 'Practice TypeScript',
      completed: false,
      completedAt: null,
    });
  });

  // 4. Verify Independent Todo Objects
  it('should create independent Todo objects', () => {
    // A. Create two Todos
    const firstTodo = createMockTodo();
    const secondTodo = createMockTodo();

    // B. Verify different object references
    expect(firstTodo).not.toBe(secondTodo);

    // C. Modify the first Todo
    firstTodo.title = 'Updated First Todo';

    // D. Verify the second Todo is unaffected
    expect(firstTodo.title).toBe('Updated First Todo');
    expect(secondTodo.title).toBe('Test Todo');
  });
});
