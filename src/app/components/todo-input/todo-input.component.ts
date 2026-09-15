import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo-input',
  imports: [FormsModule],
  templateUrl: './todo-input.component.html',
  styleUrl: './todo-input.component.css',
})
export class TodoInputComponent {
  task = '';

  errorMessage = '';

  @Output()
  taskAdded = new EventEmitter<string>();

  addTask() {
    if (this.task.trim() === '') {
      this.errorMessage = 'Please enter a task.';
      return;
    }

    this.errorMessage = ''; // removes the previous error.

    this.taskAdded.emit(this.task); // Emit the taskAdded event with the current task value

    this.task = ''; // Clear the input field after emitting the event
  }

  clearError() {
    this.errorMessage = ''; // Clear the error message when the user starts typing
  }
}
