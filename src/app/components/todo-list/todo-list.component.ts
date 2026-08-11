import { Component, Input } from '@angular/core';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-list',
  imports: [],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css',
})
export class TodoListComponent {
  @Input() // Parent to child communication: This decorator allows the parent component to pass data (the list of todos) to this child component. The parent component can bind its todos property to this input property, enabling the child component to access and display the list of todos.
  todos: Todo[] = []; // Define an input property to receive the list of todos from the parent component
}
