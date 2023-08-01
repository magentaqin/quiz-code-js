const maxProfit = require('../index');

test('Normal transaction', () => {
  expect(maxProfit([7,1,5,3,6,4])).toBe(5);
});

test('No transaction', () => {
  expect(maxProfit([7,6,4,3,1])).toBe(0);
});

test('Big Array', () => {
  const arr = Array(100000).fill(0)
  for (let i = 0; i < arr.length; i++) {
    arr[i] = i
  } 
  expect(maxProfit(arr)).toBe(99999);
});

test('Empty Array', () => {
  expect(maxProfit([])).toBe(0);
});