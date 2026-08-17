import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-item',
  imports: [],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.css',
})
export class TodoItemComponent {
  @Input() // Parent to child communication: This decorator allows the parent component to pass data (the individual todo item) to this child component. The parent component can bind its todo property to this input property, enabling the child component to access and display the details of the todo item.
  todo!: Todo; // Define an input property to receive the individual todo item from the parent component

  @Output()
  deleteClicked = new EventEmitter<number>(); // Define an output property to emit an event when the delete button is clicked. This allows the child component to communicate with the parent component and notify it that the delete action has been triggered for this specific todo item.

  @Output()
  completeClicked = new EventEmitter<number>(); // Define an output property to emit an event when the complete button is clicked. This allows the child component to communicate with the parent component and notify it that the complete action has been triggered for this specific todo item.

  deleteTodo() {
    this.deleteClicked.emit(this.todo.id); // Emit the deleteClicked event with the id of the todo item when the delete button is clicked. This allows the parent component to handle the deletion of the todo item based on its id. or simply: "Parent, delete the todo with this ID."
  }

  completeTodo() {
    this.completeClicked.emit(this.todo.id); // Emit the completeClicked event with the id of the todo item when the complete button is clicked. This allows the parent component to handle the completion of the todo item based on its id.
  }
}
