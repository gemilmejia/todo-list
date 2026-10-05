import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Todo } from '../../models/todo.model';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo-item',
  imports: [FormsModule, DatePipe],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.css',
})
export class TodoItemComponent {
  @ViewChild('editInput') // This decorator allows us to access the input element in the template using a reference variable. It enables us to programmatically focus on the input field when the user starts editing a todo item.
  editInput!: ElementRef<HTMLInputElement>; // This property will hold a reference to the input element in the template. The ElementRef type is used to access the native DOM element, allowing us to manipulate it directly (e.g., focusing on it).

  isEditing = false; // "I'm not Editing and when we change this to true, the input field will be displayed and the user can edit the todo item. "
  editTitle = ''; // "This property will hold the updated title of the todo item when the user edits it. It will be bound to the input field in the template, allowing the user to modify the title."
  editError = ''; // "This property will hold any error message related to editing the todo item. If the user tries to save an empty title, this property will be set to an appropriate error message, which can be displayed in the template to inform the user about the issue."

  @Input() // Parent to child communication: This decorator allows the parent component to pass data (the individual todo item) to this child component. The parent component can bind its todo property to this input property, enabling the child component to access and display the details of the todo item.
  todo!: Todo; // Define an input property to receive the individual todo item from the parent component

  @Output()
  deleteClicked = new EventEmitter<number>(); // Define an output property to emit an event when the delete button is clicked. This allows the child component to communicate with the parent component and notify it that the delete action has been triggered for this specific todo item.

  @Output()
  completeClicked = new EventEmitter<number>(); // Define an output property to emit an event when the complete button is clicked. This allows the child component to communicate with the parent component and notify it that the complete action has been triggered for this specific todo item.

  @Output()
  editSaved = new EventEmitter<{ id: number; title: string }>(); // Define an output property to emit an event when the save button is clicked after editing. This allows the child component to communicate with the parent component and notify it that the edit action has been completed for this specific todo item, along with the updated title. in simply: "Parent, update the todo with this ID and new title."

  startEditing() {
    this.editTitle = this.todo.title; // Set the editTitle property to the current title of the todo item when the edit button is clicked. This allows the input field to be pre-filled with the existing title, making it easier for the user to edit.
    this.isEditing = true; // Set the isEditing property to true when the edit button is clicked. This will trigger the display of the input field for editing the todo item.
    // console.log('Editing:', this.todo.title);

    setTimeout(() => {
      this.editInput?.nativeElement.focus(); // Focus on the input field after a short delay to ensure that the input element is rendered and available in the DOM. This improves the user experience by allowing them to start typing immediately without having to click on the input field.
      this.editInput?.nativeElement.select(); // Typing immediately replaces the text.
    });
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
    // remove whitespace from the editTitle string and check if it's empty
    if (this.editTitle.trim() === '') {
      this.editError = 'Task title cannot be empty.';
      return; // If the editTitle is empty after trimming, we don't proceed with saving the changes. This prevents saving an empty title for the todo item.
    }

    this.editError = ''; // Reset the editError property to an empty string when the save button is clicked. This ensures that any previous error messages are cleared when the user attempts to save the changes again.

    this.editSaved.emit({ id: this.todo.id, title: this.editTitle }); //

    this.isEditing = false; // Set the isEditing property to false when the save button is clicked. This will hide the input field and revert back to displaying the updated todo item.
  }

  getCompletedTimeText(): string {
    if (!this.todo.completedAt) {
      return '';
    }

    const completedTime = new Date(this.todo.completedAt).getTime();

    // Invalid timestamp check: If the completedAt property is not a valid date string, the getTime() method will return NaN. In that case, we return an empty string to avoid displaying incorrect information.
    if (isNaN(completedTime)) {
      return '';
    }

    const currentTime = Date.now();

    const difference = currentTime - completedTime;

    // Future timestamp check: If the completedAt property is set to a future date (which should not happen in normal circumstances), the difference will be negative. In that case, we return a message indicating that the todo was completed just now.
    if (difference < 0) {
      return 'Completed just now';
    }

    const minutes = Math.floor(difference / (60 * 1000));

    // Check if the completed time is less than 1 minute//
    if (minutes < 1) {
      return 'Completed just now';
    }

    if (minutes < 60) {
      return `Completed ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `Completed ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `Completed ${days} ${days === 1 ? 'day' : 'days'} ago`;
    }

    const weeks = Math.floor(days / 7);

    return `Completed ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
}
