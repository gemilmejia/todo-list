import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TodoListComponent } from './todo-list.component';
import { TodoItemComponent } from '../todo-item/todo-item.component';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { TodoService } from '../../services/todo.service';
import { createMockTodo } from '../../testing/todo-test.factory';
import type { Todo } from '../../models/todo.model';

describe('TodoListComponent', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;

  beforeEach(async () => {
    // Lesson 158 - Test isolation:
    // Remove the saved sorting preference so each test
    // starts without a sorting choice from another test.
    localStorage.removeItem('todoSortOrder');

    await TestBed.configureTestingModule({
      imports: [TodoListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // 1. Component creation.
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // 2. Parent completion delegation.
  // Lesson 148 - Part 4A: Test parent completion handling
  it('should delegate Todo completion to TodoService', () => {
    // Arrange: Create a Todo.
    const mockTodo: Todo = createMockTodo({
      id: 202,
      title: 'Practice Parent Child Testing',
      completed: false,
    });

    // Retrieve the same TodoService instance used by the parent.
    const todoService = TestBed.inject(TodoService);

    // Control the Todo list returned by the service.
    spyOn(todoService, 'getTodos').and.returnValue([mockTodo]);

    // Observe the method that changes completion status.
    const toggleSpy = spyOn(todoService, 'toggleCompleted');

    // Act: Call the parent's completion handler.
    component.completeTodo(202);

    // Assert: The service receives the correct Todo object.
    expect(toggleSpy).toHaveBeenCalledOnceWith(mockTodo);
  });

  // 3. Child-to-parent completion interaction.
  // Lesson 148 - Part 4B: Child-to-parent completion interaction
  it('should forward a child Complete button click to TodoService', () => {
    // Arrange: Create an active Todo.
    const mockTodo: Todo = createMockTodo({
      id: 404,
      title: 'Test Parent Child Communication',
      completed: false,
    });

    // Retrieve the actual service injected into TodoListComponent.
    const todoService = TestBed.inject(TodoService);

    // Supply predictable Todo data.
    spyOn(todoService, 'getTodos').and.returnValue([mockTodo]);

    // Observe the service completion action.
    const toggleSpy = spyOn(todoService, 'toggleCompleted');

    // Refresh the parent template to render the mock Todo.
    fixture.detectChanges();

    // Find the actual child component's Complete button.
    const completeButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector(
        'app-todo-item button[aria-label="Mark task as completed"]',
      );

    // Verify the child button was rendered.
    expect(completeButton).not.toBeNull();

    // Act: Click the button in the child component.
    completeButton!.click();

    // Assert: The parent forwards the correct Todo to the service.
    expect(toggleSpy).toHaveBeenCalledOnceWith(mockTodo);
  });

  // 4. Jasmine
  // Lesson 150 - Part 1: Test parent Todo editing handler
  it('should delegate an edited Todo title to TodoService', () => {
    // Arrange: Retrieve the service used by TodoListComponent.
    const todoService = TestBed.inject(TodoService);

    // Spy on the service update method.
    const updateSpy = spyOn(todoService, 'updateTodo');

    // Create a mock edit event payload.
    const editedTodo = {
      id: 505,
      title: 'Practice Angular Integration Testing',
    };

    // Act: Call the actual parent editing handler.
    component.updateTodo(editedTodo);

    // Assert: The correct ID and title reach TodoService.
    expect(updateSpy).toHaveBeenCalledOnceWith(
      505,
      'Practice Angular Integration Testing',
    );
  });

  // 5. Jasmine
  // Lesson 150 - Part 2: Test child editSaved event binding
  it('should forward the child editSaved event to TodoService', () => {
    // Arrange: Create an active Todo.
    const mockTodo: Todo = createMockTodo({
      id: 505,
      title: 'Original Angular Task',
      completed: false,
    });

    // Retrieve the service injected into the parent.
    const todoService = TestBed.inject(TodoService);

    // Return predictable Todo data.
    spyOn(todoService, 'getTodos').and.returnValue([mockTodo]);

    // Observe service update calls.
    const updateSpy = spyOn(todoService, 'updateTodo');

    // Render the mock Todo inside TodoListComponent.
    fixture.detectChanges();

    // Locate the real TodoItemComponent instance.
    const childDebugElement = fixture.debugElement.query(
      By.directive(TodoItemComponent),
    );

    expect(childDebugElement).not.toBeNull();

    const childComponent =
      childDebugElement.componentInstance as TodoItemComponent;

    // Act: Emit the child's actual output event.
    childComponent.editSaved.emit({
      id: 505,
      title: 'Updated Angular Task',
    });

    // Assert: Parent forwards the correct arguments to TodoService.
    expect(updateSpy).toHaveBeenCalledOnceWith(505, 'Updated Angular Task');
  });

  // 6. Jasmine
  // Lesson 150 - Part 3: Test actual parent-child Edit -> Save interaction
  it('should update TodoService when a child Todo is edited and saved', async () => {
    // Arrange: Create a mock Todo.
    const mockTodo: Todo = createMockTodo({
      id: 606,
      title: 'Original Angular Task',
      completed: false,
    });

    // Retrieve the service injected into TodoListComponent.
    const todoService = TestBed.inject(TodoService);

    // Provide predictable Todo data.
    spyOn(todoService, 'getTodos').and.returnValue([mockTodo]);

    // Observe the service's update method.
    const updateSpy = spyOn(todoService, 'updateTodo');

    // Render the mock Todo through the parent template.
    fixture.detectChanges();

    // Find the child component's real Edit button.
    const editButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector(
        'app-todo-item button[aria-label="Edit task"]',
      );

    expect(editButton).not.toBeNull();

    // Act: Click Edit.
    editButton!.click();

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Find the editing input rendered by the child.
    const editInput: HTMLInputElement | null =
      fixture.nativeElement.querySelector(
        'app-todo-item input[aria-label="Edit task title"]',
      );

    expect(editInput).not.toBeNull();

    // Simulate typing the new title.
    editInput!.value = 'Updated Angular Integration Test';
    editInput!.dispatchEvent(new Event('input'));

    // Synchronize ngModel and the DOM.
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Find the child component's Save button.
    const saveButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector(
        'app-todo-item button[aria-label="Saved edited task."]',
      );

    expect(saveButton).not.toBeNull();
    expect(saveButton!.disabled).toBeFalse();

    // Act: Click Save.
    saveButton!.click();

    // Assert: The service receives the edited ID and title.
    expect(updateSpy).toHaveBeenCalledOnceWith(
      606,
      'Updated Angular Integration Test',
    );
  });

  // 7. Jasmine
  // Lesson 150 - Part 4: Test canceling an edit through the parent
  it('should not update TodoService when a child edit is canceled', async () => {
    // Arrange: Create a mock Todo.
    const mockTodo: Todo = createMockTodo({
      id: 707,
      title: 'Study Angular',
      completed: false,
    });

    // Retrieve the service used by TodoListComponent.
    const todoService = TestBed.inject(TodoService);

    // Provide predictable Todo data.
    spyOn(todoService, 'getTodos').and.returnValue([mockTodo]);

    // Observe any attempts to update a Todo.
    const updateSpy = spyOn(todoService, 'updateTodo');

    // Render the child through the parent template.
    fixture.detectChanges();

    // Find the real Edit button.
    const editButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector(
        'app-todo-item button[aria-label="Edit task"]',
      );

    expect(editButton).not.toBeNull();

    // Act: Open editing mode.
    editButton!.click();

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Find the child's editing input.
    const editInput: HTMLInputElement | null =
      fixture.nativeElement.querySelector(
        'app-todo-item input[aria-label="Edit task title"]',
      );

    expect(editInput).not.toBeNull();

    // Simulate entering an unsaved title.
    editInput!.value = 'Updated TypeScript Task';
    editInput!.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Verify the new title reached the child component.
    const childDebugElement = fixture.debugElement.query(
      By.directive(TodoItemComponent),
    );

    const childComponent =
      childDebugElement.componentInstance as TodoItemComponent;

    expect(childComponent.editTitle).toBe('Updated TypeScript Task');

    // Find the real Cancel button.
    const cancelButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector(
        'app-todo-item button[aria-label="Cancel editing task."]',
      );

    expect(cancelButton).not.toBeNull();

    // Act: Cancel the edit.
    cancelButton!.click();

    fixture.detectChanges();

    // Assert: Editing mode is closed.
    expect(childComponent.isEditing).toBeFalse();

    // Assert: No update was requested from TodoService.
    expect(updateSpy).not.toHaveBeenCalled();

    // Assert: The original Todo title was preserved.
    expect(mockTodo.title).toBe('Study Angular');

    // Assert: The edit input is removed.
    const hiddenInput: HTMLInputElement | null =
      fixture.nativeElement.querySelector(
        'app-todo-item input[aria-label="Edit task title"]',
      );

    expect(hiddenInput).toBeNull();

    // Assert: The original title remains visible.
    const todoTitle: HTMLElement | null = fixture.nativeElement.querySelector(
      'app-todo-item .todo-title',
    );

    expect(todoTitle?.textContent?.trim()).toBe('Study Angular');
  });

  // 8. Jasmine
  // Lesson 151 - Part 1: Test parent Todo deletion handler
  it('should delegate Todo deletion to TodoService', () => {
    // Arrange: Retrieve the injected TodoService.
    // A. Retrieve the service
    const todoService = TestBed.inject(TodoService);

    // Spy on the service's delete method.
    // B. Create a Jasmine spy
    const deleteSpy = spyOn(todoService, 'deleteTodo');

    // Act: Request deletion of Todo ID 808.
    // C. Call the parent handler
    component.deleteTodo(808);

    // D. Verify the service call
    // Assert: Verify the correct ID is forwarded.
    expect(deleteSpy).toHaveBeenCalledOnceWith(808);
  });

  // 9. Jasmine
  // Lesson 151 - Part 2: Test child deleteClicked event binding
  it('should forward the child deleteClicked event to TodoService', () => {
    // Arrange: Create a mock Todo.
    const mockTodo: Todo = createMockTodo({
      id: 909,
      title: 'Practice Angular Deletion Testing',
      completed: false,
    });

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // 1. Stub the service's Todo list
    // Return predictable Todo data to the parent component.
    spyOn(todoService, 'getTodos').and.returnValue([mockTodo]);

    // Observe calls to the service deletion method.
    const deleteSpy = spyOn(todoService, 'deleteTodo');

    // Render the mock Todo through the parent template.
    fixture.detectChanges();

    // 2. Locate the child component
    // Find the real child component.
    const childDebugElement = fixture.debugElement.query(
      By.directive(TodoItemComponent),
    );

    expect(childDebugElement).not.toBeNull();

    // Access the rendered child component instance.
    const childComponent =
      childDebugElement.componentInstance as TodoItemComponent;
    // 3. Emit the event
    // Act: Emit the actual child output event.
    childComponent.deleteClicked.emit(909);

    // 4. Verify the service call
    // Assert: The parent forwards the correct ID to TodoService.
    expect(deleteSpy).toHaveBeenCalledOnceWith(909);
  });

  // 10. Jasmine
  // Lesson 151 - Part 3: Test the actual Delete button
  it('should delete the correct Todo when the child Delete button is clicked', () => {
    // Arrange: Create predictable Todo data.
    const mockTodo: Todo = createMockTodo({
      id: 1010,
      title: 'Practice Angular Deletion',
      completed: false,
    });

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    /// This ensures the parent renders a Todo with ID 1010.
    // Provide our mock Todo to the parent component.
    spyOn(todoService, 'getTodos').and.returnValue([mockTodo]);

    // Spy on the service deletion method.
    const deleteSpy = spyOn(todoService, 'deleteTodo');

    // Render the Todo through TodoListComponent.
    fixture.detectChanges();

    /// Next, we locate the actual button: We're specifically looking for the Delete button inside a child app-todo-item element.
    // Find the actual Delete button inside TodoItemComponent.
    const deleteButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector(
        'app-todo-item button[aria-label="Delete task"]',
      );

    // Verify the button exists.
    expect(deleteButton).not.toBeNull();

    /// Then, we simulate the click:
    // Act: Simulate clicking the Delete button.
    deleteButton!.click();

    /// This verifies the service receives the correct ID exactly once.
    // Assert: The service receives the correct Todo ID.
    expect(deleteSpy).toHaveBeenCalledOnceWith(1010);
  });

  // 11. Jasmine
  // Lesson 151 - Part 4: Verify the selected Todo ID
  it('should delete only the selected Todo when multiple Todos are rendered', () => {
    // Arrange: Create three different Todos.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 1101,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 1102,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 1103,
        title: 'Review Jasmine Tests',
        completed: false,
      }),
    ];

    // Retrieve the injected service.
    const todoService = TestBed.inject(TodoService);

    // Return three predictable Todos.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    // Observe deletion requests.
    const deleteSpy = spyOn(todoService, 'deleteTodo');

    // Render the Todos through the parent template.
    fixture.detectChanges();

    /// Testing multiple child components
    // Find every rendered child Todo component.
    const todoItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-todo-item'),
    );

    /// We expect three:
    // Verify that three Todos are displayed.
    expect(todoItems.length).toBe(3);

    // Confirm that the second Todo is our intended target.
    const secondTodoTitle: HTMLElement | null =
      todoItems[1].querySelector('.todo-title');

    expect(secondTodoTitle?.textContent?.trim()).toBe('Practice TypeScript');

    // Find the Delete button in the SECOND Todo only.
    const deleteButton: HTMLButtonElement | null = todoItems[1].querySelector(
      'button[aria-label="Delete task"]',
    );

    expect(deleteButton).not.toBeNull();

    // Act: Click Delete on the second Todo.
    deleteButton!.click();

    // Assert: Exactly one deletion request was made.
    expect(deleteSpy).toHaveBeenCalledTimes(1);

    // Assert: The selected Todo ID was forwarded.
    expect(deleteSpy).toHaveBeenCalledWith(1102);

    // Assert: The first and third IDs were not targeted.
    expect(deleteSpy).not.toHaveBeenCalledWith(1101);
    expect(deleteSpy).not.toHaveBeenCalledWith(1103);
  });

  // 12. Jasmine
  // Lesson 152 - Part 1: All filter displays every Todo
  it('should display all Todos when the All filter is selected', () => {
    // Arrange: Create three mock Todos.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 1201,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 1202,
        title: 'Practice TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 1203,
        title: 'Review Jasmine Tests',
        completed: false,
      }),
    ];

    // Retrieve TodoService.
    const todoService = TestBed.inject(TodoService);

    // Return predictable test data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    // Act: Select the All filter.
    component.filter = 'all';

    // Update the rendered HTML.
    fixture.detectChanges();

    // Find all displayed Todo items.
    const todoItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-todo-item'),
    );

    // Assert: All three Todos are visible.
    expect(todoItems.length).toBe(3);

    // Verify the displayed titles.
    const displayedTitles = todoItems.map((item) =>
      item.querySelector('.todo-title')?.textContent?.trim(),
    );

    expect(displayedTitles).toEqual([
      'Study Angular',
      'Practice TypeScript',
      'Review Jasmine Tests',
    ]);

    // Assert: Filtering does not modify the source data.
    expect(mockTodos.length).toBe(3);
  });

  // 13. Jasmine
  // Lesson 152 - Part 2: Active filter displays unfinished Todos
  it('should display only active Todos when the Active filter is selected', () => {
    // Arrange: Create three Todos with different completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 1201,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 1202,
        title: 'Practice TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 1203,
        title: 'Review Jasmine Tests',
        completed: false,
      }),
    ];

    // Retrieve the service.
    const todoService = TestBed.inject(TodoService);

    // Return predictable Todo data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    // Act: Select the Active filter.
    component.filter = 'active';

    // Update the rendered HTML.
    fixture.detectChanges();

    // Find the visible Todo components.
    const todoItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-todo-item'),
    );

    // Assert: Only two active Todos are displayed.
    expect(todoItems.length).toBe(2);

    // Read the rendered Todo titles.
    const displayedTitles = todoItems.map((item) =>
      item.querySelector('.todo-title')?.textContent?.trim(),
    );

    // Assert: Only unfinished tasks are visible.
    expect(displayedTitles).toEqual(['Study Angular', 'Review Jasmine Tests']);

    // Assert: The completed task is hidden.
    expect(displayedTitles).not.toContain('Practice TypeScript');

    // Assert: The original Todo data is unchanged.
    expect(mockTodos.length).toBe(3);
    expect(mockTodos[1].completed).toBeTrue();
  });

  // 14. Jasmine
  // Lesson 152 - Part 3: Completed filter displays finished Todos
  it('should display only completed Todos when the Completed filter is selected', () => {
    // Arrange: Create three Todos with mixed completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 1201,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 1202,
        title: 'Practice TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 1203,
        title: 'Review Jasmine Tests',
        completed: false,
      }),
    ];

    // Retrieve the injected service.
    const todoService = TestBed.inject(TodoService);

    // Return predictable test data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    // Act: Select the Completed filter.
    component.filter = 'completed';

    // Update the rendered HTML.
    fixture.detectChanges();

    // Find the visible Todo components.
    const todoItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-todo-item'),
    );

    // Assert: Only one completed Todo is displayed.
    expect(todoItems.length).toBe(1);

    // Read the rendered Todo titles.
    const displayedTitles = todoItems.map((item) =>
      item.querySelector('.todo-title')?.textContent?.trim(),
    );

    // Assert: Only the completed Todo is visible.
    expect(displayedTitles).toEqual(['Practice TypeScript']);

    // Assert: Active Todos are hidden.
    expect(displayedTitles).not.toContain('Study Angular');
    expect(displayedTitles).not.toContain('Review Jasmine Tests');

    // Assert: The source data remains unchanged.
    expect(mockTodos.length).toBe(3);
    expect(mockTodos[0].completed).toBeFalse();
    expect(mockTodos[1].completed).toBeTrue();
    expect(mockTodos[2].completed).toBeFalse();
  });

  // 15. Jasmine
  // Lesson 152 - Part 4: Filter switching preserves Todo data
  it('should switch filters without modifying the original Todos', () => {
    // Arrange: Create three Todos.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 1301,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 1302,
        title: 'Practice TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 1303,
        title: 'Review Jasmine Tests',
        completed: false,
      }),
    ];

    // A. Create a snapshot
    // Save a snapshot of the original data.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Return the same Todos whenever the component requests them.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    // B. Reuse a helper function
    // Helper: Read titles from rendered Todo components.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // C. Verify switching works
    // Step 1: Select All.
    component.filter = 'all';
    fixture.detectChanges();

    expect(getDisplayedTitles()).toEqual([
      'Study Angular',
      'Practice TypeScript',
      'Review Jasmine Tests',
    ]);

    // Step 2: Switch to Active.
    component.filter = 'active';
    fixture.detectChanges();

    expect(getDisplayedTitles()).toEqual([
      'Study Angular',
      'Review Jasmine Tests',
    ]);

    // Step 3: Switch to Completed.
    component.filter = 'completed';
    fixture.detectChanges();

    expect(getDisplayedTitles()).toEqual(['Practice TypeScript']);

    // Step 4: Return to All.
    component.filter = 'all';
    fixture.detectChanges();

    expect(getDisplayedTitles()).toEqual([
      'Study Angular',
      'Practice TypeScript',
      'Review Jasmine Tests',
    ]);

    // D. Verify the original data remains unchanged
    // Assert: No Todo was removed or modified.
    expect(mockTodos).toEqual(originalTodos);

    // Assert: The original array still contains three Todos.
    expect(mockTodos.length).toBe(3);
  });

  // 16. Jasmine
  // Lesson 153 - Part 1: Render an empty Todo list
  it('should render no Todo items when the service returns an empty array', () => {
    // Arrange: Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // A. Mock an empty service response
    // Simulate a service with no Todos.
    const getTodosSpy = spyOn(todoService, 'getTodos').and.returnValue([]);

    // B. component.filter = 'all';
    // Select the All filter.
    component.filter = 'all';

    // C. Trigger Angular change detection
    // Act: Update the component template.
    fixture.detectChanges();

    // Find all rendered TodoItemComponent elements.
    const todoItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-todo-item'),
    );

    // D. Check the rendered HTML
    // Assert: No Todo items should be rendered.
    expect(todoItems.length).toBe(0);

    // Assert: The service returned an empty collection.
    expect(getTodosSpy).toHaveBeenCalled();
    expect(getTodosSpy.calls.mostRecent().returnValue).toEqual([]);
  });

  // 17. Jasmine
  // Lesson 153 - Part 2: Test the existing empty-state message
  it('should display the empty-state message when no Todos exist', () => {
    // Arrange: Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Simulate an empty Todo collection.
    spyOn(todoService, 'getTodos').and.returnValue([]);

    // Select the All filter.
    component.filter = 'all';

    // Act: Update the rendered HTML.
    fixture.detectChanges();

    // Find any rendered Todo items.
    const todoItems: NodeListOf<HTMLElement> =
      fixture.nativeElement.querySelectorAll('app-todo-item');

    // Find your EXISTING empty-state element.
    const emptyState: HTMLElement | null =
      fixture.nativeElement.querySelector('.empty-state');

    // Assert: No Todo items are rendered.
    expect(todoItems.length).toBe(0);

    // Assert: The empty-state element exists.
    expect(emptyState).not.toBeNull();

    // Assert: The existing message is displayed.
    expect(emptyState?.textContent).toContain(
      'No tasks yet. Add your first task!',
    );

    // Assert: The filter-specific empty message is not displayed.
    const filterEmpty: HTMLElement | null =
      fixture.nativeElement.querySelector('.todo-filter-empty');

    expect(filterEmpty).toBeNull();
  });

  // 18. Jasmine
  // Lesson 153 - Part 3: Empty Active filter results
  it('should display the empty Active filter message when all Todos are completed', () => {
    // Arrange: Create three completed Todos.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 1531,
        title: 'Study Angular',
        completed: true,
      }),
      createMockTodo({
        id: 1532,
        title: 'Practice TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 1533,
        title: 'Review Jasmine Tests',
        completed: true,
      }),
    ];

    // Retrieve the injected service.
    const todoService = TestBed.inject(TodoService);

    // Return predictable test data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    // Select the Active filter.
    component.filter = 'active';

    // Make sure the search field is empty.
    component.searchTerm = '';

    // Act: Update the rendered HTML.
    fixture.detectChanges();

    // Find all rendered Todo components.
    const todoItems: NodeListOf<HTMLElement> =
      fixture.nativeElement.querySelectorAll('app-todo-item');

    // Find the filter-specific empty-state element.
    const filterEmpty: HTMLElement | null =
      fixture.nativeElement.querySelector('.todo-filter-empty');

    // Find the general empty-state element.
    const generalEmpty: HTMLElement | null =
      fixture.nativeElement.querySelector('.empty-state');

    // Assert: No active Todos are displayed.
    expect(todoItems.length).toBe(0);

    // Assert: The filter-specific empty message exists.
    expect(filterEmpty).not.toBeNull();

    // Assert: The correct Active filter message appears.
    expect(filterEmpty?.textContent).toContain('No active tasks found.');

    // Assert: The general empty-state message is not displayed.
    expect(generalEmpty).toBeNull();

    // Assert: The original Todos remain unchanged.
    expect(mockTodos.length).toBe(3);
    expect(mockTodos.every((todo) => todo.completed)).toBeTrue();
  });

  // 19. Jasmine
  // Lesson 153 - Part 4: Empty Completed filter results
  it('should display the empty Completed filter message when no Todos are completed', () => {
    // Arrange: Create three active (unfinished) Todos.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 1541,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 1542,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 1543,
        title: 'Review Jasmine Tests',
        completed: false,
      }),
    ];

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Provide predictable Todo data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    // Select the Completed filter.
    component.filter = 'completed';

    // Ensure the search field is empty.
    component.searchTerm = '';

    // Act: Update Angular's rendered template.
    fixture.detectChanges();

    // Find any rendered Todo items.
    const todoItems: NodeListOf<HTMLElement> =
      fixture.nativeElement.querySelectorAll('app-todo-item');

    // Find the filter-specific empty message.
    const filterEmpty: HTMLElement | null =
      fixture.nativeElement.querySelector('.todo-filter-empty');

    // Find the general empty-state message.
    const generalEmpty: HTMLElement | null =
      fixture.nativeElement.querySelector('.empty-state');

    // Assert: No completed Todos are displayed.
    expect(todoItems.length).toBe(0);

    // Assert: The filter-specific message is rendered.
    expect(filterEmpty).not.toBeNull();

    // Assert: The correct Completed filter message appears.
    expect(filterEmpty?.textContent).toContain('No completed tasks yet.');

    // Assert: The general empty-state message is hidden.
    expect(generalEmpty).toBeNull();

    // Assert: The original Todo collection remains intact.
    expect(mockTodos.length).toBe(3);

    // Assert: Every Todo remains unfinished.
    expect(mockTodos.every((todo) => !todo.completed)).toBeTrue();
  });

  // 20. Jasmine
  // Lesson 154 - Part 1: Search Todos by title
  it('should display only Todos that match the search term', () => {
    /// A. Mock the data
    // Arrange: Create three mock Todos.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15401,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 15402,
        title: 'Practice TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 15403,
        title: 'Angular Unit Testing',
        completed: false,
      }),
    ];

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Return predictable test data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    /// B. Isolate searching from other filters
    // Select All so the status filter doesn't hide tasks.
    component.filter = 'all';

    // Act: Search for Todos containing "Angular".
    component.searchTerm = 'Angular';

    // Update Angular's rendered template.
    fixture.detectChanges();

    // Find the rendered Todo components.
    const todoItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-todo-item'),
    );

    /// C. Verify the rendered HTML
    // Assert: Exactly two Todos are displayed.
    expect(todoItems.length).toBe(2);

    // Read the rendered Todo titles.
    const displayedTitles = todoItems.map((item) =>
      item.querySelector('.todo-title')?.textContent?.trim(),
    );

    // Assert: Only matching Todos are displayed.
    expect(displayedTitles).toEqual(['Study Angular', 'Angular Unit Testing']);

    // Assert: The unrelated Todo is excluded.
    expect(displayedTitles).not.toContain('Practice TypeScript');

    /// D. Protect the original data
    // Assert: Searching does not remove Todos from source data.
    expect(mockTodos.length).toBe(3);
  });

  // 21. Jasmine
  // Lesson 154 - Part 2: Case-insensitive Todo searching
  it('should find matching Todos regardless of search term capitalization', () => {
    /// A. We reuse the same mock Todos.
    // Arrange: Create three mock Todos.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15411,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 15412,
        title: 'Practice TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 15413,
        title: 'Angular Unit Testing',
        completed: false,
      }),
    ];

    // Retrieve the injected service.
    const todoService = TestBed.inject(TodoService);

    // Return predictable mock data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    // Select All to isolate search behavior.
    component.filter = 'all';

    /// B. We create a helper function.
    // Helper: Read currently rendered Todo titles.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    const expectedTitles = ['Study Angular', 'Angular Unit Testing'];

    /// C. We change the search term three times.
    // Act + Assert: Lowercase search.
    component.searchTerm = 'angular';
    fixture.detectChanges();

    expect(getDisplayedTitles()).toEqual(expectedTitles);

    // Act + Assert: Uppercase search.
    component.searchTerm = 'ANGULAR';
    fixture.detectChanges();

    expect(getDisplayedTitles()).toEqual(expectedTitles);

    // Act + Assert: Mixed-case search.
    component.searchTerm = 'AnGuLaR';
    fixture.detectChanges();

    /// D. We expect identical results.
    expect(getDisplayedTitles()).toEqual(expectedTitles);

    // Assert: The original collection remains intact.
    expect(mockTodos.length).toBe(3);
  });

  // 21. Jasmine
  // Lesson 154 - Part 3: No matching Todo search results
  it('should display a no-results message when the search matches no Todos', () => {
    // Arrange: Create three mock Todos.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15421,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 15422,
        title: 'Practice TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 15423,
        title: 'Review Jasmine Tests',
        completed: false,
      }),
    ];

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Return predictable test data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    // Select All to isolate search functionality.
    component.filter = 'all';

    // Act: Search for a term that matches no Todos.
    component.searchTerm = 'Python';

    // Update Angular's template.
    fixture.detectChanges();

    // Find all rendered Todo items.
    const todoItems: NodeListOf<HTMLElement> =
      fixture.nativeElement.querySelectorAll('app-todo-item');

    // Find the existing no-results message.
    const noResults: HTMLElement | null =
      fixture.nativeElement.querySelector('.todo-no-results');

    // Find other empty-state messages.
    const generalEmpty: HTMLElement | null =
      fixture.nativeElement.querySelector('.empty-state');

    const filterEmpty: HTMLElement | null =
      fixture.nativeElement.querySelector('.todo-filter-empty');

    // Assert: No Todo items are rendered.
    expect(todoItems.length).toBe(0);

    // Assert: The search-specific message is displayed.
    expect(noResults).not.toBeNull();

    // Assert: Both existing message lines are correct.
    expect(noResults?.textContent).toContain('No matching tasks found.');

    expect(noResults?.textContent).toContain('Try a different search keyword.');

    // Assert: Other empty-state messages are not displayed.
    expect(generalEmpty).toBeNull();
    expect(filterEmpty).toBeNull();

    // Assert: Searching does not remove source Todos.
    expect(mockTodos.length).toBe(3);
  });

  // 23. Jasmine
  // Lesson 154 - Part 4: Clearing search restores all Todos
  it('should restore all Todos when the Clear Search button is clicked', () => {
    // Arrange: Create three mock Todos.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15431,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 15432,
        title: 'Practice TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 15433,
        title: 'Review Jasmine Tests',
        completed: false,
      }),
    ];

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Return predictable test data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    // Use the All filter to isolate search functionality.
    component.filter = 'all';

    // Start with a search that matches only one Todo.
    component.searchTerm = 'Angular';

    // Update the rendered template.
    fixture.detectChanges();

    // Helper: Get the currently displayed Todo titles.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Assert: Only one Todo matches the initial search.
    expect(getDisplayedTitles()).toEqual(['Study Angular']);

    // Find the existing Clear Search button.
    const clearSearchButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.clear-search');

    // Assert: The button is visible while searching.
    expect(clearSearchButton).not.toBeNull();

    // Act: Simulate a real user clicking Clear Search.
    clearSearchButton!.click();

    // Refresh the Angular template.
    fixture.detectChanges();

    // Assert: Search term was cleared.
    expect(component.searchTerm).toBe('');

    // Assert: All three Todos are displayed again.
    expect(getDisplayedTitles()).toEqual([
      'Study Angular',
      'Practice TypeScript',
      'Review Jasmine Tests',
    ]);

    // Assert: Clear Search button is no longer displayed.
    const buttonAfterClearing: HTMLElement | null =
      fixture.nativeElement.querySelector('.clear-search');

    expect(buttonAfterClearing).toBeNull();

    // Assert: Original Todo data remains intact.
    expect(mockTodos.length).toBe(3);
  });

  // 24. Jasmine
  // Lesson 155 - Part 1: Combine search with Active filter
  it('should display only active Todos matching the search term', () => {
    // Arrange: Create Todos with mixed titles and completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15501,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 15502,
        title: 'Angular Unit Testing',
        completed: true,
      }),
      createMockTodo({
        id: 15503,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 15504,
        title: 'Angular Components',
        completed: false,
      }),
    ];

    // Retrieve the injected service.
    const todoService = TestBed.inject(TodoService);

    // Return consistent test data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    // Act: Apply both search and Active filter.
    component.searchTerm = 'Angular';
    component.filter = 'active';

    // Update Angular's rendered template.
    fixture.detectChanges();

    // Read the displayed Todo titles from the DOM.
    const todoItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-todo-item'),
    );

    const displayedTitles: string[] = todoItems.map(
      (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
    );

    // Assert: Only unfinished Angular tasks appear.
    expect(displayedTitles).toEqual(['Study Angular', 'Angular Components']);

    // Assert: Exactly two Todos are rendered.
    expect(todoItems.length).toBe(2);

    // Assert: The completed Angular task is excluded.
    expect(displayedTitles).not.toContain('Angular Unit Testing');

    // Assert: The unrelated active task is excluded.
    expect(displayedTitles).not.toContain('Practice TypeScript');

    // Assert: Source data is still intact.
    expect(mockTodos.length).toBe(4);
    expect(mockTodos.filter((todo) => todo.completed).length).toBe(1);
  });

  // 25. Jasmine
  // Lesson 155 - Part 2: Combine search with Completed filter
  it('should display only completed Todos matching the search term', () => {
    // Arrange: Create Todos with mixed titles and completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15511,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 15512,
        title: 'Angular Unit Testing',
        completed: true,
      }),
      createMockTodo({
        id: 15513,
        title: 'Practice TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 15514,
        title: 'Angular Components',
        completed: true,
      }),
    ];

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Return predictable test data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    /// A. Apply both conditions
    // Act: Apply both search and Completed filter.
    component.searchTerm = 'Angular';
    component.filter = 'completed';

    /// B. Trigger change detection
    // Update the Angular template.
    fixture.detectChanges();

    // Get rendered Todo components.
    const todoItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-todo-item'),
    );

    // Read the displayed Todo titles.
    const displayedTitles: string[] = todoItems.map(
      (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
    );

    /// C. Verify the rendered results
    // Assert: Only completed Angular tasks appear.
    expect(displayedTitles).toEqual([
      'Angular Unit Testing',
      'Angular Components',
    ]);

    // Assert: Exactly two Todos are rendered.
    expect(todoItems.length).toBe(2);

    // Assert: The unfinished Angular task is excluded.
    expect(displayedTitles).not.toContain('Study Angular');

    // Assert: The completed but unrelated task is excluded.
    expect(displayedTitles).not.toContain('Practice TypeScript');

    /// D. Verify source data preservation
    // Assert: Original Todo data remains intact.
    expect(mockTodos.length).toBe(4);

    // Assert: Three source Todos are still completed.
    expect(mockTodos.filter((todo) => todo.completed).length).toBe(3);
  });

  // 26. Jasmine
  // Lesson 155 - Part 3: Combine search with All filter
  it('should display all Todos matching the search regardless of completion status', () => {
    // Arrange: Create Todos with different completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15521,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 15522,
        title: 'Angular Unit Testing',
        completed: true,
      }),
      createMockTodo({
        id: 15523,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 15524,
        title: 'Angular Components',
        completed: false,
      }),
    ];

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Mock the service response.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    /// A. Apply search and All filter
    // Act: Search for Angular with the All filter selected.
    component.searchTerm = 'Angular';
    component.filter = 'all';

    // Refresh the Angular template.
    fixture.detectChanges();

    // Retrieve the rendered Todo items.
    const todoItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-todo-item'),
    );

    // Extract the displayed Todo titles.
    const displayedTitles: string[] = todoItems.map(
      (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
    );

    /// B. Verify both completion states appear
    // Assert: All matching Angular Todos appear.
    expect(displayedTitles).toEqual([
      'Study Angular',
      'Angular Unit Testing',
      'Angular Components',
    ]);

    // Assert: Exactly three matching Todos are rendered.
    expect(todoItems.length).toBe(3);

    // Assert: The unrelated Todo is excluded.
    expect(displayedTitles).not.toContain('Practice TypeScript');

    /// C. Verify completion states
    // Assert: Search results include both active and completed Todos.
    expect(mockTodos.find((todo) => todo.id === 15521)?.completed).toBeFalse();

    expect(mockTodos.find((todo) => todo.id === 15522)?.completed).toBeTrue();

    /// D. Verify the original collection
    // Assert: The source data remains intact.
    expect(mockTodos.length).toBe(4);
  });

  // 27. Jasmine
  // Lesson 155 - Part 4: Preserve search while switching filters
  it('should preserve the search term when switching Todo filters', () => {
    // Arrange: Create mock Todos.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15531,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 15532,
        title: 'Angular Unit Testing',
        completed: true,
      }),
      createMockTodo({
        id: 15533,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 15534,
        title: 'Angular Components',
        completed: false,
      }),
    ];

    // Preserve the original data for later comparison.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Mock the service response.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    /// 1. State preservation
    // Start with the Angular search term.
    component.searchTerm = 'Angular';

    /// 2. Reusing a DOM helper
    // Helper: Read rendered Todo titles.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    /// 3. Angular change detection
    // Step 1: All filter.
    component.filter = 'all';
    fixture.detectChanges();

    expect(getDisplayedTitles()).toEqual([
      'Study Angular',
      'Angular Unit Testing',
      'Angular Components',
    ]);

    expect(component.searchTerm).toBe('Angular');

    // Step 2: Active filter.
    component.filter = 'active';
    fixture.detectChanges();

    expect(getDisplayedTitles()).toEqual([
      'Study Angular',
      'Angular Components',
    ]);

    expect(component.searchTerm).toBe('Angular');

    // Step 3: Completed filter.
    component.filter = 'completed';
    fixture.detectChanges();

    expect(getDisplayedTitles()).toEqual(['Angular Unit Testing']);

    expect(component.searchTerm).toBe('Angular');

    // Step 4: Switch back to All.
    component.filter = 'all';
    fixture.detectChanges();

    expect(getDisplayedTitles()).toEqual([
      'Study Angular',
      'Angular Unit Testing',
      'Angular Components',
    ]);

    // Assert: The search term is still preserved.
    expect(component.searchTerm).toBe('Angular');

    /// 4. Protecting source data
    // Assert: Switching filters did not modify source Todos.
    expect(mockTodos).toEqual(originalTodos);
    expect(mockTodos.length).toBe(4);

    /// 5. Integration testing
    // This test verifies that searching and status filtering work together across multiple state changes within one component instance. Unlike Parts 1–3, we're testing an entire sequence of filter changes.
  });

  // 28. Jasmine
  // Lesson 156 - Part 1: Default sorting preserves Todo order
  it('should preserve the original Todo order when default sorting is selected', () => {
    // Arrange: Create Todos in a deliberately non-alphabetical order.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15601,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 15602,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 15603,
        title: 'Mango Task',
        completed: false,
      }),
    ];

    // Save the original order for comparison.
    const originalIds = mockTodos.map((todo) => todo.id);

    // Retrieve the TodoService.
    const todoService = TestBed.inject(TodoService);

    // Return our controlled Todo collection.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    // Select default sorting and All filtering.
    component.sortOrder = 'default';
    component.filter = 'all';
    component.searchTerm = '';

    // Act: Render the component.
    fixture.detectChanges();

    // Retrieve all rendered Todo components.
    const todoItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-todo-item'),
    );

    // Extract their displayed titles in DOM order.
    const displayedTitles: string[] = todoItems.map(
      (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
    );

    /// This verifies the order of elements actually rendered in the browser, rather than merely checking the service array.
    // Assert: The original order is preserved.
    expect(displayedTitles).toEqual(['Zebra Task', 'Apple Task', 'Mango Task']);

    // Assert: Exactly three Todo items are rendered.
    expect(todoItems.length).toBe(3);

    /// This ensures that rendering with default sorting hasn't unexpectedly rearranged the source array.
    // Assert: Source Todo order remains unchanged.
    expect(mockTodos.map((todo) => todo.id)).toEqual(originalIds);

    // Assert: Default sorting remains selected.
    expect(component.sortOrder).toBe('default');
  });

  // 29. Jasmine
  // Lesson 156 - Part 2: Sort Todo titles alphabetically A-Z
  it('should render Todos in alphabetical A-Z order when ascending sort is selected', () => {
    // Arrange: Create Todos in a non-alphabetical order.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15611,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 15612,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 15613,
        title: 'Mango Task',
        completed: false,
      }),
    ];

    // Save the original source order.
    const originalIds = mockTodos.map((todo) => todo.id);

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Mock the service response.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    /// A. Select the correct sorting option
    // Act: Select ascending alphabetical sorting.
    component.sortOrder = 'asc';

    // Show all Todos without search restrictions.
    component.filter = 'all';
    component.searchTerm = '';

    // Update Angular's rendered template.
    fixture.detectChanges();

    // Get rendered Todo components.
    const todoItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-todo-item'),
    );

    // Extract titles in their rendered order.
    const displayedTitles: string[] = todoItems.map(
      (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
    );

    /// B. Verify the rendered order
    // Assert: Todo titles are sorted A-Z.
    expect(displayedTitles).toEqual(['Apple Task', 'Mango Task', 'Zebra Task']);

    // Assert: Exactly three Todos are rendered.
    expect(todoItems.length).toBe(3);

    /// C. Protect the original collection
    // Assert: The source array order was not modified.
    expect(mockTodos.map((todo) => todo.id)).toEqual(originalIds);

    /// D. Verify component state
    // Assert: The ascending option is selected.
    expect(component.sortOrder).toBe('asc');
  });

  // 30. Jasmine
  // Lesson 156 - Part 3: Sort Todo titles alphabetically Z-A
  it('should render Todos in alphabetical Z-A order when descending sort is selected', () => {
    // Arrange: Create Todos in a non-sorted order.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15621,
        title: 'Mango Task',
        completed: false,
      }),
      createMockTodo({
        id: 15622,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 15623,
        title: 'Zebra Task',
        completed: false,
      }),
    ];

    // Preserve the original source order.
    const originalIds = mockTodos.map((todo) => todo.id);

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Return predictable test data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    /// A. Selecting Z–A sorting
    // Act: Select descending alphabetical sorting.
    component.sortOrder = 'desc';

    /// B. Isolating sorting behavior
    // Isolate sorting from searching and filtering.
    component.filter = 'all';
    component.searchTerm = '';

    // Refresh the rendered Angular template.
    fixture.detectChanges();

    // Get all rendered Todo components in DOM order.
    const todoItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-todo-item'),
    );

    // Extract their displayed titles.
    const displayedTitles: string[] = todoItems.map(
      (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
    );

    /// C. Checking rendered order
    // Assert: Titles appear alphabetically Z-A.
    expect(displayedTitles).toEqual(['Zebra Task', 'Mango Task', 'Apple Task']);

    // Assert: Exactly three Todos are rendered.
    expect(todoItems.length).toBe(3);

    /// D. Checking data preservation
    // Assert: Sorting did not modify the original array order.
    expect(mockTodos.map((todo) => todo.id)).toEqual(originalIds);

    // Assert: The descending sorting option remains selected.
    expect(component.sortOrder).toBe('desc');
  });

  // 31. Jasmine
  // Lesson 156 - Part 4: Combine sorting, searching, and filtering
  it('should sort active Todos matching the search term in A-Z order', () => {
    // Arrange: Create Todos with different titles
    // and completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15631,
        title: 'Zebra Angular Task',
        completed: false,
      }),
      createMockTodo({
        id: 15632,
        title: 'Apple Angular Task',
        completed: false,
      }),
      createMockTodo({
        id: 15633,
        title: 'Mango Angular Task',
        completed: true,
      }),
      createMockTodo({
        id: 15634,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 15635,
        title: 'Banana Angular Task',
        completed: false,
      }),
    ];

    // Preserve the source data before processing.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Mock the service response.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    /// A. Combine all three processing options
    // Act: Apply all three processing options.
    component.filter = 'active';
    component.searchTerm = 'Angular';
    component.sortOrder = 'asc';

    // Update Angular's rendered template.
    fixture.detectChanges();

    // Retrieve Todo components in their rendered order.
    const todoItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-todo-item'),
    );

    // Extract the displayed titles.
    const displayedTitles: string[] = todoItems.map(
      (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
    );

    /// B. Check the final rendered order
    // Assert: Only active Angular tasks are shown,
    // ordered alphabetically A-Z.
    expect(displayedTitles).toEqual([
      'Apple Angular Task',
      'Banana Angular Task',
      'Zebra Angular Task',
    ]);

    // Assert: Exactly three tasks are rendered.
    expect(todoItems.length).toBe(3);

    // Assert: The completed Angular task is excluded.
    expect(displayedTitles).not.toContain('Mango Angular Task');

    // Assert: The unrelated active task is excluded.
    expect(displayedTitles).not.toContain('Practice TypeScript');

    // Assert: The selected processing options are preserved.
    expect(component.filter).toBe('active');
    expect(component.searchTerm).toBe('Angular');
    expect(component.sortOrder).toBe('asc');

    /// C. Verify excluded tasks
    //// The test checks that the completed Angular task and unrelated active task do not appear.
    /// D. Protect source data
    // Assert: Processing did not change the source Todos.
    expect(mockTodos).toEqual(originalTodos);
    expect(mockTodos.length).toBe(5);
  });

  // 32. Jasmine
  // Lesson 157 - Part 1: Active Tasks First sorting
  it('should render active Todos before completed Todos', () => {
    // Arrange: Create four mock Todos with mixed statuses.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15701,
        title: 'Study Angular',
        completed: true,
      }),
      createMockTodo({
        id: 15702,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 15703,
        title: 'Review Jasmine',
        completed: true,
      }),
      createMockTodo({
        id: 15704,
        title: 'Build Portfolio',
        completed: false,
      }),
    ];

    // Save the original array order and Todo values.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Return predictable test data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    /// A. Use the actual sorting value
    // Act: Select Active Tasks First sorting.
    component.sortOrder = 'active-first';

    /// B. Keep both completed and active Todos visible
    // Show all tasks without search restrictions.
    component.filter = 'all';
    component.searchTerm = '';

    // Update the rendered Angular template.
    fixture.detectChanges();

    // Find all rendered Todo components.
    const todoItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-todo-item'),
    );

    // Extract their titles in DOM order.
    const displayedTitles: string[] = todoItems.map(
      (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
    );

    /// C. Verify the resulting order
    // Assert: Unfinished Todos are displayed first.
    expect(displayedTitles).toEqual([
      'Practice TypeScript',
      'Build Portfolio',
      'Study Angular',
      'Review Jasmine',
    ]);

    // Assert: All four Todos are rendered.
    expect(todoItems.length).toBe(4);

    // Assert: Active-first remains selected.
    expect(component.sortOrder).toBe('active-first');

    /// D. Check source data preservation
    // Assert: Sorting did not modify the original Todos.
    expect(mockTodos).toEqual(originalTodos);
  });

  // 33. // Lesson 157 - Part 2: Completed Tasks First sorting
  it('should render completed Todos before active Todos', () => {
    // Arrange: Create four Todos with mixed completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15711,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 15712,
        title: 'Practice TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 15713,
        title: 'Build Portfolio',
        completed: false,
      }),
      createMockTodo({
        id: 15714,
        title: 'Review Jasmine',
        completed: true,
      }),
    ];

    // Preserve the original Todo data and array order.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Return predictable mock data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    /// A. Select the correct sorting value
    // Act: Select Completed Tasks First sorting.
    component.sortOrder = 'completed-first';

    /// B. Keep both statuses visible
    // Show all Todos without search restrictions.
    component.filter = 'all';
    component.searchTerm = '';

    // Update the rendered Angular template.
    fixture.detectChanges();

    // Find all rendered Todo components in DOM order.
    const todoItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-todo-item'),
    );

    // Extract the displayed Todo titles.
    const displayedTitles: string[] = todoItems.map(
      (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
    );

    /// C. Verify the displayed order
    // Assert: Completed Todos appear first.
    expect(displayedTitles).toEqual([
      'Practice TypeScript',
      'Review Jasmine',
      'Study Angular',
      'Build Portfolio',
    ]);

    // Assert: All four Todos are rendered.
    expect(todoItems.length).toBe(4);

    // Assert: Completed-first sorting remains selected.
    expect(component.sortOrder).toBe('completed-first');

    /// D. Verify the original Todo collection
    // Assert: Sorting did not change the original Todos.
    expect(mockTodos).toEqual(originalTodos);
  });

  // 34. Jasmine
  // Lesson 157 - Part 3: Switching status-based sort orders
  it('should switch sorting options without modifying original Todos', () => {
    // Arrange: Create Todos with mixed completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15721,
        title: 'Study Angular',
        completed: true,
      }),
      createMockTodo({
        id: 15722,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 15723,
        title: 'Review Jasmine',
        completed: true,
      }),
      createMockTodo({
        id: 15724,
        title: 'Build Portfolio',
        completed: false,
      }),
    ];

    // Save a snapshot of the original Todo collection.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Return predictable mock data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    // Show all Todos without search restrictions.
    component.filter = 'all';
    component.searchTerm = '';

    // Helper: Read Todo titles in their rendered order.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Step 1: Default sorting.
    component.sortOrder = 'default';
    fixture.detectChanges();

    expect(getDisplayedTitles()).toEqual([
      'Study Angular',
      'Practice TypeScript',
      'Review Jasmine',
      'Build Portfolio',
    ]);

    /// A. One component, multiple sorting states. /// Instead of creating a new fixture for every sorting option, we reuse the same component and repeatedly change its sortOrder property.
    // Step 2: Active Tasks First.
    component.sortOrder = 'active-first';
    fixture.detectChanges();

    expect(getDisplayedTitles()).toEqual([
      'Practice TypeScript',
      'Build Portfolio',
      'Study Angular',
      'Review Jasmine',
    ]);

    // Step 3: Completed Tasks First.
    component.sortOrder = 'completed-first';
    fixture.detectChanges();

    expect(getDisplayedTitles()).toEqual([
      'Study Angular',
      'Review Jasmine',
      'Practice TypeScript',
      'Build Portfolio',
    ]);

    /// B. Why switch back to Default?. /// This verifies that the original ordering is restored after trying other sorting options.
    // Step 4: Switch back to Default sorting.
    component.sortOrder = 'default';
    fixture.detectChanges();

    expect(getDisplayedTitles()).toEqual([
      'Study Angular',
      'Practice TypeScript',
      'Review Jasmine',
      'Build Portfolio',
    ]);

    /// C. Why compare the original Todos?. /// If sorting accidentally modified the original array order or Todo property values, this comparison would fail.
    // Assert: The source Todo collection was not modified.
    expect(mockTodos).toEqual(originalTodos);

    // Assert: All four Todos are still present.
    expect(mockTodos.length).toBe(4);

    // Assert: Sorting state returned to default.
    expect(component.sortOrder).toBe('default');
  });

  /// D. What are we not testing yet?. /// This test changes component.sortOrder directly. It verifies rendering and state transitions, but doesn't simulate changing the actual dropdown. We'll address UI interaction testing separately.

  // 35. Jasmine
  // Lesson 157 - Part 4:
  // Combine Completed-first sorting with search and filtering
  it('should display matching Todos with completed tasks first', () => {
    // Arrange: Create five Todos with mixed statuses.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15731,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 15732,
        title: 'Angular Unit Testing',
        completed: true,
      }),
      createMockTodo({
        id: 15733,
        title: 'Practice TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 15734,
        title: 'Angular Components',
        completed: false,
      }),
      createMockTodo({
        id: 15735,
        title: 'Angular Testing Notes',
        completed: true,
      }),
    ];

    // Save a snapshot of the original Todo data.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Return predictable mock data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    /// A. Combining the processing options
    // Act: Apply filtering, searching, and sorting.
    component.filter = 'all';
    component.searchTerm = 'Angular';
    component.sortOrder = 'completed-first';

    // Update the Angular template.
    fixture.detectChanges();

    // Retrieve rendered Todo components.
    const todoItems: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('app-todo-item'),
    );

    // Extract Todo titles in their displayed order.
    const displayedTitles: string[] = todoItems.map(
      (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
    );

    /// B. Verifying the order
    // Assert: Completed matching tasks appear first.
    expect(displayedTitles).toEqual([
      'Angular Unit Testing',
      'Angular Testing Notes',
      'Study Angular',
      'Angular Components',
    ]);

    // Assert: Four matching tasks are rendered.
    expect(todoItems.length).toBe(4);

    /// C. Excluding unrelated tasks
    // Assert: The unrelated task is excluded.
    expect(displayedTitles).not.toContain('Practice TypeScript');

    // Assert: Search and sorting settings are preserved.
    expect(component.filter).toBe('all');
    expect(component.searchTerm).toBe('Angular');
    expect(component.sortOrder).toBe('completed-first');

    /// D. Preventing unintended mutations
    // Assert: The original collection remains unchanged.
    expect(mockTodos).toEqual(originalTodos);
    expect(mockTodos.length).toBe(5);
  });

  // 36. Jasmine
  // Lesson 158 - Part 1:
  // Verify all sorting dropdown options and labels.
  it('should render all five Todo sorting options correctly', () => {
    // Arrange: Set the initial sorting selection.
    component.sortOrder = 'default';

    // Act: Update the Angular template.
    fixture.detectChanges();

    /// A. Retrieve the actual HTML dropdown
    // Find the sorting dropdown.
    const sortSelect: HTMLSelectElement | null =
      fixture.nativeElement.querySelector('#todo-sort-select');

    // Assert: The dropdown exists.
    expect(sortSelect).not.toBeNull();

    // Make sure the element exists before accessing its options.
    if (!sortSelect) {
      return;
    }

    /// B. Inspect rendered options
    // Extract all option values in their rendered order.
    const optionValues: string[] = Array.from(sortSelect.options).map(
      (option) => option.value,
    );

    /// C. Verify what users see
    // Extract all visible option labels.
    const optionLabels: string[] = Array.from(sortSelect.options).map(
      (option) => option.textContent?.trim() ?? '',
    );

    // Assert: Exactly five options are rendered.
    expect(sortSelect.options.length).toBe(5);

    // Assert: Each option has the correct internal value.
    expect(optionValues).toEqual([
      'default',
      'asc',
      'desc',
      'active-first',
      'completed-first',
    ]);

    // Assert: Each option has the correct displayed label.
    expect(optionLabels).toEqual([
      'Default order',
      'Title: A–Z',
      'Title: Z–A',
      'Active Tasks First',
      'Completed Tasks First',
    ]);

    /// D. Verify the selected value
    // Assert: Default sorting is selected initially.
    expect(sortSelect.value).toBe('default');

    // Assert: Component sorting state is consistent.
    expect(component.sortOrder).toBe('default');
  });

  // 37. Jasmine
  // Lesson 158 - Part 2:
  // Verify that changing the sort dropdown updates the component
  // and changes the rendered Todo order.
  it('should update sorting when the user changes the dropdown', async () => {
    // Arrange: Create mock Todos in non-alphabetical order.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15811,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 15812,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 15813,
        title: 'Mango Task',
        completed: false,
      }),
    ];

    // Preserve the original source order and Todo values.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Return the mock Todos instead of actual service data.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    // Start with default sorting and no filtering/searching.
    component.sortOrder = 'default';
    component.filter = 'all';
    component.searchTerm = '';

    fixture.detectChanges();

    // Find the actual HTML sorting dropdown.
    const sortSelect: HTMLSelectElement =
      fixture.nativeElement.querySelector('#todo-sort-select');

    // Helper: Read Todo titles in their rendered order.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Assert: Default order is displayed initially.
    expect(sortSelect.value).toBe('default');

    expect(getDisplayedTitles()).toEqual([
      'Zebra Task',
      'Apple Task',
      'Mango Task',
    ]);

    /// A. Simulate a real user interaction
    // Act: Simulate the user selecting Title: A-Z.
    sortSelect.value = 'asc';

    // Notify Angular that the select value changed.
    sortSelect.dispatchEvent(new Event('change'));

    /// B. Wait for Angular's form updates
    // Wait for Angular's ngModel update to finish.
    await fixture.whenStable();

    // Refresh the rendered Todo list.
    fixture.detectChanges();

    /// C. Verify two-way binding
    // Assert: Two-way binding updates the component state.
    expect(component.sortOrder).toBe('asc');

    // Assert: The dropdown reflects the selected value.
    expect(sortSelect.value).toBe('asc');

    /// D. Verify the sorting pipeline
    // Assert: Todos are now displayed alphabetically.
    expect(getDisplayedTitles()).toEqual([
      'Apple Task',
      'Mango Task',
      'Zebra Task',
    ]);

    // Assert: The source Todo collection remains unchanged.
    expect(mockTodos).toEqual(originalTodos);
  });

  // 38. Jasmine
  // Lesson 158 - Part 3:
  // Verify that saveSortOrder() persists the selected
  // sorting preference to localStorage.
  it('should save the selected sort order to localStorage', () => {
    /// B. Save the selected option
    // Arrange: Select Completed Tasks First.
    component.sortOrder = 'completed-first';

    /// A. Verify the initial storage state
    // Confirm this test starts without a saved preference.
    expect(localStorage.getItem('todoSortOrder')).toBeNull();

    /// B. Save the selected option
    // Act: Save the selected sorting preference.
    component.saveSortOrder();

    /// C. Verify persistence
    // Assert: localStorage contains the expected value.
    expect(localStorage.getItem('todoSortOrder')).toBe('completed-first');

    // Assert: The component still has the selected option.
    expect(component.sortOrder).toBe('completed-first');

    /// D. Clean up afterward
    // Clean up this test's saved preference.
    localStorage.removeItem('todoSortOrder');
  });

  // 39. Jasmine
  // Lesson 158 - Part 4:
  // Verify that loadSortOrder() restores a valid sorting
  // preference from localStorage and updates the dropdown.
  it('should restore the saved sort order from localStorage', async () => {
    // Arrange: Simulate a saved sorting preference.
    localStorage.setItem('todoSortOrder', 'desc');

    // Reset the component sorting state.
    component.sortOrder = 'default';

    // Ensure the component and dropdown start in sync.
    fixture.detectChanges();

    // Wait for pending Angular form updates.
    await fixture.whenStable();

    // Assert: The component starts with default sorting.
    expect(component.sortOrder).toBe('default');

    // Assert: The saved preference exists.
    expect(localStorage.getItem('todoSortOrder')).toBe('desc');

    // Act: Restore the saved preference.
    component.loadSortOrder();

    // Assert: The component restored the saved value.
    expect(component.sortOrder).toBe('desc');

    // Allow Angular to update the dropdown binding.
    fixture.detectChanges();

    // Wait for pending ngModel updates.
    await fixture.whenStable();

    // Run change detection again to synchronize the DOM.
    fixture.detectChanges();

    // Find the actual sorting dropdown.
    const sortSelect: HTMLSelectElement | null =
      fixture.nativeElement.querySelector('#todo-sort-select');

    // Assert: The dropdown exists.
    expect(sortSelect).not.toBeNull();

    if (!sortSelect) {
      return;
    }

    // Assert: The dropdown displays the restored value.
    expect(sortSelect.value).toBe('desc');

    // Assert: The stored preference remains unchanged.
    expect(localStorage.getItem('todoSortOrder')).toBe('desc');

    // Clean up the saved preference.
    localStorage.removeItem('todoSortOrder');
  });

  // 40. Jasmine
  // Lesson 159 - Part 1:
  // Verify that clicking Reset Sorting restores the
  // default option, updates the dropdown, hides the
  // reset button, and saves the default preference.
  it('should reset sorting when the Reset Sorting button is clicked', async () => {
    /// A. Start with a custom sorting option
    // Arrange: Select a non-default sorting preference.
    component.sortOrder = 'desc';

    // Render the component with Descending sorting selected.
    fixture.detectChanges();

    // Wait for Angular's template-driven form updates.
    await fixture.whenStable();
    fixture.detectChanges();

    // Find the Reset Sorting button.
    const resetButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.reset-sort');

    // Assert: Reset Sorting is visible for a custom sort.
    expect(resetButton).not.toBeNull();

    // Assert: The sorting state is currently descending.
    expect(component.sortOrder).toBe('desc');

    // Stop if the button was not rendered.
    if (!resetButton) {
      return;
    }

    /// B. Simulate clicking the actual button
    // Act: Simulate the user clicking Reset Sorting.
    resetButton.click();

    // Update Angular after the click.
    fixture.detectChanges();

    // Wait for pending Angular updates.
    await fixture.whenStable();

    // Refresh the rendered template.
    fixture.detectChanges();

    // Assert: The component returns to default sorting.
    expect(component.sortOrder).toBe('default');

    // Find the sorting dropdown.
    const sortSelect: HTMLSelectElement | null =
      fixture.nativeElement.querySelector('#todo-sort-select');

    // Assert: The dropdown exists and shows Default.
    expect(sortSelect).not.toBeNull();

    /// C. Verify the dropdown and button
    expect(sortSelect?.value).toBe('default');

    // Assert: The Reset Sorting button is now hidden.
    const resetButtonAfterClick: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.reset-sort');

    /// C. Verify the dropdown and button
    expect(resetButtonAfterClick).toBeNull();

    /// D. Verify localStorage persistence
    // Assert: The default sorting preference was saved.
    expect(localStorage.getItem('todoSortOrder')).toBe('default');

    // Clean up saved state after the test.
    localStorage.removeItem('todoSortOrder');
  });

  // 41. Jasmine
  // Lesson 159 - Part 2:
  // Verify that resetting sorting restores the original
  // displayed Todo order without modifying the source data.
  it('should restore the original Todo order after resetting sorting', async () => {
    // Arrange: Create mock Todos in non-alphabetical order.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 15911,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 15912,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 15913,
        title: 'Mango Task',
        completed: false,
      }),
    ];

    // Save the original Todo collection.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Retrieve and mock the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    // Display all Todos without search restrictions.
    component.filter = 'all';
    component.searchTerm = '';

    // Helper: Read Todo titles in their rendered order.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Step 1: Start with ascending alphabetical sorting.
    component.sortOrder = 'asc';

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    /// A. Confirm the list was actually sorted before resetting
    // Assert: Todos initially appear alphabetically A-Z.
    expect(getDisplayedTitles()).toEqual([
      'Apple Task',
      'Mango Task',
      'Zebra Task',
    ]);

    // Find the Reset Sorting button.
    const resetButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.reset-sort');

    // Assert: Reset Sorting is available.
    expect(resetButton).not.toBeNull();

    if (!resetButton) {
      return;
    }

    /// B. Click the real Reset Sorting button
    // Step 2: Simulate clicking Reset Sorting.
    resetButton.click();

    // Update Angular after the click.
    fixture.detectChanges();

    // Wait for pending Angular form updates.
    await fixture.whenStable();

    // Synchronize the rendered template again.
    fixture.detectChanges();

    /// C. Verify the original order is restored
    // Assert: The original Todo order is restored.
    expect(getDisplayedTitles()).toEqual([
      'Zebra Task',
      'Apple Task',
      'Mango Task',
    ]);

    // Assert: The component returned to default sorting.
    expect(component.sortOrder).toBe('default');

    // Assert: All three Todos are still present.
    expect(getDisplayedTitles().length).toBe(3);

    // Assert: Reset Sorting is no longer displayed.
    expect(fixture.nativeElement.querySelector('.reset-sort')).toBeNull();

    // Assert: The default preference is saved.
    expect(localStorage.getItem('todoSortOrder')).toBe('default');

    /// D. Confirm the source data remains unchanged
    // Assert: Sorting did not mutate the source collection.
    expect(mockTodos).toEqual(originalTodos);
  });

  // 42. Jasmine
  // Lesson 159 - Part 3:
  // Verify that loadSortOrder() rejects an unsupported
  // sorting value stored in localStorage.
  it('should ignore an invalid saved sorting preference', async () => {
    /// A. Simulate invalid persisted data
    // Arrange: Store a sorting value that is not supported.
    localStorage.setItem('todoSortOrder', 'unknown-sort');

    // Start with a valid default sorting state.
    component.sortOrder = 'default';

    // Synchronize the component and dropdown.
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert: The component initially uses default sorting.
    expect(component.sortOrder).toBe('default');

    // Assert: The invalid saved value exists in localStorage.
    expect(localStorage.getItem('todoSortOrder')).toBe('unknown-sort');

    /// B. Attempt to restore the preference
    // Act: Attempt to load the saved sorting preference.
    component.loadSortOrder();

    // Synchronize the template after attempting restoration.
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    /// C. Confirm the component doesn't change
    // Assert: The invalid preference was not applied.
    expect(component.sortOrder).toBe('default');

    // Find the rendered sorting dropdown.
    const sortSelect: HTMLSelectElement | null =
      fixture.nativeElement.querySelector('#todo-sort-select');

    // Assert: The dropdown exists.
    expect(sortSelect).not.toBeNull();

    // Assert: The dropdown still displays Default.
    expect(sortSelect?.value).toBe('default');

    /// D. Check localStorage behavior
    // Assert: The invalid stored value was not automatically
    // replaced or removed by loadSortOrder().
    expect(localStorage.getItem('todoSortOrder')).toBe('unknown-sort');

    // Clean up this test's localStorage entry.
    localStorage.removeItem('todoSortOrder');
  });

  // 43. Jasmine
  // Lesson 159 - Part 4:
  // Verify that loadSortOrder() preserves the current
  // sorting state when no preference exists in localStorage.
  it('should preserve the current sort order when no saved preference exists', async () => {
    /// A. Simulate a missing preference
    // Arrange: Remove any previously saved sorting preference.
    localStorage.removeItem('todoSortOrder');

    /// B. Start with a valid, non-default state
    // Start with an existing valid sorting state.
    component.sortOrder = 'active-first';

    // Synchronize the Angular template and dropdown.
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert: No saved sorting preference exists.
    expect(localStorage.getItem('todoSortOrder')).toBeNull();

    /// C. Verify the sorting state stays unchanged
    // Assert: The component currently uses Active Tasks First.
    expect(component.sortOrder).toBe('active-first');

    // Act: Attempt to restore a missing sorting preference.
    component.loadSortOrder();

    // Update the Angular template after loading.
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert: The existing valid sorting state is preserved.
    expect(component.sortOrder).toBe('active-first');

    // Retrieve the rendered sorting dropdown.
    const sortSelect: HTMLSelectElement | null =
      fixture.nativeElement.querySelector('#todo-sort-select');

    // Assert: The dropdown exists.
    expect(sortSelect).not.toBeNull();

    // Assert: The dropdown still displays Active Tasks First.
    expect(sortSelect?.value).toBe('active-first');

    /// D. Verify that no preference was saved
    // Assert: Loading a missing preference did not save
    // a new value to localStorage.
    expect(localStorage.getItem('todoSortOrder')).toBeNull();
  });

  // 44. Jasmine
  // Lesson 160 - Part 1:
  // Verify that ngOnInit() automatically restores a saved
  // sorting preference when a new component is initialized.
  it('should restore the saved sort order during component initialization', async () => {
    /// A. Save the preference before creating the component
    // Arrange: Simulate a preference saved from an earlier visit.
    localStorage.setItem('todoSortOrder', 'desc');

    // Create a NEW component fixture after saving the preference.
    // This is important because the shared beforeEach() fixture
    // has already executed ngOnInit().
    const newFixture = TestBed.createComponent(TodoListComponent);

    // Get the component instance from the new fixture.
    const newComponent = newFixture.componentInstance;

    /// B. Verify the initial class property
    // Assert: Before initialization, the component uses its
    // class-level default sorting value.
    expect(newComponent.sortOrder).toBe('default');

    /// C. Trigger Angular initialization
    // Act: Trigger the new component's ngOnInit().
    newFixture.detectChanges();

    /// D. Wait for form synchronization
    // Wait for Angular's pending form updates.
    await newFixture.whenStable();

    // Refresh the rendered template.
    newFixture.detectChanges();

    /// E. Verify restored UI state
    // Assert: ngOnInit() automatically restored the saved value.
    expect(newComponent.sortOrder).toBe('desc');

    // Retrieve the sorting dropdown from the NEW fixture.
    const sortSelect: HTMLSelectElement | null =
      newFixture.nativeElement.querySelector('#todo-sort-select');

    // Assert: The dropdown exists.
    expect(sortSelect).not.toBeNull();

    // Assert: The dropdown reflects the restored preference.
    expect(sortSelect?.value).toBe('desc');

    // Assert: Loading the preference did not overwrite storage.
    expect(localStorage.getItem('todoSortOrder')).toBe('desc');

    // Clean up the new component fixture.
    newFixture.destroy();

    // Remove the saved preference.
    localStorage.removeItem('todoSortOrder');
  });

  // 45. Jasmine
  // Lesson 160 - Part 2:
  // Verify that a sorting preference restored during ngOnInit()
  // affects the actual rendered order of Todo items.
  it('should render Todos using the saved sort order during initialization', async () => {
    // Arrange: Create mock Todos in a non-descending order.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16011,
        title: 'Apple Task',
        completed: false,
      }),
      createMockTodo({
        id: 16012,
        title: 'Zebra Task',
        completed: true,
      }),
      createMockTodo({
        id: 16013,
        title: 'Mango Task',
        completed: false,
      }),
    ];

    // Preserve the original Todo data and array order.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    /// A. Mock the TodoService before initializing the new component
    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Mock the service before initializing the new fixture.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    /// B. Save the preference before creating the new fixture
    // Simulate a previously saved Title: Z-A preference.
    localStorage.setItem('todoSortOrder', 'desc');

    // Create a NEW fixture after saving the preference.
    // The shared beforeEach() fixture has already initialized.
    const newFixture = TestBed.createComponent(TodoListComponent);

    // Retrieve the new component instance.
    const newComponent = newFixture.componentInstance;

    /// E. Why use try...finally?. /// The finally block runs even if an assertion throws an error, helping ensure the extra component fixture and saved preference are cleaned up. This is a useful testing habit when working with resources or shared browser state.
    try {
      // Assert: The class initially uses Default sorting.
      expect(newComponent.sortOrder).toBe('default');

      /// C. Let Angular initialize the component
      // Act: Trigger ngOnInit() and automatic preference restoration.
      newFixture.detectChanges();

      // Wait for Angular's pending template-driven form updates.
      await newFixture.whenStable();

      // Refresh the rendered template.
      newFixture.detectChanges();

      // Assert: The saved descending preference was restored.
      expect(newComponent.sortOrder).toBe('desc');

      // Retrieve the actual sorting dropdown.
      const sortSelect: HTMLSelectElement | null =
        newFixture.nativeElement.querySelector('#todo-sort-select');

      // Assert: The dropdown displays Title: Z-A.
      expect(sortSelect?.value).toBe('desc');

      // Retrieve the rendered Todo components.
      const todoItems: HTMLElement[] = Array.from(
        newFixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      // Extract Todo titles in their displayed DOM order.
      const displayedTitles: string[] = todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );

      /// D. Verify the rendered order
      // Assert: Todos appear alphabetically Z-A.
      expect(displayedTitles).toEqual([
        'Zebra Task',
        'Mango Task',
        'Apple Task',
      ]);

      // Assert: All three Todos remain visible.
      expect(todoItems.length).toBe(3);

      // Assert: The source collection was not modified.
      expect(mockTodos).toEqual(originalTodos);

      // Assert: The saved preference remains unchanged.
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');
    } finally {
      // Clean up even if an assertion fails.
      newFixture.destroy();
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 46. Jasmine
  // Lesson 160 - Part 3:
  // Verify that ngOnInit() ignores invalid saved sorting
  // preferences when a new component is initialized.
  it('should ignore invalid saved sorting during initialization', async () => {
    /// A. Save an invalid value before initialization
    // Arrange: Simulate an unsupported saved sorting preference.
    localStorage.setItem('todoSortOrder', 'unknown-sort');

    /// B. Create a fresh Angular component
    // Create a new fixture AFTER storing the invalid value.
    // The shared beforeEach() fixture has already initialized.
    const newFixture = TestBed.createComponent(TodoListComponent);

    // Retrieve the new component instance.
    const newComponent = newFixture.componentInstance;

    try {
      /// D. Check defensive validation
      // Assert: Before ngOnInit(), sorting starts at default.
      expect(newComponent.sortOrder).toBe('default');

      /// C. Trigger initialization
      // Act: Trigger ngOnInit(), which calls loadSortOrder().
      newFixture.detectChanges();

      // Wait for Angular's pending form updates.
      await newFixture.whenStable();

      /// C. Trigger initialization
      // Synchronize the dropdown and component template.
      newFixture.detectChanges();

      // Assert: Invalid sorting was not applied.
      expect(newComponent.sortOrder).toBe('default');

      // Retrieve the sorting dropdown from the new fixture.
      const sortSelect: HTMLSelectElement | null =
        newFixture.nativeElement.querySelector('#todo-sort-select');

      // Assert: The dropdown exists.
      expect(sortSelect).not.toBeNull();

      // Assert: The dropdown still displays Default.
      expect(sortSelect?.value).toBe('default');

      /// E. Verify localStorage behavior
      // Assert: The invalid value remains stored because
      // loadSortOrder() ignores it rather than deleting it.
      expect(localStorage.getItem('todoSortOrder')).toBe('unknown-sort');
    } finally {
      // Always destroy the extra fixture and clear test storage.
      newFixture.destroy();
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 47. Jasmine
  // Lesson 160 - Part 4:
  // Verify that a new TodoListComponent initializes with
  // default sorting when no saved preference exists.
  it('should initialize with default sorting when no preference is saved', async () => {
    /// A. Simulate a first-time user
    // Arrange: Ensure that localStorage contains no
    // previously saved sorting preference.
    localStorage.removeItem('todoSortOrder');

    /// B. Create a new component
    // Create a NEW component fixture.
    // This allows us to test ngOnInit() independently
    // of the fixture created by our shared beforeEach().
    const newFixture = TestBed.createComponent(TodoListComponent);

    // Retrieve the component instance from this new fixture.
    const newComponent = newFixture.componentInstance;

    try {
      // Assert: Before ngOnInit(), the component starts
      // with its class-level default sorting value.
      expect(newComponent.sortOrder).toBe('default');

      // Assert: No saved sorting preference exists.
      expect(localStorage.getItem('todoSortOrder')).toBeNull();

      /// C. Trigger the real lifecycle hook
      // Act: Trigger Angular component initialization.
      // The first detectChanges() calls ngOnInit().
      newFixture.detectChanges();

      // Wait for pending Angular form-binding updates.
      await newFixture.whenStable();

      // Refresh the rendered template.
      newFixture.detectChanges();

      /// D. Verify the default state
      // Assert: The component retains default sorting.
      expect(newComponent.sortOrder).toBe('default');

      // Retrieve the actual sorting dropdown.
      const sortSelect: HTMLSelectElement | null =
        newFixture.nativeElement.querySelector('#todo-sort-select');

      // Assert: The dropdown exists.
      expect(sortSelect).not.toBeNull();

      /// D. Verify the default state
      // Assert: Default sorting is selected.
      expect(sortSelect?.value).toBe('default');

      // Assert: The Reset Sorting button is not visible
      // because the component already uses default sorting.
      const resetButton: HTMLButtonElement | null =
        newFixture.nativeElement.querySelector('.reset-sort');

      expect(resetButton).toBeNull();

      /// E. Verify that initialization doesn't write a preference
      // Assert: Initialization did not create a new
      // localStorage preference automatically.
      expect(localStorage.getItem('todoSortOrder')).toBeNull();
    } finally {
      // Always destroy the additional Angular fixture.
      newFixture.destroy();

      // Keep localStorage clean for other tests.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 48. Jasmine
  // Lesson 161 - Part 1:
  // Verify that a newly initialized component restores
  // Active Tasks First sorting and renders Todos correctly.
  it('should restore active-first sorting in a new component', async () => {
    // Arrange: Create Todos with mixed completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16101,
        title: 'Study Angular',
        completed: true,
      }),
      createMockTodo({
        id: 16102,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 16103,
        title: 'Review Jasmine',
        completed: true,
      }),
      createMockTodo({
        id: 16104,
        title: 'Build Portfolio',
        completed: false,
      }),
    ];

    // Preserve the original Todo data and array order.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Retrieve the shared injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Mock the service before initializing the new component.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    /// A. Save the preference before creating the component
    // Simulate a previously saved sorting preference.
    localStorage.setItem('todoSortOrder', 'active-first');

    // Create a NEW component fixture after saving the preference.
    const newFixture = TestBed.createComponent(TodoListComponent);

    // Access the new component instance.
    const newComponent = newFixture.componentInstance;

    try {
      // Before ngOnInit(), the property should have its default.
      expect(newComponent.sortOrder).toBe('default');

      /// B. Trigger initialization
      // Act: Trigger ngOnInit(), which calls loadSortOrder().
      newFixture.detectChanges();

      // Wait for pending Angular form updates.
      await newFixture.whenStable();

      /// B. Trigger initialization
      // Refresh the rendered template.
      newFixture.detectChanges();

      // Assert: The saved Active-First option was restored.
      expect(newComponent.sortOrder).toBe('active-first');

      // Find the actual sorting dropdown.
      const sortSelect: HTMLSelectElement | null =
        newFixture.nativeElement.querySelector('#todo-sort-select');

      // Assert: The dropdown reflects Active Tasks First.
      expect(sortSelect?.value).toBe('active-first');

      // Retrieve the rendered Todo components.
      const todoItems: HTMLElement[] = Array.from(
        newFixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      // Extract Todo titles in their displayed order.
      const displayedTitles: string[] = todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );

      /// C. Verify the displayed Todo order
      // Assert: Unfinished Todos appear before completed Todos.
      expect(displayedTitles).toEqual([
        'Practice TypeScript',
        'Build Portfolio',
        'Study Angular',
        'Review Jasmine',
      ]);

      // Assert: All four Todos are still displayed.
      expect(todoItems.length).toBe(4);

      /// D. Verify source-data integrity
      // Assert: Sorting did not modify the original collection.
      expect(mockTodos).toEqual(originalTodos);

      // Assert: The saved preference remains unchanged.
      expect(localStorage.getItem('todoSortOrder')).toBe('active-first');
    } finally {
      // Always clean up the extra fixture and saved preference.
      newFixture.destroy();
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 49. Jasmine
  // Lesson 161 - Part 2:
  // Verify that a newly initialized component restores
  // Completed Tasks First sorting and renders Todos correctly.
  it('should restore completed-first sorting in a new component', async () => {
    // Arrange: Create Todos with mixed completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16111,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 16112,
        title: 'Practice TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 16113,
        title: 'Build Portfolio',
        completed: false,
      }),
      createMockTodo({
        id: 16114,
        title: 'Review Jasmine',
        completed: true,
      }),
    ];

    // Preserve the original array order and Todo values.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Retrieve the injected TodoService.
    const todoService = TestBed.inject(TodoService);

    // Mock the service before initializing the new component.
    spyOn(todoService, 'getTodos').and.returnValue(mockTodos);

    /// A. Store the preference before initialization
    // Simulate a previously saved Completed-First preference.
    localStorage.setItem('todoSortOrder', 'completed-first');

    // Create a NEW component after saving the preference.
    const newFixture = TestBed.createComponent(TodoListComponent);

    // Retrieve its component instance.
    const newComponent = newFixture.componentInstance;

    try {
      // Assert: Before ngOnInit(), the class default is selected.
      expect(newComponent.sortOrder).toBe('default');

      /// B. Allow Angular to restore the preference
      // Act: Initialize the new component.
      // The first detectChanges() triggers ngOnInit().
      newFixture.detectChanges();

      // Wait for pending Angular form updates.
      await newFixture.whenStable();

      // Synchronize the rendered template.
      newFixture.detectChanges();

      // Assert: The saved Completed-First option was restored.
      expect(newComponent.sortOrder).toBe('completed-first');

      // Find the actual sorting dropdown.
      const sortSelect: HTMLSelectElement | null =
        newFixture.nativeElement.querySelector('#todo-sort-select');

      // Assert: The dropdown reflects the restored preference.
      expect(sortSelect?.value).toBe('completed-first');

      // Retrieve rendered Todo components in DOM order.
      const todoItems: HTMLElement[] = Array.from(
        newFixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      // Extract their displayed titles.
      const displayedTitles: string[] = todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );

      /// C. Verify the actual displayed order
      // Assert: Completed tasks appear before unfinished tasks.
      expect(displayedTitles).toEqual([
        'Practice TypeScript',
        'Review Jasmine',
        'Study Angular',
        'Build Portfolio',
      ]);

      // Assert: All four Todos remain visible.
      expect(todoItems.length).toBe(4);

      /// D. Protect the original Todo data
      // Assert: The source Todo collection remains unchanged.
      expect(mockTodos).toEqual(originalTodos);

      // Assert: Loading does not overwrite the saved preference.
      expect(localStorage.getItem('todoSortOrder')).toBe('completed-first');
    } finally {
      // Always destroy the extra fixture.
      newFixture.destroy();

      // Prevent the saved preference from affecting other tests.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 50. Jasmine
  // Lesson 161 - Part 3:
  // Verify that a preference saved by one component
  // is restored automatically in another component.
  it('should restore a sort preference saved by another component', async () => {
    // Arrange: Our shared beforeEach() already created
    // and initialized the first component instance.

    // Confirm that no preference was saved initially.
    expect(localStorage.getItem('todoSortOrder')).toBeNull();

    /// A. Save through the component method
    // Step 1: Select Title: A-Z in the first component.
    component.sortOrder = 'asc';

    // Save the preference using the real component method.
    component.saveSortOrder();

    // Assert: The preference was saved successfully.
    expect(localStorage.getItem('todoSortOrder')).toBe('asc');

    /// B. Create another component
    // Step 2: Create a second, independent component instance.
    const secondFixture = TestBed.createComponent(TodoListComponent);

    const secondComponent = secondFixture.componentInstance;

    try {
      /// C. Initialize the second component
      // Assert: The second component starts with its class default.
      expect(secondComponent.sortOrder).toBe('default');

      // Act: Initialize the second component.
      // The first detectChanges() triggers ngOnInit().
      secondFixture.detectChanges();

      // Wait for Angular's pending form updates.
      await secondFixture.whenStable();

      // Synchronize the rendered template.
      secondFixture.detectChanges();

      /// D. Verify independent component state
      // Assert: The second component restored the saved value.
      expect(secondComponent.sortOrder).toBe('asc');

      // Retrieve the second component's sorting dropdown.
      const secondSortSelect: HTMLSelectElement | null =
        secondFixture.nativeElement.querySelector('#todo-sort-select');

      // Assert: The dropdown reflects Title: A-Z.
      expect(secondSortSelect).not.toBeNull();
      expect(secondSortSelect?.value).toBe('asc');

      // Assert: The saved value remains unchanged.
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      /// D. Verify independent component state
      // Assert: The original component still has its selection.
      expect(component.sortOrder).toBe('asc');
    } finally {
      // Clean up the second fixture even if a test assertion fails.
      secondFixture.destroy();

      // Remove saved state so it cannot affect other tests.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 51. Jasmine
  // Lesson 161 - Part 4:
  // Verify that component instances maintain independent
  // sorting states while sharing saved localStorage preferences.
  it('should keep existing component sorting states independent', async () => {
    // Arrange: The shared beforeEach() already initialized
    // our first component (Component A).

    // Make sure this test starts with no saved preference.
    expect(localStorage.getItem('todoSortOrder')).toBeNull();

    /// A. Component instances have independent properties
    // Component A selects and saves ascending sorting.
    component.sortOrder = 'asc';
    component.saveSortOrder();

    // Assert: localStorage now contains the ascending option.
    expect(localStorage.getItem('todoSortOrder')).toBe('asc');

    // Create Component B after the first preference was saved.
    const secondFixture = TestBed.createComponent(TodoListComponent);
    const secondComponent = secondFixture.componentInstance;

    try {
      // Initialize Component B through ngOnInit().
      secondFixture.detectChanges();

      // Wait for Angular's form binding to stabilize.
      await secondFixture.whenStable();
      secondFixture.detectChanges();

      // Assert: Component B restored the ascending preference.
      expect(secondComponent.sortOrder).toBe('asc');

      // Component A changes to descending sorting.
      component.sortOrder = 'desc';

      /// B. localStorage is shared
      // Save the updated preference using Component A.
      component.saveSortOrder();

      // Assert: The shared saved preference was updated.
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');

      // Assert: Component A now uses descending sorting.
      expect(component.sortOrder).toBe('desc');

      // Assert: Component B still uses its own previous state.
      expect(secondComponent.sortOrder).toBe('asc');

      // Verify Component B's dropdown remains on A-Z.
      secondFixture.detectChanges();
      await secondFixture.whenStable();
      secondFixture.detectChanges();

      const secondSelect: HTMLSelectElement | null =
        secondFixture.nativeElement.querySelector('#todo-sort-select');

      expect(secondSelect?.value).toBe('asc');

      /// C. New components restore the latest saved preference
      // Create Component C after the updated preference was saved.
      const thirdFixture = TestBed.createComponent(TodoListComponent);
      const thirdComponent = thirdFixture.componentInstance;

      /// D. Why use nested try...finally?. /// We're creating two additional Angular fixtures inside one test. /// Nested try...finally blocks help ensure that each fixture is destroyed and localStorage is cleaned up, even when an assertion fails. /// This is especially important when testing shared state across multiple component instances.
      try {
        /// C. New components restore the latest saved preference
        // Trigger Component C's initialization.
        thirdFixture.detectChanges();

        // Wait for pending Angular form updates.
        await thirdFixture.whenStable();
        thirdFixture.detectChanges();

        // Assert: Component C restores the latest preference.
        expect(thirdComponent.sortOrder).toBe('desc');

        // Verify Component C's dropdown displays Z-A.
        const thirdSelect: HTMLSelectElement | null =
          thirdFixture.nativeElement.querySelector('#todo-sort-select');

        expect(thirdSelect?.value).toBe('desc');

        // Component B must still retain its own sorting state.
        expect(secondComponent.sortOrder).toBe('asc');

        // The latest saved preference should remain unchanged.
        expect(localStorage.getItem('todoSortOrder')).toBe('desc');
      } finally {
        // Always destroy Component C's fixture.
        thirdFixture.destroy();
      }
    } finally {
      // Always destroy Component B's fixture.
      secondFixture.destroy();

      // Remove shared saved state after testing.
      localStorage.removeItem('todoSortOrder');
    }
  });
});
