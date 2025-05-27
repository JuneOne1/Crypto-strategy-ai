'use client';

import { useState, useEffect } from 'react';
import MarketTrendChart from './components/MarketTrendChart';

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (selectedSymbol) {
      // Fetch analysis data for the selected symbol
      fetch(`/api/analysis?symbol=${selectedSymbol}`)
        .then((res) => res.json())
        .then((data) => setAnalysis(data))
        .catch((err) => console.error(err));
    }
  }, [selectedSymbol]);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crypto Strategy AI</h1>
      <select
        value={selectedSymbol || ''}
        onChange={(e) => setSelectedSymbol(e.target.value)}
        className="mb-4 p-2 border rounded"
      >
        <option value="" disabled>
          Select a symbol
        </option>
        <option value="BTC">BTC</option>
        <option value="ETH">ETH</option>
        <option value="XRP">XRP</option>
        {/* Add more options as needed */}
      </select>

      {analysis && (
        <section>
          <h2 className="text-xl font-semibold">Analysis for {selectedSymbol}</h2>
          <div className="mt-4">
            <MarketTrendChart symbol={selectedSymbol!} />
          </div>
        </section>
      )}
    </main>
  );
}