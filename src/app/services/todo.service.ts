import { Injectable } from '@angular/core';
import { Todo } from '../models/todo.model'; // import the Todo interface to use it in this service

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  constructor() {}

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
  }

  // Toggle the completed status of a todo item
  toggleCompleted(todo: Todo) {
    todo.completed = !todo.completed;
  }

  // Save the current list of todos to local storage as a JSON string
  saveTodos() {
    localStorage.setItem(
      'todos', // "Key": The name of the item to store in local storage
      JSON.stringify(this.todos), // "Value": Convert the todos array to a JSON string
    );
  }
}
