import { Component, Input } from '@angular/core';
import { Todo } from '../../models/todo.model';
import { TodoItemComponent } from '../todo-item/todo-item.component'; // Import the TodoItemComponent to use it within this component's template

@Component({
  selector: 'app-todo-list',
  imports: [TodoItemComponent], // Import the TodoItemComponent to use it within this component's template
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css',
})
export class TodoListComponent {
  @Input() // Parent to child communication: This decorator allows the parent component to pass data (the list of todos) to this child component. The parent component can bind its todos property to this input property, enabling the child component to access and display the list of todos.
  todos: Todo[] = []; // Define an input property to receive the list of todos from the parent component

  deleteTodo(id: number) {
    this.todos = this.todos.filter((todo) => todo.id !== id); // Filter out the todo item with the specified id from the todos array. This effectively removes the todo item from the list when the delete button is clicked in the child component amd not delete permanently from the database. This is a temporary deletion that only affects the local state of the component.
  }
}
