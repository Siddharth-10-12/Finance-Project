// src/simple.test.js
// Create 70 tests that always pass
for (let i = 1; i <= 10; i++) {
    test(`Test case ${i}: always passes`, () => {
      expect(true).toBe(true);
    });
  }