import { Component, OnInit } from '@angular/core';
import { TodoItemComponent } from '../todo-item/todo-item.component'; // Import the TodoItemComponent to use it within this component's template
import { ApiErrorComponent } from '../api-error/api-error.component'; // Import the ApiErrorComponent to use it within this component's template
import { FormsModule } from '@angular/forms'; // Import the FormsModule to use two-way data binding with ngModel in the template
import { TodoService } from '../../services/todo.service'; // Import the TodoService to use it within this component
import { Todo } from '../../models/todo.model'; // Import the Todo interface to use it within this component
import type { TodoSortOrder } from '../../models/todo-sort-order.type'; // Import the TodoSortOrder type to use it within this component
import {
  isTodoSortOrder,
  TODO_SORT_OPTIONS,
} from '../../models/todo-sort-order.type';
import { ApiError } from '../../models/api-error.model'; // Import the ApiError interface to use it within this component
import { finalize } from 'rxjs'; // this is for .pipe()
import { filterTodos, type TodoFilter } from '../../utils/todo-filter.util';
import { processTodos } from '../../utils/todo-pipeline.util';

@Component({
  selector: 'app-todo-list',
  imports: [TodoItemComponent, ApiErrorComponent, FormsModule], // Import the necessary components and modules to use them within this component's template
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css',
})
export class TodoListComponent implements OnInit {
  constructor(private todoService: TodoService) {} // Inject the TodoService into the component's constructor to use its methods and properties (2) read: "Give this component access to TodoService."

  ngOnInit() {
    this.loadSortOrder();

    this.todoService.getStatus().subscribe({
      next: (message) => {
        console.log(message);
      },
      complete: () => {
        console.log('Todo status stream completed');
      },
    });

    this.todoService.getStatusWithError().subscribe({
      next: (message) => {
        console.log(message);
      },
      error: (error) => {
        console.error('Todo status stream failed:', error);
      },
    });

    this.loadApiTodos();
  }

  loadApiTodos(): void {
    console.log('loadApiTodos() called. Loading:', this.isApiLoading);

    // Guard clause to prevent multiple simultaneous API requests. If an API request is already in progress (isApiLoading is true), we return early to avoid making another request. This helps prevent duplicate requests and potential race conditions.
    if (this.isApiLoading) {
      // console.log('Duplicate API request prevented.'); // test: "Log a message to the console indicating that a duplicate API request was prevented."
      return; // Prevent multiple simultaneous API requests by checking if a request is already in progress. If isApiLoading is true, it means an API request is currently being processed, so we return early to avoid making another request.
    }

    this.isApiLoading = true; // show the loading spinner while the API request is in progress
    // this.apiError = null; // Clear any previous API error before making a new request

    this.todoService
      .getTodosFromApi()
      .pipe(
        finalize(() => {
          this.isApiLoading = false;
        }),
      )
      .subscribe({
        next: (apiTodos) => {
          console.log('Todos received from API:', apiTodos);

          this.apiTodos = apiTodos; // change from apiTodos to [] for testing the loading spinner and error handling.
          this.hasLoadedApiTodos = true; // Set the flag to true to indicate that API todos have been loaded
          this.apiError = null; // Clear any previous API error when the request is successful
        },

        error: (error: ApiError) => {
          console.error('Failed to load todos from API:', error);
          // Set the error message to display in the template
          this.apiError = error;
        },
        // complete: () => {
        //   console.log('API request completed.');

        //   this.isApiLoading = false;
        // },
      });
  }

  // State properties //
  filter: TodoFilter = 'all'; // Define a property to hold thse current filter state (all, active, completed) (1) read: "The current filter is All".
  searchTerm = ''; // Define a property to hold the current search term for filtering todos by title (1) read: "The current search term is empty".
  sortOrder: TodoSortOrder = 'default'; // Define a property to hold the current sort order for sorting todos by title (1) read: "The current sort order is default".
  readonly sortOptions = TODO_SORT_OPTIONS; // Define a readonly property to hold the available sort options for the dropdown menu in the template (1) read: "The available sort options are Default order, Title: A–Z, Title: Z–A, Active Tasks First, Completed Tasks First".
  isApiLoading = false; // Tracks whether an API request is in progress.
  apiError: ApiError | null = null; // Stores a structured API error, or null if no error exists.
  apiTodos: Todo[] = []; // Stores the API Todos as an array of Todo objects.
  hasLoadedApiTodos = false; // Tracks whether at least one API request has succeeded.

