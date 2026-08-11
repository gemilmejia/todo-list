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

  @Output()
  taskAdded = new EventEmitter<string>();

  addTask() {
    this.taskAdded.emit(this.task); // Emit the taskAdded event with the current task value

    this.task = ''; // Clear the input field after emitting the event
  }
}
