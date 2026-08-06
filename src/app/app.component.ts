import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Todo } from './models/todo.model';
import { TodoService } from './services/todo.service'; // 2 import the TodoService to use its methods in this component
import { TodoInputComponent } from './components/todo-input/todo-input.component'; // import the TodoInputComponent to use it in this component

@Component({
  selector: 'app-root',
  // standalone: true,
  // imports: [RouterOutlet],
  imports: [FormsModule, TodoInputComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  task = '';

  get todos() {
    return this.todoService.todos;
  }

  constructor(private todoService: TodoService) {}

  addTask() {
    this.todoService.addTask(this.task);

    this.task = '';
  }

  deleteTodo(id: number) {
    this.todoService.deleteTodo(id);
  }

  toggleCompleted(todo: Todo) {
    this.todoService.toggleCompleted(todo);
  }

  onTaskAdded(task: string) {
    this.todoService.addTask(task);
  }
}
