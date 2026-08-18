import { Component, Input } from '@angular/core';
import { Todo } from '../../models/todo.model';
import { TodoItemComponent } from '../todo-item/todo-item.component'; // Import the TodoItemComponent to use it within this component's template
import { TodoService } from '../../services/todo.service'; // Import the TodoService to use it within this component (1)

@Component({
  selector: 'app-todo-list',
  imports: [TodoItemComponent], // Import the TodoItemComponent to use it within this component's template
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css',
})
export class TodoListComponent {
  constructor(private todoService: TodoService) {} // Inject the TodoService into the component's constructor to use its methods and properties (2) read: "Give this component access to TodoService."

  @Input() // Parent to child communication: This decorator allows the parent component to pass data (the list of todos) to this child component. The parent component can bind its todos property to this input property, enabling the child component to access and display the list of todos.
  todos: Todo[] = []; // Define an input property to receive the list of todos from the parent component

  deleteTodo(id: number) {
    this.todos = this.todos.filter((todo) => todo.id !== id); // Filter out the todo item with the specified id from the todos array. This effectively removes the todo item from the list when the delete button is clicked in the child component amd not delete permanently from the database. This is a temporary deletion that only affects the local state of the component.
  }

  completeTodo(id: number) {
    const todo = this.todos.find((todo) => todo.id === id); // Find the todo item with the specified id in the todos array

    if (todo) {
      todo.completed = !todo.completed; // Toggle the completed status of the found todo item. If it was previously marked as completed, it will now be marked as not completed, and vice versa. or simply: "Change completed to the opposite of what it currently is."
    }
  }
}
