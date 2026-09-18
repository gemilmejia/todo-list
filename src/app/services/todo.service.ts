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
    if (task.trim() === '') {
      // remove whitespace from the task string and check if it's empty
      return;
    }

    // create a new Todo object using the Todo interface
    const newTodo: Todo = {
      id: Date.now(),
      title: task,
      completed: false,
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

    this.saveTodos(); // Save the updated todos array to local storage after toggling the completed status
  }

  // Save the current list of todos to local storage as a JSON string
  saveTodos() {
    localStorage.setItem(
      'todos', // "Key": The name of the item to store in local storage
      JSON.stringify(this.todos), // "Value": Convert the todos array to a JSON string
    );
  }

  // Load the list of todos from local storage and parse it back into an array of Todo objects
  loadTodos() {
    const savedTodos = localStorage.getItem('todos'); // Get the item from local storage with the key "todos"

    if (savedTodos) {
      // If the item exists in local storage (i.e., it's not null), parse the JSON string back into an array of Todo objects and assign it to the todos property
      this.todos = JSON.parse(savedTodos); // Convert the JSON string back into an array of Todo objects
    }
  }

  updateTodo(id: number, title: string) {
    const todo = this.todos.find((todo) => todo.id === id); // Find the todo item in the todos array with the matching id

    if (todo) {
      todo.title = title; // If the todo item is found, update its title with the new title provided
      this.saveTodos(); // Save the updated todos array to local storage after updating the title
    }
  }

  clearCompleted() {
    this.todos = this.todos.filter((todo) => !todo.completed); // Filter out the completed todos and keep only the active ones
    this.saveTodos(); // Save the updated todos array to local storage after clearing completed todos
  }
}
