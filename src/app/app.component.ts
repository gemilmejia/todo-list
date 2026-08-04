import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Todo } from './models/todo.model';
import { TodoService } from './services/todo.service'; // 2 import the TodoService to use its methods in this component
@Component({
  selector: 'app-root',
  // standalone: true,
  // imports: [RouterOutlet],
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  // Define a property to hold the task input value
  task = '';

  // Define a property to hold the list of todos
  todos: Todo[] = [];

  constructor(private todoService: TodoService) {} // 3 Constructor injection of the TodoService to use its methods in this component

  // Define a method to add a new todo item to the list
  addTask() {
    if (this.task.trim() === '') {
      // remove whitespace from the task string and check if it's empty
      return;
    }

    // create a new Todo object using the Todo interface
    const newTodo: Todo = {
      id: Date.now(),
      title: this.task,
      completed: false,
    };
    // add the new Todo object to the todos array
    this.todos.push(newTodo);
    this.task = '';
  }

  // Delete a todo item from the list based on its id
  deleteTodo(id: number) {
    this.todos = this.todos.filter((todo) => todo.id !== id); // mean this.todo(means the current todo) = this.todos.filter(means the current todos array).filter(means filter the todos array and return a new array that only includes the todos that do not have the same id as the one passed in as an argument)
  }

  toggleCompleted(todo: Todo) {
    todo.completed = !todo.completed; // The completed status of this todo Replace it with The ! means NOT.
  }
}