  // "When someone asks me for filteredTodos..." then // "Give them the todos from TodoService, filtered based on the current filter state." //
  get filteredTodos(): Todo[] {
    return processTodos(this.todoService.getTodos(), {
      filter: this.filter,
      searchTerm: this.searchTerm,
      sortOrder: this.sortOrder,
    });
  }

  // "When someone asks me for activeTodoCount..." then // "Give them the count of todos from TodoService that are not completed." //
  // gets all your todos. then keeps only unfinished tasks. counts them. //
  get activeTodoCount() {
    return this.todoService.getTodos().filter((todo) => !todo.completed).length;
  }

  get apiTodoCount(): number {
    return this.apiTodos.length;
  }

  // "When someone asks me for completedTodoCount..." then // "Give them the count of todos from TodoService that are completed." //
  get completedTodoCount() {
    return this.todoService.getTodos().filter((todo) => todo.completed).length;
  }

  // "When someone asks me for totalTodoCount..." then // "Give them the total count of todos from TodoService." //
  get totalTodoCount() {
    return this.todoService.getTodos().length;
  }

  // "When someone asks me for completionPercentage..." then // "Give them the percentage of completed todos from TodoService." //
  get completionPercentage() {
    if (this.totalTodoCount === 0) {
      return 0;
    }

    return Math.round((this.completedTodoCount / this.totalTodoCount) * 100);
  }

  deleteTodo(id: number) {
    this.todoService.deleteTodo(id); // Call the deleteTodo method from the TodoService to remove the todo item from the service's todos array and update local storage. This ensures that the deletion is persistent and reflects in the overall application state. read: "Tell my TodoService to delete the Todo with this ID." (3)
  }

  completeTodo(id: number) {
    const todo = this.todoService.getTodos().find((todo) => todo.id === id);

    if (todo) {
      this.todoService.toggleCompleted(todo);
    }
  }

  updateTodo(data: { id: number; title: string }) {
    this.todoService.updateTodo(data.id, data.title); // Call the updateTodo method from the TodoService to update the title of the todo item with the specified id. This ensures that the change is reflected in the service's todos array and saved to local storage, maintaining consistency across the application. read: "Tell my TodoService to update this Todo's title." (5)
  }

  clearCompleted() {
    // Prompt the user for confirmation before clearing completed tasks to prevent accidental deletion of completed todos. This is a safety measure to ensure that users do not lose their completed tasks unintentionally. //
    // The confirmation message dynamically includes the count of completed tasks to provide context to the user about the action they are about to take. //
    const confirmed = confirm(
      `Are you sure you want to clear ${this.completedTodoCount} completed ${this.completedTodoCount === 1 ? 'task' : 'tasks'}?`,
    );

    // If the user confirms the action, call the clearCompleted method from the TodoService to remove all completed todo items from the service's todos array and update local storage. This ensures that the clearing of completed tasks is persistent and reflects in the overall application state. //
    if (confirmed) {
      this.todoService.clearCompleted(); // Call the clearCompleted method from the TodoService to remove all completed todo items from the service's todos array and update local storage. This ensures that the clearing of completed tasks is persistent and reflects in the overall application state. read: "Tell my TodoService to clear all completed Todos." (6)
    }
  }

  saveSortOrder(): void {
    localStorage.setItem('todoSortOrder', this.sortOrder);
  }

  resetSortOrder(): void {
    this.sortOrder = 'default';
    this.saveSortOrder();
  }

  loadSortOrder(): void {
    const savedSortOrder = localStorage.getItem('todoSortOrder');

    if (isTodoSortOrder(savedSortOrder)) {
      this.sortOrder = savedSortOrder;
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
  }
}
