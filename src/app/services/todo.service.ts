import { Injectable } from '@angular/core';
import { Todo } from '../models/todo.model'; // import the Todo interface to use it in this service

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  constructor() {
    this.loadTodos(); // Load the todos from local storage when the service is initialized
  }

  todos: Todo[] = []; // Define a property to hold the list of todos

  // Add a new todo item to the list
  addTask(task: string) {
    const trimmedTask = task.trim();

    if (trimmedTask === '') {
      return;
    }

    // create a new Todo object using the Todo interface
    const newTodo: Todo = {
      id: Date.now(),
      title: trimmedTask,
      completed: false,
      completedAt: null, // Set the completedAt property to null when a new todo is created
    };
    // add the new Todo object to the todos array
    this.todos.push(newTodo);
    // Save the updated todos array to local storage
    this.saveTodos();
  }

  // Delete a todo item from the list based on its id
  deleteTodo(id: number) {
    this.todos = this.todos.filter((todo) => todo.id !== id);

    this.saveTodos(); // Save the updated todos array to local storage after deleting a todo
  }

  // Toggle the completed status of a todo item
  toggleCompleted(todo: Todo) {
    // todo: The Todo object whose completed status needs to be toggled
    todo.completed = !todo.completed;

    if (todo.completed) {
      todo.completedAt = new Date().toISOString(); // Set the completedAt property to the current date and time when a todo is marked as completed
    } else {
      todo.completedAt = null; // Set the completedAt property to null when a todo is marked as not completed.
    }

    this.saveTodos(); // Save the updated todos array to local storage after toggling the completed status
  }

  // Save the current list of todos to local storage as a JSON string
  saveTodos() {
    localStorage.setItem(
      'todos', // "Key": The name of the item to store in local storage
      JSON.stringify(this.todos), // "Value": Convert the todos array to a JSON string
    );
  }

  loadTodos() {
    const savedTodos = localStorage.getItem('todos');

    if (!savedTodos) {
      return;
    }

    try {
      const parsedTodos = JSON.parse(savedTodos);

      if (!Array.isArray(parsedTodos)) {
        console.error('Invalid todo data: expected an array.');
        this.todos = [];
        return;
      }

      this.todos = parsedTodos.filter((todo) => {
        return (
          typeof todo.id === 'number' &&
          typeof todo.title === 'string' &&
          todo.title.trim() !== '' &&
          typeof todo.completed === 'boolean' &&
          (typeof todo.completedAt === 'string' || todo.completedAt === null)
        );
      });
    } catch (error) {
      console.error('Failed to load todos from localStorage:', error);
      this.todos = [];
    }
  }

  updateTodo(id: number, title: string) {
    const trimmedTitle = title.trim(); // Clean the title using trim

    // Reject Blank Titles
    if (trimmedTitle === '') {
      return;
    }

    const todo = this.todos.find((todo) => todo.id === id); // Find the todo item in the todos array with the matching id

    if (todo) {
      todo.title = trimmedTitle; // If the todo item is found, update its title with the new title provided / changed from title into trimmedTitle
      this.saveTodos(); // Save the updated todos array to local storage after updating the title
    }
  }

  clearCompleted() {
    this.todos = this.todos.filter((todo) => !todo.completed); // Filter out the completed todos and keep only the active ones
    this.saveTodos(); // Save the updated todos array to local storage after clearing completed todos
  }
}
