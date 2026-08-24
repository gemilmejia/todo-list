import { Component } from '@angular/core';
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

  // "When someone asks me for todosFromService..." then // "Give them the todos from TodoService." //
  get todosFromService() {
    return this.todoService.todos;
  }

  deleteTodo(id: number) {
    this.todoService.deleteTodo(id); // Call the deleteTodo method from the TodoService to remove the todo item from the service's todos array and update local storage. This ensures that the deletion is persistent and reflects in the overall application state. read: "Tell my TodoService to delete the Todo with this ID." (3)
  }

  completeTodo(id: number) {
    const todo = this.todoService.todos.find((todo) => todo.id === id); // Find the todo item with the specified id in the todos array

    // logic to toggle the completed status of the todo item
    if (todo) {
      // if we found it ...
      this.todoService.toggleCompleted(todo); // read: "Tell TodoService to toggle this Todo's completed status. This ensures that the change is reflected in the service's todos array and saved to local storage, maintaining consistency across the application. read: "Tell my TodoService to toggle this Todo's completed status." (4)
    }
  }
}
