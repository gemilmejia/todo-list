import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Todo } from '../../models/todo.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo-item',
  imports: [FormsModule],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.css',
})
export class TodoItemComponent {
  isEditing = false; // "I'm not Editing and when we change this to true, the input field will be displayed and the user can edit the todo item. "
  editTitle = ''; // "This property will hold the updated title of the todo item when the user edits it. It will be bound to the input field in the template, allowing the user to modify the title."

  @Input() // Parent to child communication: This decorator allows the parent component to pass data (the individual todo item) to this child component. The parent component can bind its todo property to this input property, enabling the child component to access and display the details of the todo item.
  todo!: Todo; // Define an input property to receive the individual todo item from the parent component

  @Output()
  deleteClicked = new EventEmitter<number>(); // Define an output property to emit an event when the delete button is clicked. This allows the child component to communicate with the parent component and notify it that the delete action has been triggered for this specific todo item.

  @Output()
  completeClicked = new EventEmitter<number>(); // Define an output property to emit an event when the complete button is clicked. This allows the child component to communicate with the parent component and notify it that the complete action has been triggered for this specific todo item.

  startEditing() {
    this.editTitle = this.todo.title; // Set the editTitle property to the current title of the todo item when the edit button is clicked. This allows the input field to be pre-filled with the existing title, making it easier for the user to edit.
    this.isEditing = true; // Set the isEditing property to true when the edit button is clicked. This will trigger the display of the input field for editing the todo item.
    // console.log('Editing:', this.todo.title);
  }

  deleteTodo() {
    this.deleteClicked.emit(this.todo.id); // Emit the deleteClicked event with the id of the todo item when the delete button is clicked. This allows the parent component to handle the deletion of the todo item based on its id. or simply: "Parent, delete the todo with this ID."
  }

  completeTodo() {
    this.completeClicked.emit(this.todo.id); // Emit the completeClicked event with the id of the todo item when the complete button is clicked. This allows the parent component to handle the completion of the todo item based on its id.
  }

  cancelEditing() {
    this.isEditing = false; // Set the isEditing property to false when the cancel button is clicked. This will hide the input field and revert back to displaying the todo item without any changes.
  }

  saveEditing() {
    this.todo.title = this.editTitle; // Update the title of the todo item with the value from the editTitle property when the save button is clicked. This allows the user to save their changes to the todo item.
    this.isEditing = false; // Set the isEditing property to false when the save button is clicked. This will hide the input field and revert back to displaying the updated todo item.
  }
}
