'use client';

import React, { useState } from 'react';
import MarketTrendChart from './MarketTrendChart';

const coingeckoMap: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  XRP: 'ripple',
  SOL: 'solana',
  BNB: 'binancecoin',
  DOGE: 'dogecoin',
  TRX: 'tron',
  LINK: 'chainlink',
  TON: 'the-open-network',
  SUI: 'sui',
  LTC: 'litecoin',
  PEPE: 'pepe',
};

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleClick = async (symbol: string) => {
    setSelectedSymbol(symbol);
    // Fetch analysis logic here
    const fetchedAnalysis = `Analysis for ${symbol}`;
    setAnalysis(fetchedAnalysis);
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex space-x-4 mb-4">
        {Object.keys(coingeckoMap).map((symbol) => (
          <button
            key={symbol}
            onClick={() => handleClick(symbol)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {symbol}
          </button>
        ))}
      </div>

      {analysis && (
        <div className="border p-4 rounded">
          <MarketTrendChart coinId={coingeckoMap[selectedSymbol!]} symbol={selectedSymbol!} />
          <p className="mt-4">{analysis}</p>
        </div>
      )}
    </main>
  );
}