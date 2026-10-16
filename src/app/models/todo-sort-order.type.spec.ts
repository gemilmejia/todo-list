import { isTodoSortOrder } from './todo-sort-order.type'; // 1. Import the function.

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
});
