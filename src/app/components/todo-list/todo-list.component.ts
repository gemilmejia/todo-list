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
    this.todoService.deleteTodo(id); // Call the deleteTodo method from the TodoService to remove the todo item from the service's todos array and update local storage. This ensures that the deletion is persistent and reflects in the overall application state. read: "Tell my TodoService to delete the Todo with this ID." (3)
  }

  completeTodo(id: number) {
    const todo = this.todos.find((todo) => todo.id === id); // Find the todo item with the specified id in the todos array

    // logic to toggle the completed status of the todo item
    if (todo) {
      // if we found it ...
      this.todoService.toggleCompleted(todo); // read: "Tell TodoService to toggle this Todo's completed status. This ensures that the change is reflected in the service's todos array and saved to local storage, maintaining consistency across the application. read: "Tell my TodoService to toggle this Todo's completed status." (4)
    }
  }
}
