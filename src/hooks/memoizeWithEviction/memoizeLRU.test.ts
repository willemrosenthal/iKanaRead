// import { expect, describe, it } from 'vitest';
// import memoizeLRU from './memoizeLRU';

// describe('memoizeLRU', () => {
//   // Test basic memoization
//   it('should memoize function results', () => {
//     let callCount = 0;
//     const add = (a: number, b: number) => {
//       callCount++;
//       return a + b;
//     };

//     const memoizedAdd = memoizeLRU(add);

//     expect(memoizedAdd(1, 2)).toBe(3);
//     expect(memoizedAdd(1, 2)).toBe(3);
//     expect(callCount).toBe(1); // Function should only be called once
//   });

//   // Test LRU eviction
//   it('should evict least recently used items when cache is full', () => {
//     let callCount = 0;
//     const fn = (n: number) => {
//       callCount++;
//       return n;
//     };

//     const memoizedFn = memoizeLRU(fn, 2); // Cache size of 2

//     memoizedFn(1); // Cache: [1]
//     memoizedFn(2); // Cache: [1, 2]
//     memoizedFn(3); // Cache: [2, 3], 1 is evicted
//     memoizedFn(2); // Cache: [3, 2], 2 is accessed
//     memoizedFn(1); // Cache: [2, 1], 3 is evicted

//     const initialCallCount = callCount;
//     memoizedFn(2); // Should be cached
//     memoizedFn(1); // Should be cached
//     memoizedFn(3); // Should not be cached

//     expect(callCount).toBe(initialCallCount + 1);
//   });

//   // Test with complex arguments
//   it('should work with complex arguments', () => {
//     let callCount = 0;
//     const fn = (obj: object, arr: any[]) => {
//       callCount++;
//       return true;
//     };

//     const memoizedFn = memoizeLRU(fn);

//     const obj = { a: 1, b: 2 };
//     const arr = [1, 2, 3];

//     memoizedFn(obj, arr);
//     memoizedFn({ a: 1, b: 2 }, [1, 2, 3]);

//     expect(callCount).toBe(1); // Should be equal because JSON.stringify makes them the same key
//   });

//   // Test with methods arguments
//   it('should work with method arguments', () => {
//     let callCount = 0;
//     const fn = (fnA: Function, fnB: Function, str: string) => {
//       callCount++;
//       return `${fnA()} ${fnB()} ${str}`;
//     };

//     const memoizedFn = memoizeLRU(fn);

//     const fA = () => 'hi';
//     const fB = () => 'there';

//     expect(memoizedFn(fA, fB, '👋')).toBe('hi there 👋');
//     expect(memoizedFn(fA, fB, '👋')).toBe('hi there 👋');
//     expect(callCount).toBe(1);
//     expect(memoizedFn(fA, fB, '🦄')).toBe('hi there 🦄');
//     expect(callCount).toBe(2);
//   });

//   // Test this context
//   it('should preserve this context', () => {
//     let callCount = 0;

//     class Calculator {
//       multiplier: number;

//       constructor(multiplier: number) {
//         this.multiplier = multiplier;
//         this.multiply = memoizeLRU(this.multiply.bind(this));
//       }

//       multiply(n: number) {
//         callCount++;
//         return n * this.multiplier;
//       }
//     }

//     const calc = new Calculator(2);
//     expect(calc.multiply(4)).toBe(8);
//     expect(calc.multiply(4)).toBe(8);
//     expect(callCount).toBe(1);
//   });

//   // Test with different types
//   it('should work with different return types', () => {
//     const getString = memoizeLRU((n: number) => `Number is ${n}`);
//     const getArray = memoizeLRU((n: number) => Array(n).fill(1));
//     const getObject = memoizeLRU((n: number) => ({ value: n }));

//     expect(getString(123)).toBe('Number is 123');
//     expect(getArray(3)).toEqual([1, 1, 1]);
//     expect(getObject(5)).toEqual({ value: 5 });
//   });

//   // Test error handling
//   it('should handle function errors correctly', () => {
//     const throwingFn = memoizeLRU((shouldThrow: boolean) => {
//       if (shouldThrow) throw new Error('Test error');
//       return 'OK';
//     });

//     expect(() => throwingFn(true)).toThrow('Test error');
//     expect(throwingFn(false)).toBe('OK');
//   });

//   // Test with undefined and null
//   it('should handle undefined and null arguments', () => {
//     const fn = memoizeLRU((a: any) => a);

//     expect(fn(undefined)).toBeUndefined();
//     expect(fn(null)).toBeNull();
//   });

//   // Test custom cache size
//   it('should respect custom cache size', () => {
//     let callCount = 0;
//     const fn = memoizeLRU((n: number) => {
//       callCount++;
//       return n;
//     }, 1); // Cache size of 1

//     fn(1);
//     fn(2); // Should evict 1
//     fn(1); // Should recalculate 1

//     expect(callCount).toBe(3);
//   });
// });

export const test = () => {
  console.log("test");
};
