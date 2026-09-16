import { Component } from '@angular/core';
import { Todo } from '../../models/todo.model';
import { TodoItemComponent } from '../todo-item/todo-item.component'; // Import the TodoItemComponent to use it within this component's template
import { TodoService } from '../../services/todo.service'; // Import the TodoService to use it within this component

@Component({
  selector: 'app-todo-list',
  imports: [TodoItemComponent], // Import the TodoItemComponent to use it within this component's template
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css',
})
export class TodoListComponent {
  constructor(private todoService: TodoService) {} // Inject the TodoService into the component's constructor to use its methods and properties (2) read: "Give this component access to TodoService."

  filter = 'all'; // Define a property to hold the current filter state (all, active, completed) (1) read: "The current filter is All".

  // "When someone asks me for todosFromService..." then // "Give them the todos from TodoService." //
  get todosFromService() {
    return this.todoService.todos;
  }

  // "When someone asks me for filteredTodos..." then // "Give them the todos from TodoService, filtered based on the current filter state." //
  get filteredTodos() {
    // If the filter is set to 'completed', return only the todos that are completed
    if (this.filter === 'completed') {
      return this.todoService.todos.filter((todo) => todo.completed);
    }
    // If the filter is set to 'active', return only the todos that are not completed
    if (this.filter === 'active') {
      return this.todoService.todos.filter((todo) => !todo.completed);
    }
    // all other cases (including 'all') return all todos from the service
    return this.todoService.todos;
  }

  // "When someone asks me for activeTodoCount..." then // "Give them the count of todos from TodoService that are not completed." //
  // gets all your todos. then keeps only unfinished tasks. counts them. //
  get activeTodoCount() {
    return this.todoService.todos.filter((todo) => !todo.completed).length;
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

  updateTodo(data: { id: number; title: string }) {
    this.todoService.updateTodo(data.id, data.title); // Call the updateTodo method from the TodoService to update the title of the todo item with the specified id. This ensures that the change is reflected in the service's todos array and saved to local storage, maintaining consistency across the application. read: "Tell my TodoService to update this Todo's title." (5)
  }
}
