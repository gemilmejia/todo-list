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

  // 52. Jasmine
  // Lesson 162 - Part 1:
  // Verify that selecting a sorting option through the real
  // HTML dropdown automatically saves it to localStorage.
  it('should save the selected sort order when the user changes the dropdown', async () => {
    // Arrange: Wait for the existing component's
    // template-driven form to finish initializing.
    await fixture.whenStable();
    fixture.detectChanges();

    // Confirm that the component starts with Default sorting.
    expect(component.sortOrder).toBe('default');

    // Confirm that there is no saved sorting preference.
    expect(localStorage.getItem('todoSortOrder')).toBeNull();

    /// A. Locate the real dropdown
    // Retrieve the actual HTML sorting dropdown.
    const sortSelect: HTMLSelectElement | null =
      fixture.nativeElement.querySelector('#todo-sort-select');

    // Assert: The dropdown exists.
    expect(sortSelect).not.toBeNull();

    // Assert: The dropdown initially displays Default.
    expect(sortSelect?.value).toBe('default');

    /// B. Simulate a user's selection
    // Act: Simulate the user selecting Title: Z-A.
    sortSelect!.value = 'desc';

    // Dispatch a real browser change event.
    sortSelect!.dispatchEvent(new Event('change'));

    /// C. Let Angular process the event
    // Wait for Angular to process ngModel and ngModelChange.
    await fixture.whenStable();

    // Update the template after Angular processes the event.
    fixture.detectChanges();

    /// D. Verify automatic saving
    // Assert: Two-way binding updated the component property.
    expect(component.sortOrder).toBe('desc');

    // Assert: Angular called saveSortOrder() automatically.
    expect(localStorage.getItem('todoSortOrder')).toBe('desc');

    // Assert: The dropdown reflects the new selection.
    expect(sortSelect?.value).toBe('desc');

    // Assert: The Reset Sorting button is now visible.
    const resetButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.reset-sort');

    /// D. Verify automatic saving
    expect(resetButton).not.toBeNull();

    // Clean up the saved preference.
    localStorage.removeItem('todoSortOrder');
  });

  // 53. Jasmine
  // Lesson 162 - Part 2:
  // Verify that multiple sorting changes through the HTML
  // dropdown update both component state and localStorage.
  it('should save each sorting change made through the dropdown', async () => {
    // Arrange: Wait for Angular's form bindings to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the real HTML sorting dropdown.
    const sortSelect: HTMLSelectElement | null =
      fixture.nativeElement.querySelector('#todo-sort-select');

    // Assert: The dropdown exists.
    expect(sortSelect).not.toBeNull();

    // Verify the initial component and storage state.
    expect(component.sortOrder).toBe('default');
    expect(localStorage.getItem('todoSortOrder')).toBeNull();

    /// A. Define a sequence of test values
    // Define the sequence of user selections.
    const sortChanges = ['asc', 'desc', 'active-first'] as const;

    try {
      /// B. Loop through each selection
      // Act: Simulate each dropdown change, one at a time.
      for (const sortOrder of sortChanges) {
        ///C. Simulate real dropdown changes
        // Change the native dropdown's selected value.
        sortSelect!.value = sortOrder;

        // Dispatch the browser event that Angular listens for.
        sortSelect!.dispatchEvent(new Event('change'));

        // Wait for Angular to process the change.
        await fixture.whenStable();

        // Refresh the component's rendered template.
        fixture.detectChanges();

        /// D. Test each change immediately
        // Assert: The component reflects the latest selection.
        expect(component.sortOrder).toBe(sortOrder);

        // Assert: localStorage contains the latest preference.
        expect(localStorage.getItem('todoSortOrder')).toBe(sortOrder);

        // Assert: The dropdown displays the selected option.
        expect(sortSelect!.value).toBe(sortOrder);

        // Assert: Reset Sorting is available for non-default values.
        const resetButton: HTMLButtonElement | null =
          fixture.nativeElement.querySelector('.reset-sort');

        expect(resetButton).not.toBeNull();
      }

      // Assert: The final preference remains the latest selection.
      expect(component.sortOrder).toBe('active-first');

      /// E. Verify the final preference
      expect(localStorage.getItem('todoSortOrder')).toBe('active-first');
    } finally {
      // Clean up saved state even if an assertion fails.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 54. Jasmine
  // Lesson 162 - Part 3:
  // Verify that a preference selected through the actual
  // dropdown is restored when another component initializes.
  it('should restore a dropdown-selected preference in a new component', async () => {
    // Arrange: Wait for Component A's form binding to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Confirm the original component starts with Default sorting.
    expect(component.sortOrder).toBe('default');

    // Confirm no sorting preference has been saved.
    expect(localStorage.getItem('todoSortOrder')).toBeNull();

    // Retrieve Component A's real HTML sorting dropdown.
    const firstSelect: HTMLSelectElement | null =
      fixture.nativeElement.querySelector('#todo-sort-select');

    // Assert: The dropdown exists and starts at Default.
    expect(firstSelect).not.toBeNull();
    expect(firstSelect?.value).toBe('default');

    /// A. Simulate a real user's selection
    // Act: Simulate the user selecting Completed Tasks First.
    firstSelect!.value = 'completed-first';

    // Trigger Angular's ngModel and ngModelChange bindings.
    firstSelect!.dispatchEvent(new Event('change'));

    // Wait for Angular to process the dropdown event.
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert: Component A now uses Completed-First sorting.
    expect(component.sortOrder).toBe('completed-first');

    // Assert: The dropdown interaction saved the preference.
    expect(localStorage.getItem('todoSortOrder')).toBe('completed-first');

    /// B. Create a second component
    // Create Component B AFTER the preference was saved.
    const secondFixture = TestBed.createComponent(TodoListComponent);

    // Retrieve the second component instance.
    const secondComponent = secondFixture.componentInstance;

    try {
      /// C. Trigger the real initialization process
      // Before initialization, Component B has its class default.
      expect(secondComponent.sortOrder).toBe('default');

      // Act: Initialize Component B.
      // Angular triggers ngOnInit() on the first detectChanges().
      secondFixture.detectChanges();

      // Wait for form-binding updates.
      await secondFixture.whenStable();

      // Refresh Component B's rendered template.
      secondFixture.detectChanges();

      /// D. Verify the restored dropdown
      // Assert: Component B automatically restored the preference.
      expect(secondComponent.sortOrder).toBe('completed-first');

      // Retrieve Component B's sorting dropdown.
      const secondSelect: HTMLSelectElement | null =
        secondFixture.nativeElement.querySelector('#todo-sort-select');

      // Assert: The new dropdown exists.
      expect(secondSelect).not.toBeNull();

      /// D. Verify the restored dropdown
      // Assert: The new dropdown displays Completed Tasks First.
      expect(secondSelect?.value).toBe('completed-first');

      // Assert: The saved preference remains unchanged.
      expect(localStorage.getItem('todoSortOrder')).toBe('completed-first');

      // Assert: Component A still retains its own selected value.
      expect(component.sortOrder).toBe('completed-first');
    } finally {
      // Clean up Component B's extra fixture.
      secondFixture.destroy();

      // Remove the preference so other tests are unaffected.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 55. Jasmine
  // Lesson 162 - Part 4:
  // Verify that selecting a sorting option through the
  // real dropdown and clicking Reset Sorting restores
  // the default state and updates localStorage.
  it('should reset sorting after a real dropdown selection', async () => {
    // Arrange: Wait for Angular's form controls to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Confirm that the component starts with Default sorting.
    expect(component.sortOrder).toBe('default');

    // Confirm that no saved sorting preference exists.
    expect(localStorage.getItem('todoSortOrder')).toBeNull();

    // Retrieve the real HTML sorting dropdown.
    const sortSelect: HTMLSelectElement | null =
      fixture.nativeElement.querySelector('#todo-sort-select');

    // Assert: The dropdown exists.
    expect(sortSelect).not.toBeNull();

    // Assert: The dropdown initially displays Default.
    expect(sortSelect?.value).toBe('default');

    try {
      /// A. Simulate the dropdown change
      // STEP 1: Simulate the user selecting Title: Z-A.
      sortSelect!.value = 'desc';

      // Dispatch the native browser change event.
      sortSelect!.dispatchEvent(new Event('change'));

      // Wait for Angular to process ngModelChange.
      await fixture.whenStable();
      fixture.detectChanges();

      // Assert: The component changed to descending sorting.
      expect(component.sortOrder).toBe('desc');

      // Assert: The preference was automatically saved.
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');

      // Assert: The dropdown displays Title: Z-A.
      expect(sortSelect!.value).toBe('desc');

      /// B. Retrieve the Reset Sorting button
      // STEP 2: Locate the Reset Sorting button.
      const resetButton: HTMLButtonElement | null =
        fixture.nativeElement.querySelector('.reset-sort');

      // Assert: The Reset Sorting button is visible.
      expect(resetButton).not.toBeNull();

      /// C. Simulate a real button click
      // STEP 3: Simulate the user clicking Reset Sorting.
      resetButton!.click();

      // Allow Angular to process the click event.
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      /// D. Verify component, HTML, and storage state
      // Assert: The component returned to Default sorting.
      expect(component.sortOrder).toBe('default');

      // Assert: The dropdown returned to Default order.
      expect(sortSelect!.value).toBe('default');

      // Assert: resetSortOrder() saved the default preference.
      expect(localStorage.getItem('todoSortOrder')).toBe('default');

      /// E. Verify the Reset Sorting button disappears
      // STEP 4: Verify the Reset Sorting button disappeared.
      const resetButtonAfterClick: HTMLButtonElement | null =
        fixture.nativeElement.querySelector('.reset-sort');

      expect(resetButtonAfterClick).toBeNull();
    } finally {
      // Remove the saved preference to prevent test interference.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 56. Jasmine
  // Lesson 163 - Part 1:
  // Verify that selecting A-Z sorting and clicking the Active
  // filter displays only unfinished Todos in alphabetical order.
  it('should combine dropdown sorting with the active filter', async () => {
    // ARRANGE: Create test Todos with mixed completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16301,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16302,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 16303,
        title: 'Mango Task',
        completed: false,
      }),
      createMockTodo({
        id: 16304,
        title: 'Banana Task',
        completed: false,
      }),
    ];

    // Save a copy to confirm sorting doesn't mutate source data.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    /// A. Mock predictable data
    // Replace TodoService.getTodos() with predictable test data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for the existing component's form bindings.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the actual sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Confirm the starting component state.
    expect(component.sortOrder).toBe('default');
    expect(component.filter).toBe('all');

    try {
      /// B. Trigger sorting through the real dropdown
      // STEP 1: User chooses Title: A-Z.
      sortSelect.value = 'asc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Assert: Angular updated and saved the sorting preference.
      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // STEP 2: Locate the Active filter button.
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      // Find the filter button based on its visible label.
      const activeButton = buttons.find(
        (button) => button.textContent?.trim() === 'Active',
      );

      expect(activeButton).toBeDefined();

      /// C. Click the real filter button
      // STEP 3: Click the actual Active filter button.
      activeButton!.click();

      // Let Angular process the click and update the template.
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Assert: The component switched to Active filtering.
      expect(component.filter).toBe('active');

      // Assert: The selected sorting preference was retained.
      expect(component.sortOrder).toBe('asc');

      // STEP 4: Collect the rendered Todo titles in DOM order.
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      const displayedTitles = todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );

      /// D. Verify combined behavior
      // Assert: Only unfinished tasks remain, sorted A-Z.
      expect(displayedTitles).toEqual([
        'Banana Task',
        'Mango Task',
        'Zebra Task',
      ]);

      // Assert: Exactly three active Todos are displayed.
      expect(todoItems.length).toBe(3);

      /// E. Verify original data remains unchanged
      // Assert: Sorting and filtering did not mutate source data.
      expect(mockTodos).toEqual(originalTodos);

      // Assert: Filtering didn't overwrite the sorting preference.
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');
    } finally {
      // Remove saved state after the test.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 57. Jasmine
  // Lesson 163 - Part 2:
  // Verify that selecting Z-A sorting and clicking the
  // Completed filter displays only finished Todos
  // in descending alphabetical order.
  it('should combine dropdown sorting with the completed filter', async () => {
    // ARRANGE: Create mock Todos with mixed completion states.
    const mockTodos: Todo[] = [
      /// A. Create a mix of completed and unfinished Todos
      createMockTodo({
        id: 16311,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 16312,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16313,
        title: 'Mango Task',
        completed: true,
      }),
      createMockTodo({
        id: 16314,
        title: 'Banana Task',
        completed: true,
      }),
    ];

    // Save a snapshot of the original Todo collection.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Replace TodoService.getTodos() with predictable mock data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form bindings to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the real sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Verify the initial state.
    expect(component.sortOrder).toBe('default');
    expect(component.filter).toBe('all');

    try {
      /// B. Simulate the sorting dropdown
      // STEP 1: Simulate selecting Title: Z-A.
      sortSelect.value = 'desc';

      // Dispatch the browser change event.
      sortSelect.dispatchEvent(new Event('change'));

      // Wait for Angular to update ngModel.
      await fixture.whenStable();
      fixture.detectChanges();

      // Assert: Sorting preference was updated.
      expect(component.sortOrder).toBe('desc');

      // Assert: Sorting preference was saved automatically.
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');

      // STEP 2: Locate the Completed filter button.
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      const completedButton = buttons.find(
        (button) => button.textContent?.trim() === 'Completed',
      );

      // Assert: The Completed button exists.
      expect(completedButton).toBeDefined();

      // STEP 3: Click the Completed filter button.
      completedButton!.click();

      // Let Angular process the click and update the template.
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Assert: Completed filtering is now active.
      expect(component.filter).toBe('completed');

      // Assert: Descending sorting remains selected.
      expect(component.sortOrder).toBe('desc');

      // STEP 4: Read the displayed Todo titles.
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      const displayedTitles: string[] = todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );

      /// D. Check filtering and sorting together
      // Assert: Only completed Todos appear in Z-A order.
      expect(displayedTitles).toEqual([
        'Mango Task',
        'Banana Task',
        'Apple Task',
      ]);

      // Assert: Exactly three completed Todos are visible.
      expect(todoItems.length).toBe(3);

      /// E. Verify data integrity
      // Assert: Filtering and sorting did not mutate source data.
      expect(mockTodos).toEqual(originalTodos);

      // Assert: Filtering did not overwrite saved sorting.
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');
    } finally {
      // Always remove saved sorting preferences after testing.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 58. Jasmine
  // Lesson 163 - Part 3:
  // Verify that changing the sorting dropdown and typing into
  // the real search input displays matching Todos in A-Z order.
  it('should combine dropdown sorting with a real search input', async () => {
    // ARRANGE: Create predictable mock Todo data.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16321,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16322,
        title: 'Apple Task',
        completed: false,
      }),
      createMockTodo({
        id: 16323,
        title: 'Mango Task',
        completed: true,
      }),
      createMockTodo({
        id: 16324,
        title: 'Buy Groceries',
        completed: false,
      }),
    ];

    // Preserve the original collection for comparison.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Mock the service's Todo collection.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form controls to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Find the sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    /// A. Find the actual search input
    // Find the search input by its ngModel binding.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement | null;

    // Verify the search input exists before using it.
    expect(searchInput).not.toBeNull();

    // Verify the component's initial state.
    expect(component.sortOrder).toBe('default');
    expect(component.searchTerm).toBe('');
    expect(component.filter).toBe('all');

    try {
      // STEP 1: User chooses Title: A-Z.
      sortSelect.value = 'asc';

      // Trigger Angular's sorting dropdown binding.
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify sorting was selected and persisted.
      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      /// B. Simulate typing into the input
      // STEP 2: User types "task" into the search input.
      searchInput!.value = 'task';

      // Trigger Angular's input binding.
      searchInput!.dispatchEvent(new Event('input'));

      /// C. Wait for Angular to process the input
      await fixture.whenStable();
      fixture.detectChanges();

      // Verify Angular updated the search property.
      expect(component.searchTerm).toBe('task');

      // Verify sorting remains selected.
      expect(component.sortOrder).toBe('asc');

      // STEP 3: Read the Todo titles currently rendered.
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      const displayedTitles: string[] = todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );

      /// D. Verify the combined search and sorting result
      // ASSERT: Search results appear alphabetically A-Z.
      expect(displayedTitles).toEqual([
        'Apple Task',
        'Mango Task',
        'Zebra Task',
      ]);

      // Only matching Todos should be visible.
      expect(todoItems.length).toBe(3);

      // Searching and sorting must not change the source data.
      expect(mockTodos).toEqual(originalTodos);

      /// E. Verify existing preferences remain unchanged.
      // Searching must not overwrite the saved sorting preference.
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');
    } finally {
      // Clean up test storage even if an assertion fails.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 59. Jasmine
  // Lesson 163 - Part 4:
  // Verify that real sorting, filtering, and searching
  // controls work together to display the correct Todos.
  it('should combine sorting filtering and searching through UI controls', async () => {
    // ARRANGE: Create test Todos with different titles
    // and completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16331,
        title: 'Apple Task',
        completed: false,
      }),
      createMockTodo({
        id: 16332,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16333,
        title: 'Mango Task',
        completed: true,
      }),
      createMockTodo({
        id: 16334,
        title: 'Banana Task',
        completed: false,
      }),
      createMockTodo({
        id: 16335,
        title: 'Buy Groceries',
        completed: false,
      }),
    ];

    // Preserve the original Todo collection.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    /// A. Mock the TodoService
    // Mock the injected service to return predictable Todo data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form bindings to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the actual HTML sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Retrieve the actual search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement | null;

    // Verify that both controls exist.
    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Verify the initial component state.
    expect(component.sortOrder).toBe('default');
    expect(component.filter).toBe('all');
    expect(component.searchTerm).toBe('');

    try {
      /// B. Change sorting through the dropdown
      // STEP 1: Simulate selecting Title: Z-A.
      sortSelect.value = 'desc';

      // Dispatch the native change event.
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Assert: Descending sorting is selected and saved.
      expect(component.sortOrder).toBe('desc');
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');

      // STEP 2: Locate the real Active filter button.
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      const activeButton = buttons.find(
        (button) => button.textContent?.trim() === 'Active',
      );

      // Assert: The Active button exists.
      expect(activeButton).toBeDefined();

      /// C. Click the real filter button
      // Click the Active filter button.
      activeButton!.click();

      // Update Angular's component and template.
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Assert: Active filtering is selected.
      expect(component.filter).toBe('active');

      // Assert: Sorting remains descending.
      expect(component.sortOrder).toBe('desc');

      /// D. Type into the real search input
      // STEP 3: Simulate typing "task" into the search box.
      searchInput!.value = 'task';

      // Dispatch a native input event.
      searchInput!.dispatchEvent(new Event('input'));

      // Wait for ngModel to update searchTerm.
      await fixture.whenStable();
      fixture.detectChanges();

      // Assert: Angular updated the search term.
      expect(component.searchTerm).toBe('task');

      // Assert: Other selected options remain unchanged.
      expect(component.sortOrder).toBe('desc');
      expect(component.filter).toBe('active');

      // STEP 4: Retrieve the currently rendered Todo items.
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      // Extract their titles in displayed DOM order.
      const displayedTitles: string[] = todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );

      /// E. Verify all three features together
      // ASSERT: Only active matching Todos appear in Z-A order.
      expect(displayedTitles).toEqual([
        'Zebra Task',
        'Banana Task',
        'Apple Task',
      ]);

      // Exactly three matching active Todos should be visible.
      expect(todoItems.length).toBe(3);

      // Filtering, searching, and sorting must not mutate
      // the original Todo collection.
      expect(mockTodos).toEqual(originalTodos);

      // Confirm that search/filter interactions did not
      // overwrite the saved sorting preference.
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');
    } finally {
      // Always clear the saved sorting preference.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 60. Jasmine
  // Lesson 164 - Part 1:
  // Verify that changing the search text updates the
  // displayed Todos while preserving A-Z sorting.
  it('should preserve ascending sorting while the search term changes', async () => {
    // ARRANGE: Create five Todos with different titles.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16401,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16402,
        title: 'Apple Task',
        completed: false,
      }),
      createMockTodo({
        id: 16403,
        title: 'Mango Task',
        completed: true,
      }),
      createMockTodo({
        id: 16404,
        title: 'Buy Groceries',
        completed: false,
      }),
      createMockTodo({
        id: 16405,
        title: 'Banana Task',
        completed: false,
      }),
    ];

    // Preserve the original Todo data.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Return predictable data from TodoService.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Allow Angular's form bindings to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Locate the real sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Locate the real search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    // Assert that both controls exist.
    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Verify the initial state.
    expect(component.sortOrder).toBe('default');
    expect(component.searchTerm).toBe('');

    try {
      // STEP 1: Select Title: A-Z through the dropdown.
      sortSelect.value = 'asc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Confirm that Angular selected and saved A-Z sorting.
      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      /// A. Use test cases instead of repeating code
      // Define several search scenarios.
      const searchCases = [
        {
          term: 'task',
          expectedTitles: [
            'Apple Task',
            'Banana Task',
            'Mango Task',
            'Zebra Task',
          ],
        },
        {
          term: 'banana',
          expectedTitles: ['Banana Task'],
        },
        {
          term: '',
          expectedTitles: [
            'Apple Task',
            'Banana Task',
            'Buy Groceries',
            'Mango Task',
            'Zebra Task',
          ],
        },
      ];

      // STEP 2: Simulate each search input change.
      for (const searchCase of searchCases) {
        /// B. Simulate typing and deleting search text
        // Update the actual search input value.
        searchInput.value = searchCase.term;

        // Dispatch a real browser input event.
        searchInput.dispatchEvent(new Event('input'));

        // Wait for Angular to update ngModel and the template.
        await fixture.whenStable();
        fixture.detectChanges();

        // Assert that Angular received the new search term.
        expect(component.searchTerm).toBe(searchCase.term);

        // Retrieve currently rendered Todo components.
        const todoItems: HTMLElement[] = Array.from(
          fixture.nativeElement.querySelectorAll('app-todo-item'),
        );

        // Extract their titles in displayed order.
        const displayedTitles = todoItems.map(
          (item) =>
            item.querySelector('.todo-title')?.textContent?.trim() ?? '',
        );

        /// C. Verify results after every change
        // Verify the correct search results and alphabetical order.
        expect(displayedTitles).toEqual(searchCase.expectedTitles);

        /// D. Preserve the selected sorting preference
        // Verify A-Z sorting was preserved after each search change.
        expect(component.sortOrder).toBe('asc');

        // Verify the sorting dropdown still displays A-Z.
        expect(sortSelect.value).toBe('asc');

        // Verify searching didn't overwrite localStorage.
        expect(localStorage.getItem('todoSortOrder')).toBe('asc');

        // Verify the number of rendered Todos matches expectations.
        expect(todoItems.length).toBe(searchCase.expectedTitles.length);
      }

      /// E. Protect the original Todo collection
      // Assert that processing did not modify the source data.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Clean up the saved sorting preference.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 61. Jasmine
  // Lesson 164 - Part 2:
  // Verify that switching between Active, Completed,
  // and All filters preserves descending sorting.
  it('should preserve descending sorting while switching filters', async () => {
    // ARRANGE: Create five Todos with mixed completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16411,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16412,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 16413,
        title: 'Mango Task',
        completed: false,
      }),
      createMockTodo({
        id: 16414,
        title: 'Banana Task',
        completed: true,
      }),
      createMockTodo({
        id: 16415,
        title: 'Cherry Task',
        completed: false,
      }),
    ];

    // Save a copy to verify the source data remains unchanged.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Replace getTodos() with our predictable mock data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form bindings to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Locate the real sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Verify the dropdown exists.
    expect(sortSelect).not.toBeNull();

    // Verify the initial component state.
    expect(component.sortOrder).toBe('default');
    expect(component.filter).toBe('all');

    try {
      /// A. Select descending sorting through the UI
      // STEP 1: Select Title: Z-A using the real dropdown.
      sortSelect.value = 'desc';

      // Trigger Angular's dropdown event binding.
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Assert: Descending sorting is now selected and saved.
      expect(component.sortOrder).toBe('desc');
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');

      /// B. Use data-driven tests for multiple filters
      // STEP 2: Define several filter changes and expected results.
      const filterCases = [
        {
          label: 'Active',
          filter: 'active',
          expectedTitles: ['Zebra Task', 'Mango Task', 'Cherry Task'],
        },
        {
          label: 'Completed',
          filter: 'completed',
          expectedTitles: ['Banana Task', 'Apple Task'],
        },
        {
          label: 'All',
          filter: 'all',
          expectedTitles: [
            'Zebra Task',
            'Mango Task',
            'Cherry Task',
            'Banana Task',
            'Apple Task',
          ],
        },
      ] as const;

      // STEP 3: Test each filter through the real HTML buttons.
      for (const filterCase of filterCases) {
        // Retrieve all buttons currently rendered by the component.
        const buttons: HTMLButtonElement[] = Array.from(
          fixture.nativeElement.querySelectorAll('button'),
        );

        // Locate the filter button using its visible label.
        const filterButton = buttons.find(
          (button) => button.textContent?.trim() === filterCase.label,
        );

        // Assert: The requested filter button exists.
        expect(filterButton).toBeDefined();

        /// C. Click the real filter button
        // Simulate the user clicking the filter button.
        filterButton!.click();

        // Allow Angular to update the component and template.
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // Assert: The selected filter was applied.
        expect(component.filter).toBe(filterCase.filter);

        // Retrieve the Todo components rendered after filtering.
        const todoItems: HTMLElement[] = Array.from(
          fixture.nativeElement.querySelectorAll('app-todo-item'),
        );

        // Extract the displayed Todo titles in DOM order.
        const displayedTitles = todoItems.map(
          (item) =>
            item.querySelector('.todo-title')?.textContent?.trim() ?? '',
        );

        /// D. Verify that the correct Todos are displayed
        // Assert: The correct Todos appear in Z-A order.
        expect(displayedTitles).toEqual([...filterCase.expectedTitles]);

        // Assert: The rendered Todo count is correct.
        expect(todoItems.length).toBe(filterCase.expectedTitles.length);

        /// E. Verify sorting is preserved
        // Assert: Filtering did not reset the sorting state.
        expect(component.sortOrder).toBe('desc');

        // Assert: The dropdown still displays Title: Z-A.
        expect(sortSelect.value).toBe('desc');

        // Assert: localStorage still contains the saved preference.
        expect(localStorage.getItem('todoSortOrder')).toBe('desc');
      }

      // STEP 4: Verify filtering/sorting did not modify source data.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Remove test storage even if an assertion fails.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 62. Jasmine
  // Lesson 164 - Part 3:
  // Verify that clearing the search through the UI preserves
  // the Active filter and ascending sorting preference.
  it('should clear search without resetting the selected filter or sorting', async () => {
    // ARRANGE: Create five mock Todos with mixed completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16421,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16422,
        title: 'Apple Task',
        completed: false,
      }),
      createMockTodo({
        id: 16423,
        title: 'Mango Task',
        completed: true,
      }),
      createMockTodo({
        id: 16424,
        title: 'Banana Task',
        completed: false,
      }),
      createMockTodo({
        id: 16425,
        title: 'Apple Pie',
        completed: true,
      }),
    ];

    // Keep a snapshot to verify that the source is unchanged.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Mock TodoService to return our predictable test data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form controls to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the actual sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Retrieve the actual search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    try {
      // STEP 1: Select Title: A-Z.
      sortSelect.value = 'asc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // STEP 2: Click the real Active filter button.
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      const activeButton = buttons.find(
        (button) => button.textContent?.trim() === 'Active',
      );

      expect(activeButton).toBeDefined();
      activeButton!.click();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.filter).toBe('active');

      /// A. Search through the actual input
      // STEP 3: Search for "apple" through the real input.
      searchInput.value = 'apple';
      searchInput.dispatchEvent(new Event('input'));

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.searchTerm).toBe('apple');

      // Verify that only the matching active Todo is displayed.
      const beforeClear: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      const titlesBeforeClear = beforeClear.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );

      expect(titlesBeforeClear).toEqual(['Apple Task']);

      /// B. Find the Clear Search button
      // STEP 4: Find the specific Clear Search button.
      // Do not accidentally select the Clear Completed button.
      const clearButton = (
        Array.from(
          fixture.nativeElement.querySelectorAll('button'),
        ) as HTMLButtonElement[]
      ).find(
        (button) =>
          button.textContent?.trim().toLowerCase().includes('clear search'), // we change from "clear" to "clear search".
      );

      // Verify that the correct button exists.
      expect(clearButton).toBeDefined();

      /// C. Click the button
      // Simulate clicking the actual Clear Search button.
      clearButton!.click();

      // Wait for Angular to update component state and the UI.
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      /// D. Verify that search is cleared
      // ASSERT: The search text is cleared.
      expect(component.searchTerm).toBe('');
      expect(searchInput.value).toBe('');

      /// E. Verify that filter and sorting remain unchanged
      // ASSERT: The Active filter is preserved.
      expect(component.filter).toBe('active');

      // ASSERT: Ascending sorting is preserved.
      expect(component.sortOrder).toBe('asc');
      expect(sortSelect.value).toBe('asc');

      // Read the Todos displayed after clearing the search.
      const afterClear: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      const titlesAfterClear = afterClear.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );

      // All active Todos return, still sorted A-Z.
      expect(titlesAfterClear).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      expect(afterClear.length).toBe(3);

      // The original Todo collection must remain unchanged.
      expect(mockTodos).toEqual(originalTodos);

      // Clearing search must not overwrite the saved sort option.
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');
    } finally {
      // Remove test storage even if an assertion fails.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 63. Jasmine
  // Lesson 164 - Part 4:
  // Verify that dynamically changing sorting, filtering,
  // and searching updates displayed Todos correctly.
  it('should dynamically update sorting filtering and searching in one session', async () => {
    // ARRANGE: Create predictable mock Todo data.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16431,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16432,
        title: 'Apple Task',
        completed: false,
      }),
      createMockTodo({
        id: 16433,
        title: 'Mango Task',
        completed: true,
      }),
      createMockTodo({
        id: 16434,
        title: 'Banana Task',
        completed: false,
      }),
      createMockTodo({
        id: 16435,
        title: 'Cherry Task',
        completed: true,
      }),
    ];

    // Preserve the original source data and ordering.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Make TodoService return our test data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular form controls to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Get the actual HTML controls.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    // Verify both controls exist.
    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    /// A. Helper functions inside a Jasmine test
    // Helper: Read Todo titles from the rendered HTML.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    /// B. Asynchronous helpers
    // Helper: Click a filter button by its visible label.
    const clickFilter = async (label: string): Promise<void> => {
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      const button = buttons.find((item) => item.textContent?.trim() === label);

      expect(button).toBeDefined();

      button!.click();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    // Helper: Change the sorting dropdown through its real event.
    const changeSort = async (value: string): Promise<void> => {
      sortSelect.value = value;
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();
    };

    // Helper: Type into the actual search input.
    const changeSearch = async (value: string): Promise<void> => {
      searchInput.value = value;
      searchInput.dispatchEvent(new Event('input'));

      await fixture.whenStable();
      fixture.detectChanges();
    };

    try {
      // STEP 1: Select ascending sorting.
      await changeSort('asc');

      expect(component.sortOrder).toBe('asc');
      expect(getDisplayedTitles()).toEqual([
        'Apple Task',
        'Banana Task',
        'Cherry Task',
        'Mango Task',
        'Zebra Task',
      ]);

      // STEP 2: Click Active.
      await clickFilter('Active');

      expect(component.filter).toBe('active');
      expect(getDisplayedTitles()).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      // STEP 3: Search for "task".
      await changeSearch('task');

      expect(component.searchTerm).toBe('task');
      expect(component.filter).toBe('active');
      expect(component.sortOrder).toBe('asc');

      expect(getDisplayedTitles()).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      /// D. Why verify results after every interaction?
      // STEP 4: Change sorting to descending.
      await changeSort('desc');

      expect(component.sortOrder).toBe('desc');
      expect(component.filter).toBe('active');
      expect(component.searchTerm).toBe('task');

      /// D. Why verify results after every interaction?
      expect(getDisplayedTitles()).toEqual([
        'Zebra Task',
        'Banana Task',
        'Apple Task',
      ]);

      // STEP 5: Switch from Active to Completed.
      await clickFilter('Completed');

      expect(component.filter).toBe('completed');
      expect(component.sortOrder).toBe('desc');
      expect(component.searchTerm).toBe('task');

      expect(getDisplayedTitles()).toEqual(['Mango Task', 'Cherry Task']);

      // STEP 6: Clear the search through the input.
      await changeSearch('');

      expect(component.searchTerm).toBe('');
      expect(component.filter).toBe('completed');
      expect(component.sortOrder).toBe('desc');

      expect(getDisplayedTitles()).toEqual(['Mango Task', 'Cherry Task']);

      // Verify that the latest sorting preference was saved.
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');

      // Verify that the dropdown reflects the latest selection.
      expect(sortSelect.value).toBe('desc');

      // Verify that no original Todo data was modified.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Ensure this test doesn't affect other tests.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 64. Jasmine
  // Lesson 165 - Part 1:
  // Verify that searching for a nonexistent Todo returns
  // an empty rendered list without resetting sorting.
  it('should show no Todos when a search has no matches', async () => {
    // ARRANGE: Create predictable Todo test data.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16501,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16502,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 16503,
        title: 'Banana Task',
        completed: false,
      }),
    ];

    // Preserve the original Todo data and order.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Mock TodoService to return our test data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form bindings to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Find the actual sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Find the actual search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    // Verify that both elements exist.
    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Verify the component starts with default settings.
    expect(component.sortOrder).toBe('default');
    expect(component.searchTerm).toBe('');
    expect(component.filter).toBe('all');

    try {
      // STEP 1: Select Title: A-Z through the real dropdown.
      sortSelect.value = 'asc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Confirm that sorting changed and was saved.
      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // Verify the Todos are initially visible in A-Z order.
      /// Retrieve the rendered Todo components as HTML elements.
      const initialTodoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      // Extract the Todo titles from those elements.
      const initialTitles: string[] = initialTodoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );

      expect(initialTitles).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      // STEP 2: Search for a title that doesn't exist.
      searchInput.value = 'pineapple';

      // Trigger Angular's input event binding.
      searchInput.dispatchEvent(new Event('input'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Assert: Angular received the search term.
      expect(component.searchTerm).toBe('pineapple');

      // STEP 3: Find all Todo items currently rendered.
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      /// B. Why test both filteredTodos and the HTML?
      // Assert: No Todo items match the search.
      expect(todoItems.length).toBe(0);

      // Assert: The computed filtered list is also empty.
      expect(component.filteredTodos).toEqual([]);

      /// C. Why preserve sorting during an empty search?
      // Assert: Sorting is still ascending.
      expect(component.sortOrder).toBe('asc');

      // Assert: The dropdown still displays Title: A-Z.
      expect(sortSelect.value).toBe('asc');

      // Assert: The All filter was not changed.
      expect(component.filter).toBe('all');

      // Assert: Searching didn't overwrite saved sorting.
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      /// D. Why check the source collection?
      // Assert: The original Todo data remains unchanged.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Clean up saved sorting state after this test.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 65. Jasmine
  // Lesson 165 - Part 2:
  // Verify that the Todo list recovers when a user replaces
  // a search term that previously produced no results.
  it('should recover from empty search results when the search term changes', async () => {
    // ARRANGE: Create three predictable Todo items.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16511,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16512,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 16513,
        title: 'Banana Task',
        completed: false,
      }),
    ];

    // Preserve the original Todo collection.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Mock the service so our test receives known Todo data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form controls to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the actual sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Retrieve the actual search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    // Verify that both controls exist.
    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Helper: Get the currently displayed Todo titles.
    const getDisplayedTitles = (): string[] => {
      // Explicitly type the HTML elements to avoid TS2345.
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      // Extract the text of each Todo title.
      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    try {
      // STEP 1: Select ascending sorting through the dropdown.
      sortSelect.value = 'asc';

      // Trigger Angular's ngModel and ngModelChange bindings.
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Assert: Ascending sorting was selected and saved.
      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // Assert: Initially, all three Todos are visible in A-Z order.
      expect(getDisplayedTitles()).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      /// A. Empty results do not delete Todos. /// When the user searches for: Your processing pipeline returns: "[]"
      // STEP 2: Search for a nonexistent Todo.
      searchInput.value = 'pineapple';

      // Simulate the user typing into the search input.
      searchInput.dispatchEvent(new Event('input'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Assert: The component received the search term.
      expect(component.searchTerm).toBe('pineapple');

      // Assert: No Todos match the search.
      expect(getDisplayedTitles()).toEqual([]);
      expect(component.filteredTodos).toEqual([]);

      // Assert: Sorting was preserved while results were empty.
      expect(component.sortOrder).toBe('asc');

      /// C. Trigger the actual input event
      // STEP 3: Replace the search term with "task".
      searchInput.value = 'task';

      // Trigger Angular's search binding again.
      searchInput.dispatchEvent(new Event('input'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Assert: The search term was updated correctly.
      expect(component.searchTerm).toBe('task');

      /// D. Verify recovery through the DOM
      // Assert: Matching Todos have returned.
      expect(getDisplayedTitles()).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      // Assert: Exactly three Todo items are visible again.
      expect(
        fixture.nativeElement.querySelectorAll('app-todo-item').length,
      ).toBe(3);

      /// E. Preserve unrelated component state
      // Assert: The selected sorting preference is unchanged.
      expect(component.sortOrder).toBe('asc');
      expect(sortSelect.value).toBe('asc');

      // Assert: The filter remains All.
      expect(component.filter).toBe('all');

      // Assert: localStorage retains ascending sorting.
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // Assert: Search recovery didn't modify the original Todos.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Always clean up saved sorting preferences.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 66. Jasmine
  // Lesson 165 - Part 3:
  // Verify that an empty Completed filter can recover when
  // the user switches to Active without resetting sorting.
  it('should recover from empty completed filter results', async () => {
    /// A. Why use only unfinished Todos?
    // ARRANGE: Create three Todos that are all unfinished.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16521,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16522,
        title: 'Apple Task',
        completed: false,
      }),
      createMockTodo({
        id: 16523,
        title: 'Banana Task',
        completed: false,
      }),
    ];

    // Preserve a snapshot of the original Todo collection.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Make TodoService return our predictable test data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form controls to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the actual sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Verify the dropdown exists.
    expect(sortSelect).not.toBeNull();

    // Helper: Retrieve displayed Todo titles from the DOM.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Helper: Find and click a filter button by its label.
    const clickFilter = async (label: string): Promise<void> => {
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      const filterButton = buttons.find(
        (button) => button.textContent?.trim() === label,
      );

      expect(filterButton).toBeDefined();

      filterButton!.click();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    try {
      // STEP 1: Select Title: A-Z through the real dropdown.
      sortSelect.value = 'asc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Assert: Ascending sorting was selected and saved.
      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // Assert: Initially, all Todos appear in A-Z order.
      expect(getDisplayedTitles()).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      /// B. Test the real filter button
      // STEP 2: Select the Completed filter.
      await clickFilter('Completed');

      // Assert: Completed filtering is now selected.
      expect(component.filter).toBe('completed');

      /// C. Verify an empty rendered list
      // Assert: No completed Todos are available.
      expect(getDisplayedTitles()).toEqual([]);

      // Assert: The component's processed list is empty.
      expect(component.filteredTodos).toEqual([]);

      // Assert: Sorting was not reset by the empty result.
      expect(component.sortOrder).toBe('asc');
      expect(sortSelect.value).toBe('asc');

      /// D. Recover using another filter
      // STEP 3: Switch to the Active filter.
      await clickFilter('Active');

      // Assert: Active filtering was selected.
      expect(component.filter).toBe('active');

      // Assert: All unfinished Todos reappear in A-Z order.
      expect(getDisplayedTitles()).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      // Assert: Exactly three Todos are visible.
      expect(
        fixture.nativeElement.querySelectorAll('app-todo-item').length,
      ).toBe(3);

      // Assert: The search term was not changed.
      expect(component.searchTerm).toBe('');

      /// E. Verify sorting survives both filter changes
      // Assert: Ascending sorting remains selected.
      expect(component.sortOrder).toBe('asc');
      expect(sortSelect.value).toBe('asc');

      // Assert: The saved preference was preserved.
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // Assert: Filtering did not modify the source data.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Always clear the saved sorting preference.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 67. Jasmine
  // Lesson 165 - Part 4:
  // Verify recovery from an empty result caused by
  // combining searching and filtering.
  it('should recover from combined empty search and filter results', async () => {
    // ARRANGE: Create Todos with different completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16531,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16532,
        title: 'Apple Task',
        completed: false,
      }),
      createMockTodo({
        id: 16533,
        title: 'Banana Task',
        completed: true,
      }),
      createMockTodo({
        id: 16534,
        title: 'Mango Task',
        completed: true,
      }),
      createMockTodo({
        id: 16535,
        title: 'Buy Groceries',
        completed: false,
      }),
    ];

    // Preserve the original data and array order.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Mock TodoService to return our predictable Todo data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular form bindings to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the actual HTML sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Retrieve the actual HTML search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    // Confirm that both controls exist.
    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Helper: Get Todo titles in their rendered order.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Helper: Click a filter button using its visible label.
    const clickFilter = async (label: string): Promise<void> => {
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      const filterButton = buttons.find(
        (button) => button.textContent?.trim() === label,
      );

      expect(filterButton).toBeDefined();

      filterButton!.click();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    // Helper: Update the actual search input.
    const changeSearch = async (value: string): Promise<void> => {
      searchInput.value = value;
      searchInput.dispatchEvent(new Event('input'));

      await fixture.whenStable();
      fixture.detectChanges();
    };

    try {
      // STEP 1: Select Title: Z-A.
      sortSelect.value = 'desc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify descending sorting was selected and saved.
      expect(component.sortOrder).toBe('desc');
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');

      // Verify all Todos initially appear in Z-A order.
      expect(getDisplayedTitles()).toEqual([
        'Zebra Task',
        'Mango Task',
        'Buy Groceries',
        'Banana Task',
        'Apple Task',
      ]);

      // STEP 2: Click Completed.
      await clickFilter('Completed');

      expect(component.filter).toBe('completed');

      // Only completed tasks appear, still in Z-A order.
      expect(getDisplayedTitles()).toEqual(['Mango Task', 'Banana Task']);

      // STEP 3: Search for "apple".
      await changeSearch('apple');

      expect(component.searchTerm).toBe('apple');

      // Apple Task exists but is not completed.
      // Therefore, the combined result must be empty.
      expect(getDisplayedTitles()).toEqual([]);
      expect(component.filteredTodos).toEqual([]);

      // Sorting remains unchanged despite the empty result.
      expect(component.sortOrder).toBe('desc');
      expect(sortSelect.value).toBe('desc');

      // STEP 4: Switch to Active without changing the search.
      await clickFilter('Active');

      expect(component.filter).toBe('active');
      expect(component.searchTerm).toBe('apple');

      // Apple Task now appears because it is unfinished.
      expect(getDisplayedTitles()).toEqual(['Apple Task']);

      // STEP 5: Clear the search through the real input.
      await changeSearch('');

      expect(component.searchTerm).toBe('');

      // All active tasks return in Z-A order.
      expect(getDisplayedTitles()).toEqual([
        'Zebra Task',
        'Buy Groceries',
        'Apple Task',
      ]);

      // Confirm that three active Todos are visible.
      expect(
        fixture.nativeElement.querySelectorAll('app-todo-item').length,
      ).toBe(3);

      // Check final component state.
      expect(component.filter).toBe('active');
      expect(component.sortOrder).toBe('desc');
      expect(sortSelect.value).toBe('desc');

      // Searching and filtering did not overwrite localStorage.
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');

      // Verify the original Todo collection remains unchanged.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Clean up saved sorting preferences after the test.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 68. Jasmine
  // Lesson 166 - Part 1:
  // Verify that the real search input matches Todo titles
  // regardless of how the search term is capitalized.
  it('should search Todo titles regardless of capitalization', async () => {
    // ARRANGE: Create predictable mock Todo data.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16601,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 16602,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 16603,
        title: 'Angular Testing',
        completed: true,
      }),
      createMockTodo({
        id: 16604,
        title: 'Build Portfolio',
        completed: false,
      }),
    ];

    // Preserve the original Todo collection.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Mock the service so the component uses our test data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form bindings to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the actual sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Retrieve the actual search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    // Verify that the controls exist.
    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Verify the initial component state.
    expect(component.sortOrder).toBe('default');
    expect(component.searchTerm).toBe('');
    expect(component.filter).toBe('all');

    // Helper: Retrieve the displayed Todo titles.
    const getDisplayedTitles = (): string[] => {
      // Use an explicit HTMLElement[] type to avoid TS2345.
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    try {
      // STEP 1: Select Title: A-Z using the real dropdown.
      sortSelect.value = 'asc';

      // Trigger Angular's ngModel and ngModelChange bindings.
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify that ascending sorting was selected and saved.
      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      /// A. Why use mixed capitalization?
      // STEP 2: Define different capitalization scenarios.
      const searchCases = ['angular', 'ANGULAR', 'AnGuLaR'];

      /// B. Simulate typing through the real input
      // STEP 3: Test each search using the actual input.
      for (const searchTerm of searchCases) {
        // Simulate typing the search term.
        searchInput.value = searchTerm;

        // Dispatch a native browser input event.
        searchInput.dispatchEvent(new Event('input'));

        // Let Angular update its form binding and template.
        await fixture.whenStable();
        fixture.detectChanges();

        // Assert: The input updated the component property.
        expect(component.searchTerm).toBe(searchTerm);

        /// D. Why check the displayed order?
        /// Both tasks contain the word Angular.
        /// Since A–Z sorting is selected, Angular Testing must appear before Study Angular.
        /// We're verifying searching and sorting together.
        // Assert: Both matching Todos appear in A-Z order.
        expect(getDisplayedTitles()).toEqual([
          'Angular Testing',
          'Study Angular',
        ]);

        // Assert: Ascending sorting is still selected.
        expect(component.sortOrder).toBe('asc');

        // Assert: The dropdown continues displaying A-Z.
        expect(sortSelect.value).toBe('asc');

        // Assert: The All filter remains selected.
        expect(component.filter).toBe('all');

        // Assert: Searching did not overwrite localStorage.
        expect(localStorage.getItem('todoSortOrder')).toBe('asc');
      }

      /// E. Why preserve the original collection? /// Searching should only determine which Todos are displayed. It should not change the original task titles, completion states, or array order.
      // STEP 4: Verify the original collection was not modified.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Always clear saved state after the test.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 69. Jasmine
  // Lesson 166 - Part 2:
  // Verify that leading and trailing spaces in a search term
  // do not prevent matching Todo titles.
  it('should ignore surrounding whitespace in search terms', async () => {
    // ARRANGE: Create mock Todos with predictable titles.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16611,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 16612,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 16613,
        title: 'Angular Testing',
        completed: true,
      }),
      createMockTodo({
        id: 16614,
        title: 'Build Portfolio',
        completed: false,
      }),
    ];

    // Preserve the original Todo data.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Mock TodoService to return our test data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's template-driven forms to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Get the real sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Get the real search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    // Verify the elements exist.
    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Helper: Read Todo titles from the rendered HTML.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    try {
      // STEP 1: Select ascending alphabetical sorting.
      sortSelect.value = 'asc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // STEP 2: Define search terms with different whitespace.
      const searchCases = ['angular', ' angular', 'angular ', '  angular  '];

      // STEP 3: Test each term through the actual HTML input.
      for (const searchTerm of searchCases) {
        // Simulate the user's input, including any extra spaces.
        searchInput.value = searchTerm;

        // Trigger Angular's ngModel input binding.
        searchInput.dispatchEvent(new Event('input'));

        await fixture.whenStable();
        fixture.detectChanges();

        // Assert: Angular received the original typed value.
        expect(component.searchTerm).toBe(searchTerm);

        // Assert: Both matching Todos remain visible in A-Z order.
        expect(getDisplayedTitles()).toEqual([
          'Angular Testing',
          'Study Angular',
        ]);

        // Assert: Sorting remains unchanged.
        expect(component.sortOrder).toBe('asc');
        expect(sortSelect.value).toBe('asc');

        // Assert: The filter remains set to All.
        expect(component.filter).toBe('all');

        // Assert: The saved sorting preference is preserved.
        expect(localStorage.getItem('todoSortOrder')).toBe('asc');
      }

      // STEP 4: Ensure the original Todo data remains unchanged.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Clean up the stored sorting preference.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 70. Jasmine
  // Lesson 166 - Part 3:
  // Verify that a whitespace-only search behaves like
  // an empty search without changing the sorting preference.
  it('should display all Todos when the search contains only whitespace', async () => {
    // ARRANGE: Create three predictable Todo items.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16621,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16622,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 16623,
        title: 'Banana Task',
        completed: false,
      }),
    ];

    // Preserve the original Todo data and array order.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Mock TodoService to return our known test data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form controls to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Find the real sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Find the real search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    // Verify that both controls exist.
    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Helper: Read the displayed Todo titles in DOM order.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    try {
      // STEP 1: Select Title: A-Z through the real dropdown.
      sortSelect.value = 'asc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Confirm that Angular saved the ascending preference.
      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // STEP 2: Define different whitespace-only inputs.
      const searchCases = ['', ' ', '   ', ' \t '];

      // STEP 3: Test each input using a browser input event.
      for (const searchTerm of searchCases) {
        // Set the actual search input value.
        searchInput.value = searchTerm;

        // Notify Angular of the input change.
        searchInput.dispatchEvent(new Event('input'));

        await fixture.whenStable();
        fixture.detectChanges();

        // Assert: The component retains the typed input.
        expect(component.searchTerm).toBe(searchTerm);

        // Assert: Whitespace normalizes to an empty search.
        expect(component.searchTerm.trim()).toBe('');

        // Assert: All Todos remain visible, sorted A-Z.
        expect(getDisplayedTitles()).toEqual([
          'Apple Task',
          'Banana Task',
          'Zebra Task',
        ]);

        // Assert: Exactly three Todos are displayed.
        expect(
          fixture.nativeElement.querySelectorAll('app-todo-item').length,
        ).toBe(3);

        // Assert: The All filter remains selected.
        expect(component.filter).toBe('all');

        // Assert: The sorting preference remains ascending.
        expect(component.sortOrder).toBe('asc');
        expect(sortSelect.value).toBe('asc');

        // Assert: localStorage still contains the saved sort.
        expect(localStorage.getItem('todoSortOrder')).toBe('asc');
      }

      // STEP 4: Verify the source collection was not modified.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Remove the sorting preference after testing.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 71. Jasmine
  // Lesson 166 - Part 4:
  // Verify that mixed capitalization and surrounding spaces
  // work correctly with Active filtering and A-Z sorting.
  it('should combine normalized searching with active filtering and sorting', async () => {
    // ARRANGE: Create mock Todos with mixed completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16631,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 16632,
        title: 'Angular Testing',
        completed: true,
      }),
      createMockTodo({
        id: 16633,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 16634,
        title: 'ANGULAR Project',
        completed: false,
      }),
      createMockTodo({
        id: 16635,
        title: 'Build Portfolio',
        completed: true,
      }),
    ];

    // Keep a snapshot of the original data.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Mock TodoService with predictable Todo data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form controls to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the real sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Retrieve the real search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    // Confirm that the controls exist.
    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Helper: Read Todo titles in displayed DOM order.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    try {
      // STEP 1: Select Title: A-Z using the real dropdown.
      sortSelect.value = 'asc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Assert: Ascending sorting is selected and saved.
      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // STEP 2: Locate the Active filter button.
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      const activeButton = buttons.find(
        (button) => button.textContent?.trim() === 'Active',
      );

      expect(activeButton).toBeDefined();

      // Click the actual Active filter button.
      activeButton!.click();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Assert: Active filtering was applied.
      expect(component.filter).toBe('active');

      // STEP 3: Define mixed-case and whitespace test cases.
      const searchCases = [
        {
          term: '  aNgUlAr  ',
          expectedTitles: ['ANGULAR Project', 'Study Angular'],
        },
        {
          term: '  TYPESCRIPT  ',
          expectedTitles: ['Practice TypeScript'],
        },
      ];

      // STEP 4: Test each search term through the real input.
      for (const searchCase of searchCases) {
        // Simulate typing the search term.
        searchInput.value = searchCase.term;

        // Dispatch Angular's input event.
        searchInput.dispatchEvent(new Event('input'));

        await fixture.whenStable();
        fixture.detectChanges();

        // Assert: The original typed value is preserved.
        expect(component.searchTerm).toBe(searchCase.term);

        // Assert: Filtering and sorting produce correct results.
        expect(getDisplayedTitles()).toEqual(searchCase.expectedTitles);

        // Assert: Active filtering remains selected.
        expect(component.filter).toBe('active');

        // Assert: A-Z sorting remains selected.
        expect(component.sortOrder).toBe('asc');
        expect(sortSelect.value).toBe('asc');

        // Assert: The saved preference is unchanged.
        expect(localStorage.getItem('todoSortOrder')).toBe('asc');
      }

      // STEP 5: Confirm source Todos were not modified.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Clean up the saved sorting preference.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 72. Jasmine
  // Lesson 167 - Part 1:
  // Verify that clicking Clear Search restores all Todos
  // without resetting the user's sorting preference.
  it('should restore all Todos when Clear Search is clicked', async () => {
    // ARRANGE: Create predictable mock Todo data.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16701,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16702,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 16703,
        title: 'Apple Task',
        completed: true,
      }),
    ];

    // Save a snapshot so we can check for mutations.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Replace the service's Todo data with our mock data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form controls to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Get the actual HTML sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Get the actual HTML search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    // Confirm both controls exist.
    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Helper: Read rendered Todo titles in their displayed order.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    /// E. Why use try...finally?
    /// The finally block executes even if an assertion fails.
    /// This helps prevent a saved sorting preference from interfering with later tests.
    try {
      // STEP 1: Select Title: A-Z using the real dropdown.
      sortSelect.value = 'asc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Check that ascending sorting is selected and saved.
      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // Check that all Todos initially appear in A-Z order.
      expect(getDisplayedTitles()).toEqual([
        'Apple Task',
        'Study Angular',
        'Zebra Task',
      ]);

      // STEP 2: Search for "angular" through the real input.
      searchInput.value = 'angular';
      searchInput.dispatchEvent(new Event('input'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Check that Angular received the search term.
      expect(component.searchTerm).toBe('angular');

      // Only the matching Todo should be visible.
      expect(getDisplayedTitles()).toEqual(['Study Angular']);

      // STEP 3: Locate the actual Clear Search button.
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      /// A. Why find the Clear Search button by its text?  /// Your application has more than one button containing the word Clear, including Clear Completed. Searching specifically for clear search avoids accidentally clicking the wrong button.
      const clearSearchButton = buttons.find((button) =>
        button.textContent?.trim().toLowerCase().includes('clear search'),
      );

      // Check that the button is visible after searching.
      expect(clearSearchButton).toBeDefined();

      /// B. Why click the real HTML button?. /// This triggers the Angular click event associated with the button.
      // Click the actual Clear Search button.
      clearSearchButton!.click();

      // Wait for Angular to update the component and HTML.
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      /// C. Why check both the component and HTML input?
      /// These assertions test two related but different things.
      /// The first verifies the component's TypeScript state.
      /// The second verifies the actual HTML input displayed to the user.
      /// Both should be empty after clicking Clear Search.
      // STEP 4: Verify that the search was cleared.
      expect(component.searchTerm).toBe('');

      // Verify that the HTML input was also cleared.
      expect(searchInput.value).toBe('');

      /// D. Why verify the list is restored? /// This confirms that clearing a search restores the full Todo list without removing the selected sorting preference.
      // Verify that all Todos are visible again.
      expect(getDisplayedTitles()).toEqual([
        'Apple Task',
        'Study Angular',
        'Zebra Task',
      ]);

      // Verify that exactly three Todos are rendered.
      expect(
        fixture.nativeElement.querySelectorAll('app-todo-item').length,
      ).toBe(3);

      // Verify that the All filter remains selected.
      expect(component.filter).toBe('all');

      // Verify that ascending sorting remains selected.
      expect(component.sortOrder).toBe('asc');
      expect(sortSelect.value).toBe('asc');

      // Verify that the saved preference remains unchanged.
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // Verify that the original data was not modified.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Clean up the saved sorting preference.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 73. Jasmine
  // Lesson 167 - Part 2:
  // Verify that Clear Search restores all Todos after
  // a search produces zero matching results.
  it('should recover from zero search results using Clear Search', async () => {
    // ARRANGE: Create three predictable mock Todos.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16711,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16712,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 16713,
        title: 'Banana Task',
        completed: false,
      }),
    ];

    // Preserve the original data for comparison.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Make TodoService return our mock Todos.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular to initialize its form bindings.
    await fixture.whenStable();
    fixture.detectChanges();

    // Find the actual sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Find the actual search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Helper: Read the displayed Todo titles.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    try {
      // STEP 1: Select Title: A-Z.
      sortSelect.value = 'asc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify that sorting was selected and saved.
      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // Verify the initial displayed order.
      expect(getDisplayedTitles()).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      /// A. Why search for pineapple?. /// None of the three Todo titles contains pineapple. This deliberately creates a zero-results state.
      // STEP 2: Search for a term that matches nothing.
      searchInput.value = 'pineapple';
      searchInput.dispatchEvent(new Event('input'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify that Angular received the search term.
      expect(component.searchTerm).toBe('pineapple');

      /// B. Why verify both the DOM and the component?.
      /// The first assertion checks what the user actually sees.
      /// The second checks the array generated by the component's processing pipeline.
      /// Both should be empty.
      // Verify that the rendered list is empty.
      expect(getDisplayedTitles()).toEqual([]);

      // Verify the component's processed list is empty.
      expect(component.filteredTodos).toEqual([]);

      // Verify sorting is not reset by the empty result.
      expect(component.sortOrder).toBe('asc');
      expect(sortSelect.value).toBe('asc');

      // STEP 3: Find the actual Clear Search button.
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      const clearSearchButton = buttons.find((button) =>
        button.textContent?.trim().toLowerCase().includes('clear search'),
      );

      /// C. Why check that Clear Search is available?. /// A Clear Search button is especially useful when a search returns no results. Without it, users may have to manually erase their search text. We're verifying that the button remains accessible during the empty-results state.
      // The Clear Search button should be available
      // even when the search has zero matches.
      expect(clearSearchButton).toBeDefined();

      /// D. Why click the actual button?. /// This tests the connection between the HTML button and your component's clearSearch() behavior. Unlike directly calling component.clearSearch(), this verifies a real user interaction.
      // STEP 4: Click the real Clear Search button.
      clearSearchButton!.click();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Verify that the component's search state is reset.
      expect(component.searchTerm).toBe('');

      // Verify that the visible HTML input is also cleared.
      expect(searchInput.value).toBe('');

      /// E. Why verify the list returns? . /// This is the most important assertion. /// It verifies that the Todos weren't deleted when the search returned no results. Clearing the search restores their visibility.
      // Verify all Todos have returned in A-Z order.
      expect(getDisplayedTitles()).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      // Verify the expected number of rendered Todos.
      expect(
        fixture.nativeElement.querySelectorAll('app-todo-item').length,
      ).toBe(3);

      // Verify the All filter remains selected.
      expect(component.filter).toBe('all');

      /// F. Why preserve sorting? . /// Even after an unsuccessful search, the application should remember the selected sorting preference.
      // Verify A-Z sorting is preserved.
      expect(component.sortOrder).toBe('asc');
      expect(sortSelect.value).toBe('asc');

      // Verify the saved sorting preference is unchanged.
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // Verify the original Todo collection was not modified.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Clean up localStorage after the test.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 74. Jasmine
  // Lesson 167 - Part 3:
  // Verify that Clear Search preserves the currently
  // selected Active or Completed filter.
  it('should preserve Active and Completed filters when clearing search', async () => {
    // ARRANGE: Create Todos with different completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16721,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 16722,
        title: 'Fix Laptop',
        completed: false,
      }),
      createMockTodo({
        id: 16723,
        title: 'Submit Report',
        completed: true,
      }),
      createMockTodo({
        id: 16724,
        title: 'Review Tests',
        completed: true,
      }),
    ];

    // Save a copy of the original data.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Mock TodoService with our predictable test data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Initialize Angular's form bindings.
    await fixture.whenStable();
    fixture.detectChanges();

    // Get the actual sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Get the actual search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Helper: Read the Todo titles currently displayed.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Helper: Click an actual filter button.
    const clickFilter = async (label: string): Promise<void> => {
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      const filterButton = buttons.find(
        (button) => button.textContent?.trim() === label,
      );

      expect(filterButton).toBeDefined();

      filterButton!.click();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    // Helper: Simulate entering text into the search input.
    const changeSearch = async (value: string): Promise<void> => {
      searchInput.value = value;
      searchInput.dispatchEvent(new Event('input'));

      await fixture.whenStable();
      fixture.detectChanges();
    };

    /// B. What does clickClearSearch() do? This is a reusable test helper. Instead of repeating button-querying logic twice, we define it once and call it in both scenarios. It also tests the real HTML button rather than directly calling component.clearSearch().
    // Helper: Click the actual Clear Search button.
    const clickClearSearch = async (): Promise<void> => {
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      const clearSearchButton = buttons.find((button) =>
        button.textContent?.trim().toLowerCase().includes('clear search'),
      );

      expect(clearSearchButton).toBeDefined();

      clearSearchButton!.click();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    try {
      // STEP 1: Select Title: A-Z.
      sortSelect.value = 'asc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // SCENARIO A: ACTIVE FILTER

      /// A. Why test both Active and Completed?. /// The Active filter displays unfinished Todos (completed: false).
      // STEP 2: Select Active.
      await clickFilter('Active');

      expect(component.filter).toBe('active');

      // Verify the unfinished Todos are shown in A-Z order.
      expect(getDisplayedTitles()).toEqual(['Fix Laptop', 'Study Angular']);

      // STEP 3: Search for Angular.
      await changeSearch('angular');

      expect(component.searchTerm).toBe('angular');

      // Only the matching unfinished Todo appears.
      expect(getDisplayedTitles()).toEqual(['Study Angular']);

      // STEP 4: Click Clear Search.
      await clickClearSearch();

      /// C. Why check both search state and input value?. /// The first assertion checks Angular's TypeScript component state. The second checks the actual text displayed inside the search input. Both must be empty after clearing the search.
      // Verify both component state and HTML input are cleared.
      expect(component.searchTerm).toBe('');
      expect(searchInput.value).toBe('');

      /// D. Why shouldn't Clear Search reset the filter?. /// Because searching and filtering are separate features. For example, if the user selects Active, they may want to search only unfinished tasks. When they click Clear Search, they should return to seeing all unfinished tasks, not all tasks regardless of completion status.

      // Verify the Active filter remains selected.
      expect(component.filter).toBe('active'); /// should remain true after clearing the search. The same principle applies to Completed.

      // Both unfinished Todos return in A-Z order.
      expect(getDisplayedTitles()).toEqual(['Fix Laptop', 'Study Angular']);

      // SCENARIO B: COMPLETED FILTER

      /// A. Why test both Active and Completed? /// The Completed filter displays finished Todos (completed: true). We want to ensure Clear Search preserves either selection, not just the default All filter.
      // STEP 5: Switch to Completed.
      await clickFilter('Completed');

      expect(component.filter).toBe('completed');

      // Verify the completed Todos are displayed in A-Z order.
      expect(getDisplayedTitles()).toEqual(['Review Tests', 'Submit Report']);

      // STEP 6: Search for Report.
      await changeSearch('report');

      expect(component.searchTerm).toBe('report');

      // Only the matching completed Todo appears.
      expect(getDisplayedTitles()).toEqual(['Submit Report']);

      // STEP 7: Click Clear Search again.
      await clickClearSearch();

      // Verify the search was cleared again.
      expect(component.searchTerm).toBe('');
      expect(searchInput.value).toBe('');

      // Verify the Completed filter remains selected.
      expect(component.filter).toBe('completed');

      // Both completed Todos return in A-Z order.
      expect(getDisplayedTitles()).toEqual(['Review Tests', 'Submit Report']);

      /// E. Why check sorting and localStorage? /// (Assertion = What it verifies)component.sortOrder = Component state, sortSelect.value = HTML dropdown selection, localStorage.getItem() = Saved sorting preference.
      /// Clearing a search should not affect any of these.
      // STEP 8: Verify the sorting preference was preserved.
      expect(component.sortOrder).toBe('asc');
      expect(sortSelect.value).toBe('asc');

      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // STEP 9: Confirm the original Todos remain unchanged.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Clean up the sorting preference after the test.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 75. Jasmine
  // Lesson 167 - Part 4:
  // Verify that replacing search terms and clicking Clear Search
  // preserves descending sorting and the original Todo data.
  it('should replace search terms and clear search without resetting sorting', async () => {
    // ARRANGE: Create four Todos with predictable titles.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16731,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16732,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 16733,
        title: 'Practice TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 16734,
        title: 'Apple Task',
        completed: true,
      }),
    ];

    // Save a snapshot of the original Todo collection.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Mock the service to use predictable test data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form controls to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the actual sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Retrieve the actual search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    // Verify both elements exist.
    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Helper: Read Todo titles from rendered HTML.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    /// B. Why use a helper function?. Using a helper avoids repeating these operations for every search term.
    // Helper: Simulate typing in the real search input.
    const changeSearch = async (value: string): Promise<void> => {
      searchInput.value = value;
      searchInput.dispatchEvent(new Event('input'));

      await fixture.whenStable();
      fixture.detectChanges();
    };

    try {
      // STEP 1: Select Title: Z-A.
      sortSelect.value = 'desc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Confirm descending sorting was saved.
      expect(component.sortOrder).toBe('desc');
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');

      // Confirm the initial Todos appear in Z-A order.
      expect(getDisplayedTitles()).toEqual([
        'Zebra Task',
        'Study Angular',
        'Practice TypeScript',
        'Apple Task',
      ]);

      // STEP 2: Search for Angular.
      await changeSearch('angular'); /// A. Why replace the search term several times?. A user typically doesn't perform only one search. They may repeatedly replace their input to locate different tasks. Our test confirms that the component recalculates the displayed list correctly for every new search term.

      expect(component.searchTerm).toBe('angular');

      expect(getDisplayedTitles()).toEqual(['Study Angular']);

      // STEP 3: Replace the search with TypeScript.
      await changeSearch('typescript'); /// A. Why replace the search term several times?. A user typically doesn't perform only one search. They may repeatedly replace their input to locate different tasks. Our test confirms that the component recalculates the displayed list correctly for every new search term.

      expect(component.searchTerm).toBe('typescript');

      expect(getDisplayedTitles()).toEqual(['Practice TypeScript']);

      // Confirm Z-A sorting was not reset.
      expect(component.sortOrder).toBe('desc');

      /// C. Why deliberately search for something nonexistent?. /// This tests an important edge case: transitioning from valid search results to an empty list. We then verify that Clear Search correctly restores all Todos.
      // STEP 4: Search for a nonexistent Todo.
      await changeSearch('pineapple'); /// A. Why replace the search term several times?. A user typically doesn't perform only one search. They may repeatedly replace their input to locate different tasks. Our test confirms that the component recalculates the displayed list correctly for every new search term.

      expect(component.searchTerm).toBe('pineapple');

      // An unsuccessful search should display no Todos.
      expect(getDisplayedTitles()).toEqual([]);
      expect(component.filteredTodos).toEqual([]);

      // Sorting is still selected despite the empty result.
      expect(component.sortOrder).toBe('desc');
      expect(sortSelect.value).toBe('desc');

      // STEP 5: Find the actual Clear Search button.
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      const clearSearchButton = buttons.find((button) =>
        button.textContent?.trim().toLowerCase().includes('clear search'),
      );

      // Verify that the button is available.
      expect(clearSearchButton).toBeDefined();

      /// D. Why click the actual Clear Search button?. /// This verifies the connection between the HTML template and your component's clearSearch() method. The exclamation mark ! tells TypeScript that we expect the button to exist at this point.
      /// We're also checking its existence beforehand: expect(clearSearchButton).toBeDefined();
      // Click the actual Clear Search button.
      clearSearchButton!.click();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // STEP 6: Verify the search was cleared.
      expect(component.searchTerm).toBe('');
      expect(searchInput.value).toBe('');

      // Verify all Todos return in descending order.
      expect(getDisplayedTitles()).toEqual([
        'Zebra Task',
        'Study Angular',
        'Practice TypeScript',
        'Apple Task',
      ]);

      // Verify exactly four Todos are rendered.
      expect(
        fixture.nativeElement.querySelectorAll('app-todo-item').length,
      ).toBe(4);

      // Verify the All filter remains selected.
      expect(component.filter).toBe('all');

      // Verify the descending sorting preference is preserved.
      expect(component.sortOrder).toBe('desc');
      expect(sortSelect.value).toBe('desc');

      /// E. Why check localStorage?. /// Your sorting preference is saved between sessions. Changing search terms and clearing the search should not overwrite that preference.
      // Verify the saved preference remains unchanged.
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');

      /// F. Why verify source data integrity?. /// Searching should only change the displayed view. It should never delete, modify, or reorder the original array of Todos.
      // Verify the original Todo collection was not modified.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Clean up the saved sorting preference after testing.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 76. Jasmine
  // Lesson 168 - Part 1:
  // Verify that A-Z sorting is restored when TodoListComponent
  // is destroyed and recreated.
  it('should restore saved ascending sorting after component reinitialization', async () => {
    // ARRANGE: Create predictable Todo data.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16801,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16802,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 16803,
        title: 'Banana Task',
        completed: false,
      }),
    ];

    // Preserve the original Todo collection.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Make TodoService return our mock data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Helper: Read rendered titles from a specific fixture.
    const getDisplayedTitles = (
      currentFixture: ComponentFixture<TodoListComponent>,
    ): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        currentFixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Declare a variable for the replacement component.
    let newFixture: ComponentFixture<TodoListComponent> | undefined;

    try {
      // STEP 1: Check the original component's default state.
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.sortOrder).toBe('default');

      expect(getDisplayedTitles(fixture)).toEqual([
        'Zebra Task',
        'Apple Task',
        'Banana Task',
      ]);

      // STEP 2: Find the original sorting dropdown.
      const originalSortSelect = fixture.nativeElement.querySelector(
        '#todo-sort-select',
      ) as HTMLSelectElement;

      expect(originalSortSelect).not.toBeNull();

      // Select Title: A-Z through the actual HTML dropdown.
      originalSortSelect.value = 'asc';
      originalSortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify the preference was selected and saved.
      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      expect(getDisplayedTitles(fixture)).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      // STEP 3: Destroy the original component fixture.
      fixture.destroy(); /// A. What does fixture.destroy() do? - This destroys the original test fixture and its Angular component instance. It's useful for testing cleanup and lifecycle behavior. It does not automatically erase browser localStorage, so the sorting preference should remain saved.

      // Confirm the saved preference still exists.
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // STEP 4: Create a completely new component instance.
      newFixture = TestBed.createComponent(TodoListComponent); /// B. What does TestBed.createComponent() do? - This creates a separate TodoListComponent instance. Its component properties start with their initial values, before lifecycle initialization.

      // Trigger ngOnInit() in the replacement component.
      newFixture.detectChanges(); /// When we call: newFixture.detectChanges();  - Angular runs its initialization lifecycle, including ngOnInit(). Your ngOnInit() calls loadSortOrder(), which should restore the saved sorting preference.

      // Wait for Angular's asynchronous tasks.
      await newFixture.whenStable();
      newFixture.detectChanges();

      // Retrieve the newly created component instance.
      const newComponent = newFixture.componentInstance; /// C. Why use newFixture.componentInstance? - The component variable from your existing beforeEach() still refers to the original instance. We need the new component instance to verify that restoration works.

      // STEP 5: Verify that saved sorting was restored.
      expect(newComponent.sortOrder).toBe('asc'); /// This assertion verifies that the newly created component loaded the persisted setting.

      // Find the dropdown belonging to the new fixture.
      const newSortSelect = newFixture.nativeElement.querySelector(
        '#todo-sort-select',
      ) as HTMLSelectElement;

      expect(newSortSelect).not.toBeNull();

      // Verify the new dropdown displays Title: A-Z.
      expect(newSortSelect.value).toBe('asc'); /// D. Why check the new dropdown? - It's possible for a TypeScript property to have the correct value while the UI doesn't reflect it due to a template-binding problem. By checking the new dropdown, we're verifying that the restored preference is correctly displayed to the user.

      ///  This is especially important. Restoring the dropdown alone isn't enough. The Todo list should actually be sorted using the saved preference.
      // Verify that the new component renders the correct order.
      expect(getDisplayedTitles(newFixture)).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      // Verify the preference remained saved.
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // Verify the source Todo collection was unchanged.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Clean up the replacement fixture, if created.
      newFixture?.destroy(); /// F. What does optional chaining mean here? - The ?. operator means: If newFixture exists, call its destroy() method. This prevents an error if the test fails before the replacement component is created.

      // Remove the saved sorting preference after the test.
      localStorage.removeItem('todoSortOrder'); /// G. Why clean up localStorage? - The saved preference belongs to this test scenario. Removing it afterward prevents its state from affecting unrelated Jasmine tests.
    }
  });

  // 77. Jasmine
  // Lesson 168 - Part 2:
  // Verify that Z-A sorting is preserved when TodoListComponent
  // is destroyed and recreated.
  it('should restore saved descending sorting after component reinitialization', async () => {
    // ARRANGE: Create predictable Todo data.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16811,
        title: 'Apple Task',
        completed: false,
      }),
      createMockTodo({
        id: 16812,
        title: 'Zebra Task',
        completed: true,
      }),
      createMockTodo({
        id: 16813,
        title: 'Banana Task',
        completed: false,
      }),
    ];

    // Preserve the original data for mutation checks.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Replace the real Todo data with our predictable mocks.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Helper: Read rendered Todo titles from a particular fixture.
    const getDisplayedTitles = (
      currentFixture: ComponentFixture<TodoListComponent>,
    ): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        currentFixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Hold the new fixture so we can clean it up afterward.
    let newFixture: ComponentFixture<TodoListComponent> | undefined;

    try {
      // STEP 1: Verify the original component uses default sorting.
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.sortOrder).toBe('default');

      // With default sorting, preserve the original array order.
      expect(getDisplayedTitles(fixture)).toEqual([
        'Apple Task',
        'Zebra Task',
        'Banana Task',
      ]);

      // STEP 2: Find the original HTML sorting dropdown.
      const originalSortSelect = fixture.nativeElement.querySelector(
        '#todo-sort-select',
      ) as HTMLSelectElement;

      expect(originalSortSelect).not.toBeNull();

      // Select Title: Z-A through the real dropdown.
      originalSortSelect.value = 'desc';
      originalSortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Confirm that Z-A sorting was selected.
      expect(component.sortOrder).toBe('desc');

      // Confirm that Z-A sorting was saved to localStorage.
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');

      // Verify that the original component displays Z-A order.
      expect(getDisplayedTitles(fixture)).toEqual([
        'Zebra Task',
        'Banana Task',
        'Apple Task',
      ]);

      // STEP 3: Destroy the original component.
      fixture.destroy();

      // Verify that destroying the component did not erase localStorage.
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');

      // STEP 4: Create a new TodoListComponent.
      newFixture = TestBed.createComponent(TodoListComponent);

      // Trigger initialization, including ngOnInit().
      newFixture.detectChanges();

      // Wait for Angular to finish outstanding tasks.
      await newFixture.whenStable();
      newFixture.detectChanges();

      // Retrieve the NEW component instance.
      const newComponent = newFixture.componentInstance;

      // STEP 5: Verify that descending sorting was restored.
      expect(newComponent.sortOrder).toBe('desc');

      // Retrieve the NEW component's dropdown.
      const newSortSelect = newFixture.nativeElement.querySelector(
        '#todo-sort-select',
      ) as HTMLSelectElement;

      expect(newSortSelect).not.toBeNull();

      // The new dropdown should display Title: Z-A.
      expect(newSortSelect.value).toBe('desc');

      // The new Todo list must actually use Z-A sorting.
      expect(getDisplayedTitles(newFixture)).toEqual([
        'Zebra Task',
        'Banana Task',
        'Apple Task',
      ]);

      // Check that the saved preference remains unchanged.
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');

      // Confirm neither sorting operation modified the source array.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Destroy the replacement component if it exists.
      newFixture?.destroy();

      // Remove the saved sorting preference.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 78. Jasmine
  // Lesson 168 - Part 3:
  // Verify Active First and Completed First sorting preferences
  // survive component destruction and reinitialization.
  it('should restore completion-based sorting after component reinitialization', async () => {
    // ARRANGE: Create mock Todos with mixed completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16821,
        title: 'Submit Report',
        completed: true,
      }),
      createMockTodo({
        id: 16822,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 16823,
        title: 'Review Tests',
        completed: true,
      }),
      createMockTodo({
        id: 16824,
        title: 'Fix Laptop',
        completed: false,
      }),
    ];

    // Keep a snapshot to detect accidental source-data changes.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Replace TodoService's data with our predictable mock collection.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Helper: Read Todo titles from any component fixture.
    const getDisplayedTitles = (
      currentFixture: ComponentFixture<TodoListComponent>,
    ): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        currentFixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    /// B. Why use an array of test cases? - This is data-driven testing. Instead of writing two nearly identical Jasmine tests, we use one test that runs both scenarios. Each iteration uses a different sorting preference and checks the corresponding expected result.
    // Define both sorting scenarios and their expected results.
    const sortCases = [
      {
        value: 'active-first',
        expectedTitles: [
          'Study Angular',
          'Fix Laptop',
          'Submit Report',
          'Review Tests',
        ],
      },
      {
        value: 'completed-first',
        expectedTitles: [
          'Submit Report',
          'Review Tests',
          'Study Angular',
          'Fix Laptop',
        ],
      },
    ];

    // Track any replacement fixture for safe cleanup.
    let newFixture: ComponentFixture<TodoListComponent> | undefined;

    try {
      // STEP 1: Initialize the original component.
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.sortOrder).toBe('default');

      // STEP 2: Test each completion-based sorting preference.
      for (const sortCase of sortCases) {
        // Get the current fixture's sorting dropdown.
        const currentSortSelect = fixture.nativeElement.querySelector(
          '#todo-sort-select',
        ) as HTMLSelectElement;

        expect(currentSortSelect).not.toBeNull();

        // Select Active First or Completed First.
        currentSortSelect.value = sortCase.value;

        // Trigger Angular's form binding and saveSortOrder().
        currentSortSelect.dispatchEvent(new Event('change'));

        await fixture.whenStable();
        fixture.detectChanges();

        // Confirm the selected value is saved.
        expect(component.sortOrder).toBe(sortCase.value);
        expect(localStorage.getItem('todoSortOrder')).toBe(sortCase.value);

        // Confirm the original component renders the correct order.
        expect(getDisplayedTitles(fixture)).toEqual(sortCase.expectedTitles); /// E. Why verify the original and recreated Todo order? - This confirms the chosen sorting option works before component destruction.

        // STEP 3: Destroy the original component.
        fixture.destroy();

        // The sorting preference should survive destruction.
        expect(localStorage.getItem('todoSortOrder')).toBe(sortCase.value);

        // STEP 4: Recreate TodoListComponent.
        newFixture = TestBed.createComponent(TodoListComponent);

        // Initialize the new component.
        newFixture.detectChanges();

        await newFixture.whenStable();
        newFixture.detectChanges();

        // Retrieve the newly created component instance.
        const newComponent = newFixture.componentInstance;

        // Verify that the saved sorting preference was restored.
        expect(newComponent.sortOrder).toBe(sortCase.value);

        // Retrieve the new component's sorting dropdown.
        const newSortSelect = newFixture.nativeElement.querySelector(
          '#todo-sort-select',
        ) as HTMLSelectElement;

        expect(newSortSelect).not.toBeNull();

        // Verify that the dropdown reflects the saved preference.
        expect(newSortSelect.value).toBe(sortCase.value);

        // Verify that the rendered Todo order is restored.
        expect(getDisplayedTitles(newFixture)).toEqual(sortCase.expectedTitles); /// E. Why verify the original and recreated Todo order? - This confirms the sorting behavior survives component recreation. We're verifying both correct initial behavior and correct persistence.

        // Verify that localStorage still contains the preference.
        expect(localStorage.getItem('todoSortOrder')).toBe(sortCase.value); /// F. What happens to localStorage? - This checks that the stored preference contains the expected value. Angular components may be destroyed, but localStorage persists until the saved item is explicitly changed or removed.

        /// C. Why assign fixture = newFixture? - After the first scenario, the original fixture has been destroyed. We want to test the second scenario using a working component instance. These lines make the newly created fixture the current fixture for the next iteration. The original fixture and component variables were created in your existing beforeEach(). One subtle point: this approach deliberately reassigns those shared variables inside this test. Jasmine will create fresh variables through beforeEach() for the next test, so it won't reuse this component instance.
        // STEP 5: Prepare for the next sorting scenario.
        // Use the newly created component as the next original.
        fixture = newFixture;
        component = fixture.componentInstance;

        // The replacement fixture is now tracked by "fixture".
        newFixture = undefined; /// D. Why reset newFixture to undefined? - After assigning the replacement component to fixture, the variable newFixture no longer needs to own that reference. This prevents accidentally destroying the same fixture twice in the finally block.
      }

      // Confirm the source Todo data was not modified.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Clean up the last replacement fixture, if necessary.
      newFixture?.destroy();

      // Remove the saved sorting preference.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 79. Jasmine
  // Lesson 168 - Part 4:
  // Verify that an invalid saved sort preference is ignored
  // when TodoListComponent is recreated.
  it('should ignore invalid saved sorting after component reinitialization', async () => {
    // ARRANGE: Create predictable mock Todo data.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16831,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16832,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 16833,
        title: 'Banana Task',
        completed: false,
      }),
    ];

    // Save the original Todo data for mutation checking.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Make TodoService return our test data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Helper: Read displayed Todo titles from a given fixture.
    const getDisplayedTitles = (
      currentFixture: ComponentFixture<TodoListComponent>,
    ): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        currentFixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Keep a reference to the replacement fixture for cleanup.
    let newFixture: ComponentFixture<TodoListComponent> | undefined;

    try {
      // STEP 1: Initialize the original component.
      await fixture.whenStable();
      fixture.detectChanges();

      // Verify that the original component starts with default sorting.
      expect(component.sortOrder).toBe('default');

      expect(getDisplayedTitles(fixture)).toEqual([
        'Zebra Task',
        'Apple Task',
        'Banana Task',
      ]);

      // STEP 2: Destroy the original component.
      fixture.destroy(); /// B. Why destroy the original component first? - Your shared Jasmine beforeEach() has already initialized the original component. If we simply modify localStorage without recreating the component, we won't automatically trigger loadSortOrder() again. Destroying the fixture and creating a new one lets us test the real initialization behavior.

      // STEP 3: Store an intentionally invalid sorting value.
      localStorage.setItem('todoSortOrder', 'random-sort'); /// A. Why deliberately save an invalid value? - We're simulating corrupted, outdated, or manually modified browser data. Even though your application normally saves valid preferences, localStorage is not guaranteed to contain valid data forever. Testing invalid stored values is an example of defensive testing.

      expect(localStorage.getItem('todoSortOrder')).toBe('random-sort');

      // STEP 4: Create a new TodoListComponent.
      newFixture = TestBed.createComponent(TodoListComponent);

      // Trigger initialization, including ngOnInit().
      newFixture.detectChanges();

      await newFixture.whenStable();
      newFixture.detectChanges();

      // Get the new component instance.
      const newComponent = newFixture.componentInstance;

      // STEP 5: Verify that the invalid value was ignored.
      expect(newComponent.sortOrder).toBe('default'); /// C. Why should sortOrder remain 'default'? - Your component starts with: sortOrder: TodoSortOrder = 'default'; Its loadSortOrder() method only replaces that value when the stored value passes validation. Since 'random-sort' is invalid, the property should remain 'default'.
      // Retrieve the new component's sorting dropdown.
      const newSortSelect = newFixture.nativeElement.querySelector(
        '#todo-sort-select',
      ) as HTMLSelectElement;

      expect(newSortSelect).not.toBeNull();

      // Verify that the dropdown displays the default option.
      expect(newSortSelect.value).toBe('default'); /// D. Why verify the dropdown? - We want to verify that the HTML interface accurately reflects the component's sorting state. An invalid saved preference should not leave the dropdown displaying an unsupported selection.

      /// E. Why check the original Todo order? - This is our most important UI assertion. If the component correctly falls back to default sorting, the original order should remain unchanged.
      // Verify that the original Todo order is preserved.
      expect(getDisplayedTitles(newFixture)).toEqual([
        'Zebra Task',
        'Apple Task',
        'Banana Task',
      ]);

      // The current implementation ignores invalid values
      // without automatically removing them from localStorage.
      expect(localStorage.getItem('todoSortOrder')).toBe('random-sort'); /// F. Why does localStorage still contain 'random-sort'? - Your current loadSortOrder() method validates the stored value but does not delete invalid values. That distinction matters: Ignoring invalid data means not using it; Removing invalid data means deleting it from storage. - Our test verifies the behavior your current implementation actually provides. Later, we could improve the method to remove invalid values automatically, but that would be a separate feature change.

      // Verify that the component retained its default filter.
      expect(newComponent.filter).toBe('all');

      // Verify that no search term was introduced.
      expect(newComponent.searchTerm).toBe('');

      // Verify that the original Todo data was not modified.
      expect(mockTodos).toEqual(originalTodos);
      /// G. Why use try...finally? - This ensures that the replacement component and invalid stored preference are cleaned up even if an assertion fails.
    } finally {
      // Destroy the replacement fixture if it was created.
      newFixture?.destroy();

      // Remove the deliberately invalid preference.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 80. Jasmine
  // Lesson 169 - Part 1:
  // Verify that clicking the actual Reset Sorting button
  // restores the original Todo order and saves "default".
  it('should reset ascending sorting using the Reset Sorting button', async () => {
    // ARRANGE: Create three predictable mock Todos.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16901,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16902,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 16903,
        title: 'Banana Task',
        completed: false,
      }),
    ];

    // Preserve the original Todo data and array order.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Mock the service to return our test Todos.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Initialize Angular's form bindings.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the real sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    expect(sortSelect).not.toBeNull();

    // Helper: Read the displayed Todo titles in DOM order.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Helper: Find the actual Reset Sorting button.
    const getResetButton = (): HTMLButtonElement | undefined => {
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      return buttons.find((button) =>
        button.textContent?.trim().toLowerCase().includes('reset sorting'),
      );
    };

    try {
      // STEP 1: Verify initial default sorting.
      expect(component.sortOrder).toBe('default');
      expect(getDisplayedTitles()).toEqual([
        'Zebra Task',
        'Apple Task',
        'Banana Task',
      ]);

      // Reset Sorting should not appear in default mode.
      expect(getResetButton()).toBeUndefined();

      // STEP 2: Select Title: A-Z using the HTML dropdown.
      sortSelect.value = 'asc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify ascending sorting is selected and saved.
      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // Verify the displayed list is alphabetically sorted.
      expect(getDisplayedTitles()).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      // STEP 3: Find the Reset Sorting button.
      const resetButton = getResetButton();

      expect(resetButton).toBeDefined();

      // Click the real Reset Sorting button.
      resetButton!.click();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // STEP 4: Verify the component returned to default.
      expect(component.sortOrder).toBe('default');

      // Verify the dropdown also shows the default value.
      expect(sortSelect.value).toBe('default');

      // Verify localStorage saved the reset preference.
      expect(localStorage.getItem('todoSortOrder')).toBe('default');

      // Verify the original Todo order has been restored.
      expect(getDisplayedTitles()).toEqual([
        'Zebra Task',
        'Apple Task',
        'Banana Task',
      ]);

      // Verify the Reset Sorting button disappeared.
      expect(getResetButton()).toBeUndefined();

      // Verify that the All filter remains selected.
      expect(component.filter).toBe('all');

      // Verify that the search input state is unchanged.
      expect(component.searchTerm).toBe('');

      // Verify that resetting sorting did not mutate the source.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Remove the saved preference after this test.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 81. Jasmine
  // Lesson 169 - Part 2:
  // Verify that Reset Sorting works for descending,
  // Active First, and Completed First preferences.
  it('should reset descending and completion-based sorting to default', async () => {
    // ARRANGE: Create mock Todos in a predictable original order.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16911,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16912,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 16913,
        title: 'Banana Task',
        completed: false,
      }),
      createMockTodo({
        id: 16914,
        title: 'Mango Task',
        completed: true,
      }),
    ];

    // Preserve the original Todo array.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Mock the TodoService method that provides Todos.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular form controls to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Get the actual sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    expect(sortSelect).not.toBeNull();

    // Helper: Read the Todo titles currently displayed.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Helper: Locate the actual Reset Sorting button.
    const getResetButton = (): HTMLButtonElement | undefined => {
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      return buttons.find((button) =>
        button.textContent?.trim().toLowerCase().includes('reset sorting'),
      );
    };

    // Helper: Select a sorting option through the real dropdown.
    const changeSorting = async (value: string): Promise<void> => {
      /// B. Why does changeSorting() use an event? - The first line changes the HTML dropdown selection. The second line notifies Angular that the selection changed. This triggers the component's form binding and its saveSortOrder() logic. Without dispatching the event, changing the HTML element's value would not necessarily update component.sortOrder.
      sortSelect.value = value;
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();
    };

    // Define the original order expected after every reset.
    const originalTitles = [
      'Zebra Task',
      'Apple Task',
      'Banana Task',
      'Mango Task',
    ];

    /// A. Why use sortCases? - This is called data-driven testing. Instead of writing three nearly identical Jasmine tests, we store different inputs and expected outputs in one array.
    // Define three different sorting scenarios.
    const sortCases = [
      {
        value: 'desc',
        expectedTitles: [
          'Zebra Task',
          'Mango Task',
          'Banana Task',
          'Apple Task',
        ],
      },
      {
        value: 'active-first',
        expectedTitles: [
          'Zebra Task',
          'Banana Task',
          'Apple Task',
          'Mango Task',
        ],
      },
      {
        value: 'completed-first',
        expectedTitles: [
          'Apple Task',
          'Mango Task',
          'Zebra Task',
          'Banana Task',
        ],
      },
    ];

    try {
      // STEP 1: Verify the initial state.
      expect(component.sortOrder).toBe('default');
      expect(getDisplayedTitles()).toEqual(originalTitles);
      expect(getResetButton()).toBeUndefined();

      // STEP 2: Test each sorting preference.
      for (const sortCase of sortCases) {
        // Select the current sorting preference.
        await changeSorting(sortCase.value);

        // Verify the component received the selected value.
        expect(component.sortOrder).toBe(sortCase.value);

        // Verify the dropdown reflects the selection.
        expect(sortSelect.value).toBe(sortCase.value);

        // Verify the selected sorting preference was saved.
        expect(localStorage.getItem('todoSortOrder')).toBe(sortCase.value);

        // Verify the Todo order changed correctly.
        expect(getDisplayedTitles()).toEqual(sortCase.expectedTitles);

        /// D. Why click the button for every sorting option? - We aren't merely verifying that a sorting option can be selected.
        // STEP 3: Locate the Reset Sorting button.
        const resetButton = getResetButton();

        expect(resetButton).toBeDefined();

        // Click the actual Reset Sorting button.
        resetButton!.click();

        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // STEP 4: Verify sorting returned to default.
        expect(component.sortOrder).toBe('default');
        expect(sortSelect.value).toBe('default');

        // Verify localStorage was updated to default.
        expect(localStorage.getItem('todoSortOrder')).toBe('default'); /// E. Why verify localStorage after every reset? - Your resetSortOrder() method calls saveSortOrder(). Therefore, the reset preference should be saved, not only applied temporarily.

        // Verify the original Todo order was restored.
        expect(getDisplayedTitles()).toEqual(originalTitles);

        // Verify the Reset Sorting button disappeared.
        expect(getResetButton()).toBeUndefined(); /// F. Why check the Reset Sorting button disappears? - Your template displays the reset button only when sorting is not 'default'. This assertion verifies that the UI correctly updates after resetting.

        // Verify unrelated component state was preserved.
        expect(component.filter).toBe('all');
        expect(component.searchTerm).toBe('');
      }

      // STEP 5: Confirm none of the scenarios modified source data.
      expect(mockTodos).toEqual(originalTodos); /// G. Why compare the source Todos? - Sorting should not permanently rearrange the collection returned by TodoService.
    } finally {
      // Remove the saved sorting preference after testing.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 82. Jasmine
  // Lesson 169 - Part 3:
  // Verify that resetting sorting to default is saved
  // and remains effective after component recreation.
  it('should restore saved default sorting after resetting and recreating the component', async () => {
    // ARRANGE: Create Todos in a non-alphabetical order.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16921,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 16922,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 16923,
        title: 'Banana Task',
        completed: false,
      }),
    ];

    // Save the original Todo array for comparison.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Return our mock Todos whenever TodoService.getTodos() runs.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    /// F. Why use a fixture parameter in our helpers? - We need to examine two different component instances: the original fixture and the replacement fixture. Passing the fixture into the helper ensures that we're reading the correct component's HTML.
    // Helper: Read Todo titles from a particular fixture.
    const getDisplayedTitles = (
      currentFixture: ComponentFixture<TodoListComponent>,
    ): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        currentFixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Helper: Find the Reset Sorting button in a fixture.
    const getResetButton = (
      currentFixture: ComponentFixture<TodoListComponent>,
    ): HTMLButtonElement | undefined => {
      const buttons: HTMLButtonElement[] = Array.from(
        currentFixture.nativeElement.querySelectorAll('button'),
      );

      return buttons.find((button) =>
        button.textContent?.trim().toLowerCase().includes('reset sorting'),
      );
    };

    // Hold the new fixture for cleanup.
    let newFixture: ComponentFixture<TodoListComponent> | undefined;

    try {
      // STEP 1: Initialize the original component.
      await fixture.whenStable();
      fixture.detectChanges();

      // Verify initial default sorting.
      expect(component.sortOrder).toBe('default');

      expect(getDisplayedTitles(fixture)).toEqual([
        'Zebra Task',
        'Apple Task',
        'Banana Task',
      ]);

      // STEP 2: Get the original sorting dropdown.
      const originalSortSelect = fixture.nativeElement.querySelector(
        '#todo-sort-select',
      ) as HTMLSelectElement;

      expect(originalSortSelect).not.toBeNull();

      /// A. Why select A–Z before resetting? - We want to prove that the preference changes from a non-default option back to default. If we started with default sorting and immediately recreated the component, we wouldn't be testing the actual reset process.
      // Select A-Z through the real HTML dropdown.
      originalSortSelect.value = 'asc';
      originalSortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify A-Z sorting is now selected and saved.
      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // Verify the rendered list is alphabetically sorted.
      expect(getDisplayedTitles(fixture)).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      // STEP 3: Find the actual Reset Sorting button.
      const resetButton = getResetButton(fixture);

      expect(resetButton).toBeDefined();

      // Click the Reset Sorting button.
      resetButton!.click();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Verify sorting returned to default.
      expect(component.sortOrder).toBe('default');
      expect(originalSortSelect.value).toBe('default');

      /// B. Why check localStorage before recreating the component? - This confirms that the Reset Sorting button saved the new preference successfully.
      // Verify the reset preference was saved.
      expect(localStorage.getItem('todoSortOrder')).toBe('default');

      // Verify the original Todo order returned.
      expect(getDisplayedTitles(fixture)).toEqual([
        'Zebra Task',
        'Apple Task',
        'Banana Task',
      ]);

      // Verify the Reset Sorting button disappeared.
      expect(getResetButton(fixture)).toBeUndefined();

      // STEP 4: Destroy the original component.
      fixture.destroy(); /// C. What does component recreation prove? -  These lines create a fresh component instance. During initialization, Angular runs ngOnInit(), which calls loadSortOrder(). The newly created component should read 'default' from localStorage. One important distinction: because 'default' is also the component's initial value, checking newComponent.sortOrder alone would not prove that storage was read. That's why we also verify the saved value, dropdown state, and actual Todo order.

      // The saved default preference should remain available.
      expect(localStorage.getItem('todoSortOrder')).toBe('default');

      // STEP 5: Create a completely new component instance.
      newFixture = TestBed.createComponent(TodoListComponent); /// C. What does component recreation prove? -  These lines create a fresh component instance. During initialization, Angular runs ngOnInit(), which calls loadSortOrder(). The newly created component should read 'default' from localStorage. One important distinction: because 'default' is also the component's initial value, checking newComponent.sortOrder alone would not prove that storage was read. That's why we also verify the saved value, dropdown state, and actual Todo order.

      // Trigger ngOnInit(), including loadSortOrder().
      newFixture.detectChanges(); /// C. What does component recreation prove? -  These lines create a fresh component instance. During initialization, Angular runs ngOnInit(), which calls loadSortOrder(). The newly created component should read 'default' from localStorage. One important distinction: because 'default' is also the component's initial value, checking newComponent.sortOrder alone would not prove that storage was read. That's why we also verify the saved value, dropdown state, and actual Todo order.

      await newFixture.whenStable();
      newFixture.detectChanges();

      // Retrieve the new component instance.
      const newComponent = newFixture.componentInstance;

      // STEP 6: Verify default sorting was retained.
      expect(newComponent.sortOrder).toBe('default');

      // Retrieve the new component's sorting dropdown.
      const newSortSelect = newFixture.nativeElement.querySelector(
        '#todo-sort-select',
      ) as HTMLSelectElement;

      expect(newSortSelect).not.toBeNull();

      // Verify the new dropdown displays Default.
      expect(newSortSelect.value).toBe('default');

      /// D. Why verify the rendered Todo order? - This is the main UI assertion. The restored default sorting preference must preserve the original order returned by TodoService.
      // Verify the original Todo order is displayed.
      expect(getDisplayedTitles(newFixture)).toEqual([
        'Zebra Task',
        'Apple Task',
        'Banana Task',
      ]);

      /// E. Why verify the button is hidden? - Your template displays Reset Sorting only when the selected sorting preference is not 'default'. After recreation, the button should remain hidden.
      // Verify the Reset Sorting button remains hidden.
      expect(getResetButton(newFixture)).toBeUndefined();

      // Verify the saved default preference was preserved.
      expect(localStorage.getItem('todoSortOrder')).toBe('default');

      // Verify unrelated component state starts normally.
      expect(newComponent.filter).toBe('all');
      expect(newComponent.searchTerm).toBe('');

      // Confirm that neither component modified the source Todos.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      /// G. Why clean up the replacement fixture? - The optional chaining operator ?. ensures that destroy() runs only when newFixture exists.
      // Destroy the replacement fixture if it exists.
      newFixture?.destroy();

      // Clean up the saved sorting preference.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 83. Jasmine
  // Lesson 169 - Part 4:
  // Verify that resetting sorting preserves the user's
  // search term and selected Active filter.
  it('should reset sorting without clearing search or filter state', async () => {
    // ARRANGE: Create Todos in a predictable original order.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 16931,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 16932,
        title: 'Submit Report',
        completed: true,
      }),
      createMockTodo({
        id: 16933,
        title: 'Practice Angular',
        completed: false,
      }),
      createMockTodo({
        id: 16934,
        title: 'Angular Testing',
        completed: true,
      }),
      createMockTodo({
        id: 16935,
        title: 'Fix Laptop',
        completed: false,
      }),
    ];

    // Preserve the original Todo collection for comparison.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Mock the service so the test uses predictable data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form bindings to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the real sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Retrieve the real search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    // Verify both elements exist.
    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Helper: Read rendered Todo titles in their displayed order.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Helper: Find a button using its visible label.
    const findButton = (label: string): HTMLButtonElement | undefined => {
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      return buttons.find((button) =>
        button.textContent?.trim().toLowerCase().includes(label.toLowerCase()),
      );
    };

    try {
      // STEP 1: Select Active using the real filter button.
      const activeButton = findButton('Active');

      expect(activeButton).toBeDefined();

      activeButton!.click(); /// A. Why apply the filter and search before sorting? - We deliberately create a state where only two of the five Todos match. This allows us to verify that resetting sorting affects only the order of the displayed tasks, not which tasks are displayed.

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Verify Active filtering was selected.
      expect(component.filter).toBe('active');

      /// A. Why apply the filter and search before sorting? - - We deliberately create a state where only two of the five Todos match. This allows us to verify that resetting sorting affects only the order of the displayed tasks, not which tasks are displayed.
      // STEP 2: Search for Angular using the actual input.
      searchInput.value = 'angular';
      searchInput.dispatchEvent(new Event('input'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify that Angular received the search term.
      expect(component.searchTerm).toBe('angular');

      /// B. Why check the order before selecting A–Z? - Your default sorting should preserve the original order returned by TodoService. Since Study Angular appears before Practice Angular in our mock array, that is the expected default order.
      // With default sorting, matching tasks follow source order.
      expect(getDisplayedTitles()).toEqual([
        'Study Angular',
        'Practice Angular',
      ]);

      /// C. Why select A–Z before resetting? - We need to create a meaningful sorting change. With A–Z sorting, Practice Angular appears before Study Angular. This gives us a visible difference to check after clicking Reset Sorting.
      // STEP 3: Select Title: A-Z using the real dropdown.
      sortSelect.value = 'asc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify that ascending sorting was selected.
      expect(component.sortOrder).toBe('asc');

      // Verify the preference was saved.
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // Verify that matching tasks now appear alphabetically.
      expect(getDisplayedTitles()).toEqual([
        'Practice Angular',
        'Study Angular',
      ]);

      // STEP 4: Find the actual Reset Sorting button.
      const resetButton = findButton('Reset Sorting');

      expect(resetButton).toBeDefined();

      // Click the real Reset Sorting button.
      resetButton!.click();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // STEP 5: Verify sorting returned to default.
      expect(component.sortOrder).toBe('default');

      // Verify the dropdown reflects default sorting.
      expect(sortSelect.value).toBe('default');

      // Verify localStorage saved the reset preference.
      expect(localStorage.getItem('todoSortOrder')).toBe('default');

      /// D. Why verify search and filter state separately? - These assertions verify that resetting sorting does not change unrelated component properties. Your application should manage searching, filtering, and sorting independently.
      // Verify Active filtering was NOT reset.
      expect(component.filter).toBe('active');

      // Verify the search term was NOT cleared.
      expect(component.searchTerm).toBe('angular');

      /// E. Why check the actual HTML input? - A component property can contain the correct value while the HTML input displays something else if its binding is broken. Checking the HTML element confirms the user's search remains visible after resetting sorting.
      // Verify the actual HTML input still contains the search.
      expect(searchInput.value).toBe('angular');

      /// F. Why check the rendered Todo order? - This verifies that the reset operation restored the original relative order of the matching Todos. It also confirms that the application did not remove the Active filter or the search term.
      // Verify only matching Active Todos remain visible,
      // now in their original source-array order.
      expect(getDisplayedTitles()).toEqual([
        'Study Angular',
        'Practice Angular',
      ]);

      // Verify that exactly two Todos are displayed.
      expect(
        fixture.nativeElement.querySelectorAll('app-todo-item').length,
      ).toBe(2);

      // Verify the Reset Sorting button disappeared.
      expect(findButton('Reset Sorting')).toBeUndefined();

      /// G. Why protect the original collection? -
      // Verify the original Todo collection was not modified.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Clean up the saved sorting preference.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 84. Jasmine
  // Lesson 170 - Part 1:
  // Verify that switching between All, Active, and Completed
  // does not reset the saved Z-A sorting preference.
  it('should preserve descending sorting when switching filters', async () => {
    // ARRANGE: Create four Todos with mixed completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 17001,
        title: 'Apple Task',
        completed: false,
      }),
      createMockTodo({
        id: 17002,
        title: 'Zebra Task',
        completed: true,
      }),
      createMockTodo({
        id: 17003,
        title: 'Banana Task',
        completed: false,
      }),
      createMockTodo({
        id: 17004,
        title: 'Mango Task',
        completed: true,
      }),
    ];

    // Preserve the original collection for mutation checking.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Make TodoService return predictable test data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form bindings to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the actual HTML sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    expect(sortSelect).not.toBeNull();

    // Helper: Read the currently displayed Todo titles.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Helper: Click a filter button using its exact visible text.
    const clickFilter = async (label: string): Promise<void> => {
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      /// C. Why find the filter button by exact text? - Your page contains several buttons. Using an exact label helps ensure the test clicks Active, Completed, or All, instead of another button with a similar name.
      const filterButton = buttons.find(
        (button) => button.textContent?.trim() === label,
      );

      // Confirm the requested filter button exists.
      expect(filterButton).toBeDefined();

      // Trigger the actual Angular click binding.
      filterButton!.click();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    /// B. Why use filterCases? - We're using data-driven testing again. Each object specifies: (Property) = (Purpose) 1. label = Exact text of the filter button to click, 2. value = Expected component.filter state, 3. expectedTitles = 	Expected Todo titles in displayed order. - This avoids writing three nearly identical tests.
    // Define filter scenarios and expected rendered titles.
    const filterCases = [
      {
        label: 'Active',
        value: 'active',
        expectedTitles: ['Banana Task', 'Apple Task'],
      },
      {
        label: 'Completed',
        value: 'completed',
        expectedTitles: ['Zebra Task', 'Mango Task'],
      },
      {
        label: 'All',
        value: 'all',
        expectedTitles: [
          'Zebra Task',
          'Mango Task',
          'Banana Task',
          'Apple Task',
        ],
      },
    ];

    /// A. What does independent component state mean? - Your Todo List manages three different properties: 1. filter: TodoFilter = 'all'; 2. searchTerm = ''; 3. sortOrder: TodoSortOrder = 'default';
    /// Each property controls a different feature. When a user changes filter, Angular should recalculate the displayed tasks without resetting sortOrder.
    try {
      // STEP 1: Verify the component's initial state.
      expect(component.sortOrder).toBe('default');
      expect(component.filter).toBe('all');
      expect(component.searchTerm).toBe('');

      // Verify the original Todo order.
      expect(getDisplayedTitles()).toEqual([
        'Apple Task',
        'Zebra Task',
        'Banana Task',
        'Mango Task',
      ]);

      // STEP 2: Select Title: Z-A through the real dropdown.
      sortSelect.value = 'desc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify descending sorting is selected.
      expect(component.sortOrder).toBe('desc');

      // Verify the preference was saved.
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');

      // Verify all Todos are displayed in Z-A order.
      expect(getDisplayedTitles()).toEqual([
        'Zebra Task',
        'Mango Task',
        'Banana Task',
        'Apple Task',
      ]);

      // STEP 3: Switch between filters.
      for (const filterCase of filterCases) {
        // Click the real filter button.
        await clickFilter(filterCase.label);

        // Verify the correct filter was selected.
        expect(component.filter).toBe(filterCase.value);

        // Verify the correct Todos are displayed in Z-A order.
        expect(getDisplayedTitles()).toEqual(filterCase.expectedTitles); /// E. Why verify the actual rendered titles? - This checks two things simultaneously: 1. The selected filter displays the correct tasks. 2. Those tasks remain sorted Z–A.

        /// D. Why check sorting after every filter change? - We're checking three different layers: - Component state: Angular still uses descending sorting, - HTML state: The dropdown still displays the selected option and - Persistent state: localStorage still remembers descending sorting. - If any layer becomes inconsistent, the test will identify it.
        // Verify the sorting preference was not reset.
        expect(component.sortOrder).toBe('desc');

        // Verify the HTML dropdown still shows Z-A.
        expect(sortSelect.value).toBe('desc');

        // Verify the saved preference remains unchanged.
        expect(localStorage.getItem('todoSortOrder')).toBe('desc');

        // Verify filtering does not introduce a search term.
        expect(component.searchTerm).toBe('');
      }

      // STEP 4: Verify the source Todo collection was unchanged.
      expect(mockTodos).toEqual(originalTodos); /// F. Why protect the original array? - Filtering and sorting should only change the processed Todo view. The original array returned by TodoService must not be deleted, rearranged, or modified.
    } finally {
      // Clean up the saved sorting preference.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 85. Jasmine
  // Lesson 170 - Part 2:
  // Verify that repeatedly changing the search term
  // does not reset ascending sorting or its saved preference.
  it('should preserve ascending sorting across repeated search changes', async () => {
    // ARRANGE: Create predictable mock Todos.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 17011,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 17012,
        title: 'Zebra Task',
        completed: true,
      }),
      createMockTodo({
        id: 17013,
        title: 'Angular Testing',
        completed: true,
      }),
      createMockTodo({
        id: 17014,
        title: 'Practice TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 17015,
        title: 'Apple Task',
        completed: false,
      }),
    ];

    // Preserve the original data and array order.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Make TodoService return our mock data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Allow Angular's form bindings to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the actual sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Retrieve the actual search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    // Confirm both elements exist.
    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Helper: Read titles from the rendered Todo items.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    /// B. Why use changeSearch()? - Using this helper keeps the test readable while we perform several searches.
    // Helper: Simulate a real search-input change.
    const changeSearch = async (value: string): Promise<void> => {
      searchInput.value = value;
      searchInput.dispatchEvent(new Event('input'));

      await fixture.whenStable();
      fixture.detectChanges();
    };

    /// A. Why use multiple search terms? - This is data-driven testing. Each test case contains the search input and the exact displayed results we expect. Returning to angular at the end also verifies that previous results can be restored after several different searches.
    // Define several search scenarios.
    const searchCases = [
      {
        term: 'angular',
        expectedTitles: ['Angular Testing', 'Study Angular'],
      },
      {
        term: 'typescript',
        expectedTitles: ['Practice TypeScript'],
      },
      {
        term: 'task',
        expectedTitles: ['Apple Task', 'Zebra Task'],
      },
      {
        term: 'angular',
        expectedTitles: ['Angular Testing', 'Study Angular'],
      },
    ];

    try {
      // STEP 1: Confirm initial component state.
      expect(component.sortOrder).toBe('default');
      expect(component.filter).toBe('all');
      expect(component.searchTerm).toBe('');

      // STEP 2: Select Title: A-Z using the real dropdown.
      sortSelect.value = 'asc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      /// D. Why verify sorting after every search? - These assertions check three layers of the application: TypeScript component = sortOrder remains 'asc', HTML dropdown	= A–Z remains selected, Browser localStorage =	'asc' remains saved. Searching should not reset any of these.
      // Verify ascending sorting was selected and saved.
      expect(component.sortOrder).toBe('asc');
      expect(sortSelect.value).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // Verify all Todos initially appear in A-Z order.
      expect(getDisplayedTitles()).toEqual([
        'Angular Testing',
        'Apple Task',
        'Practice TypeScript',
        'Study Angular',
        'Zebra Task',
      ]);

      // STEP 3: Change the search term repeatedly.
      for (const searchCase of searchCases) {
        // Type the new search term through the HTML input.
        await changeSearch(searchCase.term);

        // Verify Angular received the correct search term.
        expect(component.searchTerm).toBe(searchCase.term);

        // Verify the rendered Todos match the current search.
        expect(getDisplayedTitles()).toEqual(searchCase.expectedTitles); /// C. Why check the displayed Todo titles? - This verifies the search produces the correct visible result. Because our expected arrays are ordered, it also checks that ascending sorting remains effective.

        // Verify the All filter remains selected.
        expect(component.filter).toBe('all');

        // Verify the sorting preference was not reset.
        expect(component.sortOrder).toBe('asc');

        // Verify the HTML dropdown still shows A-Z.
        expect(sortSelect.value).toBe('asc');

        // Verify localStorage still contains "asc".
        expect(localStorage.getItem('todoSortOrder')).toBe('asc');
      }

      /// E. Why check the source data? - A search should only change which Todo items are displayed. It should not rename, delete, or reorder the original collection.
      // STEP 4: Confirm searching did not modify the source data.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Clean up the saved sorting preference after testing.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 86. Jasmine
  // Lesson 170 - Part 3:
  // Verify that empty search and filter combinations
  // do not reset descending sorting or its saved preference.
  it('should preserve descending sorting through empty search and filter results', async () => {
    // ARRANGE: Create Todos with mixed completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 17021,
        title: 'Zebra Angular',
        completed: false,
      }),
      createMockTodo({
        id: 17022,
        title: 'Apple Angular',
        completed: true,
      }),
      createMockTodo({
        id: 17023,
        title: 'Banana TypeScript',
        completed: false,
      }),
      createMockTodo({
        id: 17024,
        title: 'Mango TypeScript',
        completed: true,
      }),
    ];

    // Preserve the original Todo data for mutation checking.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Mock TodoService to return predictable data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form bindings.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the actual sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Retrieve the actual search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    // Verify that both controls exist.
    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Helper: Read rendered Todo titles.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Helper: Simulate a real filter button click.
    const clickFilter = async (label: string): Promise<void> => {
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      const filterButton = buttons.find(
        (button) => button.textContent?.trim() === label,
      );

      expect(filterButton).toBeDefined();

      filterButton!.click();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    // Helper: Simulate typing into the search input.
    const changeSearch = async (value: string): Promise<void> => {
      searchInput.value = value;
      searchInput.dispatchEvent(new Event('input'));

      await fixture.whenStable();
      fixture.detectChanges();
    };

    // Helper: Verify the same sorting preference remains selected.
    const expectDescendingSorting = (): void => {
      expect(component.sortOrder).toBe('desc');
      expect(sortSelect.value).toBe('desc');
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');
    };

    try {
      // STEP 1: Select Title: Z-A.
      sortSelect.value = 'desc';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify the selected sorting preference.
      expectDescendingSorting();

      // Verify all Todos initially appear in descending order.
      expect(getDisplayedTitles()).toEqual([
        'Zebra Angular',
        'Mango TypeScript',
        'Banana TypeScript',
        'Apple Angular',
      ]);

      // STEP 2: Select Completed filtering.
      await clickFilter('Completed');

      expect(component.filter).toBe('completed');

      expect(getDisplayedTitles()).toEqual([
        'Mango TypeScript',
        'Apple Angular',
      ]);

      expectDescendingSorting();

      // STEP 3: Search for "zebra".
      await changeSearch('zebra');

      expect(component.searchTerm).toBe('zebra');

      // Zebra Angular is unfinished, so Completed + zebra
      // should produce no matching Todos.
      expect(getDisplayedTitles()).toEqual([]);
      expect(component.filteredTodos).toEqual([]);

      // An empty result must not reset sorting.
      expectDescendingSorting();

      // STEP 4: Switch to Active without changing the search.
      await clickFilter('Active');

      expect(component.filter).toBe('active');
      expect(component.searchTerm).toBe('zebra');

      // The matching unfinished Todo should reappear.
      expect(getDisplayedTitles()).toEqual(['Zebra Angular']);

      expectDescendingSorting();

      // STEP 5: Switch back to Completed.
      await clickFilter('Completed');

      expect(component.filter).toBe('completed');

      // The same search should again produce an empty list.
      expect(getDisplayedTitles()).toEqual([]);

      expectDescendingSorting();

      // STEP 6: Clear the search through the HTML input.
      await changeSearch('');

      expect(component.searchTerm).toBe('');

      // Completed Todos should return in descending order.
      expect(getDisplayedTitles()).toEqual([
        'Mango TypeScript',
        'Apple Angular',
      ]);

      // Verify the Completed filter remains selected.
      expect(component.filter).toBe('completed');

      // Verify sorting was preserved throughout.
      expectDescendingSorting();

      // STEP 7: Verify the original Todo data was unchanged.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Clean up the saved sorting preference.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 87. Jasmine
  // Lesson 170 - Part 4:
  // Verify that Active First sorting survives repeated
  // search and filter changes, including empty results.
  it('should preserve active-first sorting across complex search and filter changes', async () => {
    // ARRANGE: Create five Todos with mixed completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 17031,
        title: 'Submit Angular Report',
        completed: true,
      }),
      createMockTodo({
        id: 17032,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 17033,
        title: 'Review TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 17034,
        title: 'Practice Angular',
        completed: false,
      }),
      createMockTodo({
        id: 17035,
        title: 'Build Portfolio',
        completed: false,
      }),
    ];

    // Save the original data to detect unwanted mutations.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Make TodoService return our predictable test data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Wait for Angular's form bindings to initialize.
    await fixture.whenStable();
    fixture.detectChanges();

    // Retrieve the real sorting dropdown.
    const sortSelect = fixture.nativeElement.querySelector(
      '#todo-sort-select',
    ) as HTMLSelectElement;

    // Retrieve the real search input.
    const searchInput = fixture.nativeElement.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;

    // Confirm both HTML controls exist.
    expect(sortSelect).not.toBeNull();
    expect(searchInput).not.toBeNull();

    // Helper: Read rendered Todo titles in display order.
    const getDisplayedTitles = (): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Helper: Click a filter button using its exact label.
    const clickFilter = async (label: string): Promise<void> => {
      const buttons: HTMLButtonElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      );

      const filterButton = buttons.find(
        (button) => button.textContent?.trim() === label,
      );

      expect(filterButton).toBeDefined();

      filterButton!.click();

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    // Helper: Simulate changing the real search input.
    const changeSearch = async (value: string): Promise<void> => {
      searchInput.value = value;
      searchInput.dispatchEvent(new Event('input'));

      await fixture.whenStable();
      fixture.detectChanges();
    };

    // Helper: Check that Active First remains selected and saved.
    const expectActiveFirstSorting = (): void => {
      expect(component.sortOrder).toBe('active-first');
      expect(sortSelect.value).toBe('active-first');
      expect(localStorage.getItem('todoSortOrder')).toBe('active-first');
    };

    try {
      // STEP 1: Select Active First using the actual dropdown.
      sortSelect.value = 'active-first';
      sortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify the selected preference and initial rendered order.
      expectActiveFirstSorting();

      expect(getDisplayedTitles()).toEqual([
        'Study Angular',
        'Practice Angular',
        'Build Portfolio',
        'Submit Angular Report',
        'Review TypeScript',
      ]);

      // STEP 2: Search for "angular".
      await changeSearch('angular');

      expect(component.searchTerm).toBe('angular');

      expect(getDisplayedTitles()).toEqual([
        'Study Angular',
        'Practice Angular',
        'Submit Angular Report',
      ]);

      expectActiveFirstSorting();

      // STEP 3: Switch to Completed.
      await clickFilter('Completed');

      expect(component.filter).toBe('completed');

      expect(getDisplayedTitles()).toEqual(['Submit Angular Report']);

      expectActiveFirstSorting();

      // STEP 4: Search for TypeScript while Completed is selected.
      await changeSearch('typescript');

      expect(component.searchTerm).toBe('typescript');

      expect(getDisplayedTitles()).toEqual(['Review TypeScript']);

      expectActiveFirstSorting();

      // STEP 5: Switch to Active without changing the search.
      await clickFilter('Active');

      expect(component.filter).toBe('active');

      // No unfinished task matches "typescript".
      expect(getDisplayedTitles()).toEqual([]);
      expect(component.filteredTodos).toEqual([]);

      // Sorting must survive an empty result.
      expectActiveFirstSorting();

      // STEP 6: Search for Angular while Active is selected.
      await changeSearch('angular');

      expect(component.searchTerm).toBe('angular');

      expect(getDisplayedTitles()).toEqual([
        'Study Angular',
        'Practice Angular',
      ]);

      expectActiveFirstSorting();

      // STEP 7: Switch back to All.
      await clickFilter('All');

      expect(component.filter).toBe('all');

      expect(getDisplayedTitles()).toEqual([
        'Study Angular',
        'Practice Angular',
        'Submit Angular Report',
      ]);

      expectActiveFirstSorting();

      // STEP 8: Clear the search through the actual input.
      await changeSearch('');

      expect(component.searchTerm).toBe('');
      expect(searchInput.value).toBe('');

      // All Todos return with unfinished tasks first.
      expect(getDisplayedTitles()).toEqual([
        'Study Angular',
        'Practice Angular',
        'Build Portfolio',
        'Submit Angular Report',
        'Review TypeScript',
      ]);

      // Verify the final filter remains All.
      expect(component.filter).toBe('all');

      // Confirm Active First was preserved throughout.
      expectActiveFirstSorting();

      // STEP 9: Verify the original source data was not modified.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Clean up saved sorting state after the test.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 88. Jasmine
  // Lesson 171 - Part 1:
  // Verify that saved A-Z sorting survives component recreation,
  // an empty search, and recovery through the Clear Search button.
  it('should preserve restored ascending sorting through empty search recovery', async () => {
    // ARRANGE: Create three mock Todos in non-alphabetical order.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 17101,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 17102,
        title: 'Apple Task',
        completed: true,
      }),
      createMockTodo({
        id: 17103,
        title: 'Banana Task',
        completed: false,
      }),
    ];

    // Save a copy of the original data to detect mutations.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Make TodoService return our predictable test data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Helper: Read displayed Todo titles from any component fixture.
    const getDisplayedTitles = (
      currentFixture: ComponentFixture<TodoListComponent>,
    ): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        currentFixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Keep a reference to the replacement fixture for cleanup.
    let newFixture: ComponentFixture<TodoListComponent> | undefined;

    try {
      // STEP 1: Initialize the original component.
      await fixture.whenStable();
      fixture.detectChanges();

      // Verify the original component starts with default sorting.
      expect(component.sortOrder).toBe('default');

      expect(getDisplayedTitles(fixture)).toEqual([
        'Zebra Task',
        'Apple Task',
        'Banana Task',
      ]);

      // STEP 2: Retrieve the original sorting dropdown.
      const originalSortSelect = fixture.nativeElement.querySelector(
        '#todo-sort-select',
      ) as HTMLSelectElement;

      expect(originalSortSelect).not.toBeNull();

      // Select Title: A-Z through the real HTML dropdown.
      originalSortSelect.value = 'asc';
      originalSortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify A-Z sorting was selected and saved.
      expect(component.sortOrder).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // Verify the original component now displays A-Z order.
      expect(getDisplayedTitles(fixture)).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      // STEP 3: Destroy the original component.
      fixture.destroy();

      // Confirm localStorage still contains the saved preference.
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // STEP 4: Create a replacement TodoListComponent.
      newFixture = TestBed.createComponent(TodoListComponent);

      // Trigger ngOnInit() and loadSortOrder().
      newFixture.detectChanges();

      await newFixture.whenStable();
      newFixture.detectChanges();

      // Retrieve the NEW component instance.
      const newComponent = newFixture.componentInstance;

      // Verify ascending sorting was restored.
      expect(newComponent.sortOrder).toBe('asc');

      // Retrieve the NEW component's sorting dropdown.
      const newSortSelect = newFixture.nativeElement.querySelector(
        '#todo-sort-select',
      ) as HTMLSelectElement;

      // Retrieve the NEW component's search input.
      const searchInput = newFixture.nativeElement.querySelector(
        'input[placeholder*="Search"]',
      ) as HTMLInputElement;

      // Confirm both controls exist.
      expect(newSortSelect).not.toBeNull();
      expect(searchInput).not.toBeNull();

      // Verify the new dropdown displays A-Z.
      expect(newSortSelect.value).toBe('asc');

      // Verify Todos are already sorted correctly after recreation.
      expect(getDisplayedTitles(newFixture)).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      // STEP 5: Search for a term with no matches.
      searchInput.value = 'pineapple';
      searchInput.dispatchEvent(new Event('input'));

      await newFixture.whenStable();
      newFixture.detectChanges();

      // Verify Angular received the search term.
      expect(newComponent.searchTerm).toBe('pineapple');

      // Verify the rendered list is empty.
      expect(getDisplayedTitles(newFixture)).toEqual([]);

      // Verify the component's filtered collection is empty.
      expect(newComponent.filteredTodos).toEqual([]);

      // Verify A-Z sorting was NOT reset by the empty result.
      expect(newComponent.sortOrder).toBe('asc');
      expect(newSortSelect.value).toBe('asc');
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // STEP 6: Find the actual Clear Search button.
      const buttons: HTMLButtonElement[] = Array.from(
        newFixture.nativeElement.querySelectorAll('button'),
      );

      const clearSearchButton = buttons.find((button) =>
        button.textContent?.trim().toLowerCase().includes('clear search'),
      );

      // The button must be available during empty results.
      expect(clearSearchButton).toBeDefined();

      // Click the actual Clear Search button.
      clearSearchButton!.click();

      newFixture.detectChanges();
      await newFixture.whenStable();
      newFixture.detectChanges();

      // STEP 7: Verify the search was cleared.
      expect(newComponent.searchTerm).toBe('');
      expect(searchInput.value).toBe('');

      // Verify all Todos returned in A-Z order.
      expect(getDisplayedTitles(newFixture)).toEqual([
        'Apple Task',
        'Banana Task',
        'Zebra Task',
      ]);

      // Verify exactly three Todos are visible.
      expect(
        newFixture.nativeElement.querySelectorAll('app-todo-item').length,
      ).toBe(3);

      // Verify the All filter remained selected.
      expect(newComponent.filter).toBe('all');

      // Verify ascending sorting is still restored and selected.
      expect(newComponent.sortOrder).toBe('asc');
      expect(newSortSelect.value).toBe('asc');

      // Verify localStorage still contains the saved preference.
      expect(localStorage.getItem('todoSortOrder')).toBe('asc');

      // Verify the original Todo collection was not modified.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Destroy the replacement component if it was created.
      newFixture?.destroy();

      // Remove the saved sorting preference after this test.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 89. Jasmine
  // Lesson 171 - Part 2:
  // Verify that saved Z-A sorting survives component recreation,
  // empty Completed filtering, and recovery through filter changes.
  it('should preserve restored descending sorting through empty filter recovery', async () => {
    // ARRANGE: Create four unfinished Todos.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 17111,
        title: 'Apple Task',
        completed: false,
      }),
      createMockTodo({
        id: 17112,
        title: 'Zebra Task',
        completed: false,
      }),
      createMockTodo({
        id: 17113,
        title: 'Banana Task',
        completed: false,
      }),
      createMockTodo({
        id: 17114,
        title: 'Mango Task',
        completed: false,
      }),
    ];

    // Preserve the original array and Todo values.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Make TodoService return our controlled test data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Helper: Read rendered Todo titles from a chosen fixture.
    const getDisplayedTitles = (
      currentFixture: ComponentFixture<TodoListComponent>,
    ): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        currentFixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Helper: Click a filter button in a chosen fixture.
    const clickFilter = async (
      currentFixture: ComponentFixture<TodoListComponent>,
      label: string,
    ): Promise<void> => {
      const buttons: HTMLButtonElement[] = Array.from(
        currentFixture.nativeElement.querySelectorAll('button'),
      );

      // Match the exact visible label.
      const filterButton = buttons.find(
        (button) => button.textContent?.trim() === label,
      );

      expect(filterButton).toBeDefined();

      // Trigger the actual Angular click handler.
      filterButton!.click();

      currentFixture.detectChanges();
      await currentFixture.whenStable();
      currentFixture.detectChanges();
    };

    // Hold the replacement fixture for cleanup.
    let newFixture: ComponentFixture<TodoListComponent> | undefined;

    try {
      // STEP 1: Initialize the original component.
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.sortOrder).toBe('default');

      expect(getDisplayedTitles(fixture)).toEqual([
        'Apple Task',
        'Zebra Task',
        'Banana Task',
        'Mango Task',
      ]);

      // STEP 2: Retrieve the original sorting dropdown.
      const originalSortSelect = fixture.nativeElement.querySelector(
        '#todo-sort-select',
      ) as HTMLSelectElement;

      expect(originalSortSelect).not.toBeNull();

      // Select Title: Z-A through the actual dropdown.
      originalSortSelect.value = 'desc';
      originalSortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify the original component saved Z-A sorting.
      expect(component.sortOrder).toBe('desc');
      expect(originalSortSelect.value).toBe('desc');
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');

      // Verify the original component displays descending order.
      expect(getDisplayedTitles(fixture)).toEqual([
        'Zebra Task',
        'Mango Task',
        'Banana Task',
        'Apple Task',
      ]);

      // STEP 3: Destroy the original component.
      fixture.destroy();

      // Verify the saved preference survives destruction.
      expect(localStorage.getItem('todoSortOrder')).toBe('desc');

      // STEP 4: Create and initialize a new component.
      newFixture = TestBed.createComponent(TodoListComponent);

      newFixture.detectChanges();

      await newFixture.whenStable();
      newFixture.detectChanges();

      // Retrieve the NEW component instance.
      const newComponent = newFixture.componentInstance;

      // Retrieve the NEW sorting dropdown.
      const newSortSelect = newFixture.nativeElement.querySelector(
        '#todo-sort-select',
      ) as HTMLSelectElement;

      expect(newSortSelect).not.toBeNull();

      // Helper: Verify restored Z-A sorting in three places.
      const expectRestoredSorting = (): void => {
        expect(newComponent.sortOrder).toBe('desc');
        expect(newSortSelect.value).toBe('desc');
        expect(localStorage.getItem('todoSortOrder')).toBe('desc');
      };

      // Verify Z-A sorting was restored automatically.
      expectRestoredSorting();

      // Verify the recreated component renders descending order.
      expect(getDisplayedTitles(newFixture)).toEqual([
        'Zebra Task',
        'Mango Task',
        'Banana Task',
        'Apple Task',
      ]);

      // STEP 5: Select Completed in the recreated component.
      await clickFilter(newFixture, 'Completed');

      expect(newComponent.filter).toBe('completed');

      // There are no completed Todos in our mock data.
      expect(getDisplayedTitles(newFixture)).toEqual([]);
      expect(newComponent.filteredTodos).toEqual([]);

      // An empty result must not reset the saved sorting preference.
      expectRestoredSorting();

      // STEP 6: Switch to Active.
      await clickFilter(newFixture, 'Active');

      expect(newComponent.filter).toBe('active');

      // All four unfinished Todos should reappear in Z-A order.
      expect(getDisplayedTitles(newFixture)).toEqual([
        'Zebra Task',
        'Mango Task',
        'Banana Task',
        'Apple Task',
      ]);

      expectRestoredSorting();

      // STEP 7: Switch back to All.
      await clickFilter(newFixture, 'All');

      expect(newComponent.filter).toBe('all');

      // The same four tasks should remain in descending order.
      expect(getDisplayedTitles(newFixture)).toEqual([
        'Zebra Task',
        'Mango Task',
        'Banana Task',
        'Apple Task',
      ]);

      // Verify searching was never changed.
      expect(newComponent.searchTerm).toBe('');

      // Verify the restored sorting preference still exists.
      expectRestoredSorting();

      // STEP 8: Confirm the source Todo collection is unchanged.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Destroy the replacement component, if it was created.
      newFixture?.destroy();

      // Remove the saved preference after this test.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 90. Jasmine
  // Lesson 171 - Part 3:
  // Verify that Completed First sorting survives component
  // recreation, an empty search, and Clear Search recovery.
  it('should preserve restored completed-first sorting through empty search recovery', async () => {
    // ARRANGE: Create five Todos with mixed completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 17121,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 17122,
        title: 'Submit Report',
        completed: true,
      }),
      createMockTodo({
        id: 17123,
        title: 'Fix Laptop',
        completed: false,
      }),
      createMockTodo({
        id: 17124,
        title: 'Review Tests',
        completed: true,
      }),
      createMockTodo({
        id: 17125,
        title: 'Build Portfolio',
        completed: false,
      }),
    ];

    // Save a snapshot to check that source data is not mutated.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Mock the service to supply our predictable Todos.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Helper: Read displayed Todo titles from a given fixture.
    const getDisplayedTitles = (
      currentFixture: ComponentFixture<TodoListComponent>,
    ): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        currentFixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Expected order when Completed First is selected.
    const completedFirstTitles = [
      'Submit Report',
      'Review Tests',
      'Study Angular',
      'Fix Laptop',
      'Build Portfolio',
    ];

    // Keep a reference to the replacement fixture for cleanup.
    let newFixture: ComponentFixture<TodoListComponent> | undefined;

    try {
      // STEP 1: Initialize the original component.
      await fixture.whenStable();
      fixture.detectChanges();

      // Verify initial default sorting.
      expect(component.sortOrder).toBe('default');

      expect(getDisplayedTitles(fixture)).toEqual([
        'Study Angular',
        'Submit Report',
        'Fix Laptop',
        'Review Tests',
        'Build Portfolio',
      ]);

      // STEP 2: Find the original sorting dropdown.
      const originalSortSelect = fixture.nativeElement.querySelector(
        '#todo-sort-select',
      ) as HTMLSelectElement;

      expect(originalSortSelect).not.toBeNull();

      // Select Completed First using the actual dropdown.
      originalSortSelect.value = 'completed-first';

      originalSortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify the selected preference was saved.
      expect(component.sortOrder).toBe('completed-first');

      expect(localStorage.getItem('todoSortOrder')).toBe('completed-first');

      // Verify the original component displays completed tasks first.
      expect(getDisplayedTitles(fixture)).toEqual(completedFirstTitles);

      // STEP 3: Destroy the original component.
      fixture.destroy();

      // Confirm the preference remains saved.
      expect(localStorage.getItem('todoSortOrder')).toBe('completed-first');

      // STEP 4: Recreate TodoListComponent.
      newFixture = TestBed.createComponent(TodoListComponent);

      // Trigger ngOnInit() and loadSortOrder().
      newFixture.detectChanges();

      await newFixture.whenStable();
      newFixture.detectChanges();

      // Obtain the newly created component.
      const newComponent = newFixture.componentInstance;

      // Retrieve the new component's sorting dropdown.
      const newSortSelect = newFixture.nativeElement.querySelector(
        '#todo-sort-select',
      ) as HTMLSelectElement;

      // Retrieve the new component's search input.
      const searchInput = newFixture.nativeElement.querySelector(
        'input[placeholder*="Search"]',
      ) as HTMLInputElement;

      expect(newSortSelect).not.toBeNull();
      expect(searchInput).not.toBeNull();

      // Helper: Verify Completed First remains selected everywhere.
      const expectCompletedFirstSorting = (): void => {
        expect(newComponent.sortOrder).toBe('completed-first');
        expect(newSortSelect.value).toBe('completed-first');
        expect(localStorage.getItem('todoSortOrder')).toBe('completed-first');
      };

      // Verify the new component restored the preference.
      expectCompletedFirstSorting();

      // Verify the rendered order is correct after recreation.
      expect(getDisplayedTitles(newFixture)).toEqual(completedFirstTitles);

      // STEP 5: Search for a nonexistent Todo.
      searchInput.value = 'pineapple';

      searchInput.dispatchEvent(new Event('input'));

      await newFixture.whenStable();
      newFixture.detectChanges();

      // Verify Angular received the typed search term.
      expect(newComponent.searchTerm).toBe('pineapple');

      // No Todo title matches "pineapple".
      expect(getDisplayedTitles(newFixture)).toEqual([]);

      // The component's processed list should also be empty.
      expect(newComponent.filteredTodos).toEqual([]);

      // Empty results must not reset Completed First sorting.
      expectCompletedFirstSorting();

      // STEP 6: Find the actual Clear Search button.
      const buttons: HTMLButtonElement[] = Array.from(
        newFixture.nativeElement.querySelectorAll('button'),
      );

      const clearSearchButton = buttons.find((button) =>
        button.textContent?.trim().toLowerCase().includes('clear search'),
      );

      expect(clearSearchButton).toBeDefined();

      // Click the button to restore all Todos.
      clearSearchButton!.click();

      newFixture.detectChanges();
      await newFixture.whenStable();
      newFixture.detectChanges();

      // STEP 7: Verify the search input was cleared.
      expect(newComponent.searchTerm).toBe('');
      expect(searchInput.value).toBe('');

      // All five Todos should return with completed tasks first.
      expect(getDisplayedTitles(newFixture)).toEqual(completedFirstTitles);

      // Verify all five Todo components are rendered.
      expect(
        newFixture.nativeElement.querySelectorAll('app-todo-item').length,
      ).toBe(5);

      // Verify that the All filter remained selected.
      expect(newComponent.filter).toBe('all');

      // Verify Completed First was preserved after recovery.
      expectCompletedFirstSorting();

      // STEP 8: Verify the original Todo collection is unchanged.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Destroy the recreated fixture if it exists.
      newFixture?.destroy();

      // Remove the saved preference after the test.
      localStorage.removeItem('todoSortOrder');
    }
  });

  // 91. Jasmine
  // Lesson 171 - Part 4:
  // Verify that saved Active First sorting survives component
  // recreation, empty search/filter results, and recovery.
  it('should preserve restored active-first sorting through combined search and filter recovery', async () => {
    // ARRANGE: Create predictable Todos with mixed completion states.
    const mockTodos: Todo[] = [
      createMockTodo({
        id: 17131,
        title: 'Submit Angular Report',
        completed: true,
      }),
      createMockTodo({
        id: 17132,
        title: 'Study Angular',
        completed: false,
      }),
      createMockTodo({
        id: 17133,
        title: 'Review TypeScript',
        completed: true,
      }),
      createMockTodo({
        id: 17134,
        title: 'Practice Angular',
        completed: false,
      }),
      createMockTodo({
        id: 17135,
        title: 'Build Portfolio',
        completed: false,
      }),
    ];

    // Preserve the original Todo collection.
    const originalTodos = mockTodos.map((todo) => ({ ...todo }));

    // Make TodoService return our controlled test data.
    spyOn(TestBed.inject(TodoService), 'getTodos').and.returnValue(mockTodos);

    // Helper: Read Todo titles from the supplied component fixture.
    const getDisplayedTitles = (
      currentFixture: ComponentFixture<TodoListComponent>,
    ): string[] => {
      const todoItems: HTMLElement[] = Array.from(
        currentFixture.nativeElement.querySelectorAll('app-todo-item'),
      );

      return todoItems.map(
        (item) => item.querySelector('.todo-title')?.textContent?.trim() ?? '',
      );
    };

    // Helper: Click a filter button in the supplied fixture.
    const clickFilter = async (
      currentFixture: ComponentFixture<TodoListComponent>,
      label: string,
    ): Promise<void> => {
      const buttons: HTMLButtonElement[] = Array.from(
        currentFixture.nativeElement.querySelectorAll('button'),
      );

      const filterButton = buttons.find(
        (button) => button.textContent?.trim() === label,
      );

      expect(filterButton).toBeDefined();

      // Trigger the real Angular click binding.
      filterButton!.click();

      currentFixture.detectChanges();
      await currentFixture.whenStable();
      currentFixture.detectChanges();
    };

    // Expected order when Active First sorting is selected.
    const activeFirstTitles = [
      'Study Angular',
      'Practice Angular',
      'Build Portfolio',
      'Submit Angular Report',
      'Review TypeScript',
    ];

    // Hold the recreated component fixture for cleanup.
    let newFixture: ComponentFixture<TodoListComponent> | undefined;

    try {
      // STEP 1: Initialize the original component.
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.sortOrder).toBe('default');

      // STEP 2: Select Active First through the original dropdown.
      const originalSortSelect = fixture.nativeElement.querySelector(
        '#todo-sort-select',
      ) as HTMLSelectElement;

      expect(originalSortSelect).not.toBeNull();

      originalSortSelect.value = 'active-first';
      originalSortSelect.dispatchEvent(new Event('change'));

      await fixture.whenStable();
      fixture.detectChanges();

      // Verify the preference was selected and saved.
      expect(component.sortOrder).toBe('active-first');

      expect(localStorage.getItem('todoSortOrder')).toBe('active-first');

      // Verify the original component displays Active First order.
      expect(getDisplayedTitles(fixture)).toEqual(activeFirstTitles);

      // STEP 3: Destroy the original component.
      fixture.destroy();

      // The saved sorting preference should remain available.
      expect(localStorage.getItem('todoSortOrder')).toBe('active-first');

      // STEP 4: Create a replacement component.
      newFixture = TestBed.createComponent(TodoListComponent);

      // Trigger ngOnInit(), including loadSortOrder().
      newFixture.detectChanges();

      await newFixture.whenStable();
      newFixture.detectChanges();

      // Retrieve the recreated component instance.
      const newComponent = newFixture.componentInstance;

      // Find the new component's sorting dropdown.
      const newSortSelect = newFixture.nativeElement.querySelector(
        '#todo-sort-select',
      ) as HTMLSelectElement;

      // Find the new component's search input.
      const searchInput = newFixture.nativeElement.querySelector(
        'input[placeholder*="Search"]',
      ) as HTMLInputElement;

      expect(newSortSelect).not.toBeNull();
      expect(searchInput).not.toBeNull();

      // Helper: Check saved sorting in the new component,
      // HTML dropdown, and localStorage.
      const expectActiveFirstSorting = (): void => {
        expect(newComponent.sortOrder).toBe('active-first');
        expect(newSortSelect.value).toBe('active-first');

        expect(localStorage.getItem('todoSortOrder')).toBe('active-first');
      };

      // Helper: Update the new component's real search input.
      const changeSearch = async (value: string): Promise<void> => {
        searchInput.value = value;
        searchInput.dispatchEvent(new Event('input'));

        await newFixture!.whenStable();
        newFixture!.detectChanges();
      };

      // Confirm Active First sorting was automatically restored.
      expectActiveFirstSorting();

      expect(getDisplayedTitles(newFixture)).toEqual(activeFirstTitles);

      // STEP 5: Click Completed in the recreated component.
      await clickFilter(newFixture, 'Completed');

      expect(newComponent.filter).toBe('completed');

      expect(getDisplayedTitles(newFixture)).toEqual([
        'Submit Angular Report',
        'Review TypeScript',
      ]);

      expectActiveFirstSorting();

      // STEP 6: Search for "portfolio".
      await changeSearch('portfolio');

      expect(newComponent.searchTerm).toBe('portfolio');

      // Build Portfolio is unfinished, so the Completed
      // filter and "portfolio" search produce no matches.
      expect(getDisplayedTitles(newFixture)).toEqual([]);
      expect(newComponent.filteredTodos).toEqual([]);

      // Empty results must not reset the saved sorting.
      expectActiveFirstSorting();

      // STEP 7: Switch to Active without clearing the search.
      await clickFilter(newFixture, 'Active');

      expect(newComponent.filter).toBe('active');
      expect(newComponent.searchTerm).toBe('portfolio');

      // Build Portfolio should now appear.
      expect(getDisplayedTitles(newFixture)).toEqual(['Build Portfolio']);

      expectActiveFirstSorting();

      // STEP 8: Replace the search with "angular".
      await changeSearch('angular');

      expect(newComponent.searchTerm).toBe('angular');

      expect(getDisplayedTitles(newFixture)).toEqual([
        'Study Angular',
        'Practice Angular',
      ]);

      expectActiveFirstSorting();

      // STEP 9: Switch to All.
      await clickFilter(newFixture, 'All');

      expect(newComponent.filter).toBe('all');

      // Unfinished Angular tasks appear before completed ones.
      expect(getDisplayedTitles(newFixture)).toEqual([
        'Study Angular',
        'Practice Angular',
        'Submit Angular Report',
      ]);

      expectActiveFirstSorting();

      // STEP 10: Find the actual Clear Search button.
      const buttons: HTMLButtonElement[] = Array.from(
        newFixture.nativeElement.querySelectorAll('button'),
      );

      const clearSearchButton = buttons.find((button) =>
        button.textContent?.trim().toLowerCase().includes('clear search'),
      );

      expect(clearSearchButton).toBeDefined();

      // Click the real Clear Search button.
      clearSearchButton!.click();

      newFixture.detectChanges();
      await newFixture.whenStable();
      newFixture.detectChanges();

      // STEP 11: Verify the search was cleared.
      expect(newComponent.searchTerm).toBe('');
      expect(searchInput.value).toBe('');

      // All five Todos return with unfinished tasks first.
      expect(getDisplayedTitles(newFixture)).toEqual(activeFirstTitles);

      // Verify that all five Todo items are rendered.
      expect(
        newFixture.nativeElement.querySelectorAll('app-todo-item').length,
      ).toBe(5);

      // Verify the All filter remains selected.
      expect(newComponent.filter).toBe('all');

      // Verify sorting stayed restored throughout the workflow.
      expectActiveFirstSorting();

      // STEP 12: Verify the source collection was not modified.
      expect(mockTodos).toEqual(originalTodos);
    } finally {
      // Destroy the recreated component if it was created.
      newFixture?.destroy();

      // Remove the saved sorting preference after the test.
      localStorage.removeItem('todoSortOrder');
    }
  });
});
