import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiErrorComponent } from './api-error.component';

import type { ApiError } from '../../models/api-error.model';

describe('ApiErrorComponent', () => {
  let component: ApiErrorComponent;
  let fixture: ComponentFixture<ApiErrorComponent>;

  const mockError: ApiError = {
    message: 'Failed to load Todo data.',
    status: 500,
    type: 'server',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiErrorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApiErrorComponent); // 1. Create component
    component = fixture.componentInstance;

    fixture.componentRef.setInput('error', mockError); // 2. Set the required 'error' input.

    fixture.detectChanges(); // 3. Run 'fixture.detectChanges().
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
