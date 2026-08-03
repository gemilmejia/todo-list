import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Todo } from './models/todo.model'; // 2

@Component({
  selector: 'app-root',
  // standalone: true,
  // imports: [RouterOutlet],
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  task = '';

  todos: Todo[] = []; // 3

  addTask() {
    if (this.task.trim() === '') {
      // remove whitespace from the task string and check if it's empty
      return;
    }

    // 4 - create a new Todo object using the Todo interface
    const newTodo: Todo = {
      id: Date.now(), // generate a unique id based on the current timestamp
      title: this.task,
      completed: false,
    };

    this.todos.push(newTodo); // 5 - add the new Todo object to the todos array
    this.task = '';
  }
}
