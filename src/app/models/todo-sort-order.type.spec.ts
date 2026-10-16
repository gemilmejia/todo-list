import { TODO_SORT_OPTIONS, isTodoSortOrder } from './todo-sort-order.type'; // 1. Import the function.

// 2. Create a test suite.
describe('isTodoSortOrder', () => {
  // 3. Define the behavior we're testing.
  /// 1. Accept all five valid sorting options
  it('should return true for valid Todo sort orders', () => {
    // 4. Check the returned values.
    expect(isTodoSortOrder('default')).toBeTrue();
    expect(isTodoSortOrder('asc')).toBeTrue();
    expect(isTodoSortOrder('desc')).toBeTrue();
    expect(isTodoSortOrder('active-first')).toBeTrue();
    expect(isTodoSortOrder('completed-first')).toBeTrue();
  });

  /// 2. Reject unsupported sorting options
  it('should return false for invalid Todo sort orders', () => {
    expect(isTodoSortOrder('random')).toBeFalse();
    expect(isTodoSortOrder('ascending')).toBeFalse();
    expect(isTodoSortOrder('')).toBeFalse();
  });

  /// 3. Reject null values
  it('should return false for null sort order', () => {
    // A. Simulate a missing sorting preference
    const savedSortOrder: string | null = null;

    // B. Pass the value to our type guard " isTodoSortOrder(savedSortOrder) "
    // C. Verify the expected result
    expect(isTodoSortOrder(savedSortOrder)).toBeFalse();
  });

  /// 4. Run the complete Angular test suite
  // npm test -- --watch=false
});

// Group related tests.
describe('TODO_SORT_OPTIONS', () => {
  // 1. Verify the number of sorting options
  it('should contain exactly five sorting options', () => {
    // Check the number of options.
    expect(TODO_SORT_OPTIONS.length).toBe(5);
  });

  // 2. Verify expected sorting values
  it('should contain the expected sorting values', () => {
    // A. Extract the sorting values
    const values = TODO_SORT_OPTIONS.map((option) => option.value);

    // B. Compare the actual and expected arrays
    expect(values).toEqual([
      'default',
      'asc',
      'desc',
      'active-first',
      'completed-first',
    ]);
  });

  // 3. Verify User-Friendly Sorting Labels
  it('should contain the expected sorting labels', () => {
    // A. Extract the labels
    const labels = TODO_SORT_OPTIONS.map((option) => option.label);

    // B. Verify the expected labels
    expect(labels).toEqual([
      'Default order',
      'Title: A–Z',
      'Title: Z–A',
      'Active Tasks First',
      'Completed Tasks First',
    ]);
  });

  // 4. Verify No Duplicate Sorting Values
  it('should not contain duplicate sorting values', () => {
    // A. Extract all sorting values
    const values = TODO_SORT_OPTIONS.map((option) => option.value);

    // B. Create a Set
    const uniqueValues = new Set(values);

    // C. Compare the number of values
    expect(uniqueValues.size).toBe(values.length);
  });

  // 5. Final Angular Test Suite Verification
  // npm test -- --watch=false
});
