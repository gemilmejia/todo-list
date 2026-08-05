import { Injectable } from '@angular/core';
import { Todo } from '../models/todo.model'; // 1 import the Todo interface to use it in this service

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  constructor() {}

  todos: Todo[] = []; // 2 Define a property to hold the list of todos

  // 3 We move and Define a method to add a new todo item to the list
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
  }

  deleteTodo(id: number) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
  }

  toggleCompleted(todo: Todo) {
    todo.completed = !todo.completed;
  }
}
