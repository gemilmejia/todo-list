import { Component, input, output } from '@angular/core';
import { ApiError } from '../../models/api-error.model';

@Component({
  selector: 'app-api-error',
  standalone: true,
  imports: [],
  templateUrl: './api-error.component.html',
  styleUrl: './api-error.component.css',
})
export class ApiErrorComponent {
  error = input.required<ApiError>(); // input means "This component expects its parent to give it an ApiError. or This component expects its parent to provide an ApiError as input."
  title = input('API Error'); // input means "This component expects its parent to give it a title. or This component expects its parent to provide a title as input."
  retry = output<void>(); // output means "This component can notify its parent that the user wants to retry. or This component can emit a value to its parent."

  getTypeLabel(): string {
    switch (this.error().type) {
      case 'network':
        return 'Network Error';

      case 'not-found':
        return 'Not Found';

      case 'server':
        return 'Server Error';

      case 'unknown':
        return 'Unknown Error';

      default:
        return 'API Error';
    }
  }

  getActionLabel(): string {
    switch (this.error().type) {
      case 'not-found':
        return '🔄 Reload Data';

      case 'network':
      case 'server':
      case 'unknown':
        return '🔄 Try Again';

      default:
        return '🔄 Try Again';
    }
  }

  onRetry(): void {
    this.retry.emit();
  }
}
