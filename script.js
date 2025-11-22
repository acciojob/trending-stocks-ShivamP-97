async function trendingStocks(n) {
  if (n === 0) return [];

  const [symbolsRes, marketCapsRes] = await Promise.all([
    fetch("https://api.frontendexpert.io/api/fe/stock-symbols"),
    fetch("https://api.frontendexpert.io/api/fe/stock-market-caps"),
  ]);

  const symbols = await symbolsRes.json();
  const marketCaps = await marketCapsRes.json();  

  marketCaps.sort((a, b) => b["market-cap"] - a["market-cap"]);
  const topN = marketCaps.slice(0, n);
  const topSymbols = topN.map(s => s.symbol);

  const pricesRes = await fetch(
    `https://api.frontendexpert.io/api/fe/stock-prices?symbols=${encodeURIComponent(
      JSON.stringify(topSymbols)
    )}`
  );
  const prices = await pricesRes.json();

  const nameMap = new Map(symbols.map(s => [s.symbol, s.name]));
  const priceMap = new Map(prices.map(p => [p.symbol, p]));
  const capMap = new Map(topN.map(s => [s.symbol, s["market-cap"]]));

  return topSymbols.map(symbol => {
    const p = priceMap.get(symbol);
    return {
      name: nameMap.get(symbol),
      symbol,
      price: p.price,
      "52-week-high": p["52-week-high"],
      "52-week-low": p["52-week-low"],
      "market-cap": capMap.get(symbol),
    };
  });
}

module.exports = trendingStocks;
