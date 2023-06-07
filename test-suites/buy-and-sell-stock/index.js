var maxProfit = function(prices) {
  let minprice = Number.MAX_VALUE;
  let maxprofit = 0;
  for (const price of prices) {
      maxprofit = Math.max(price - minprice, maxprofit);
      minprice = Math.min(price, minprice);
  }
  return maxprofit;
};
  
module.exports = maxProfit;