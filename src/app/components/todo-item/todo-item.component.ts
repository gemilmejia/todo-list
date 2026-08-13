import { Component, Input } from '@angular/core';
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
}
