'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const symbols = [
  { id: 'BTC', icon: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
  { id: 'ETH', icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
  { id: 'XRP', icon: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
  { id: 'SOL', icon: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
  { id: 'BNB', icon: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
  { id: 'DOGE', icon: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' },
  { id: 'TRX', icon: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png' },
  { id: 'LINK', icon: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png' },
  { id: 'TON', icon: 'https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png' },
  { id: 'SUI', icon: 'https://assets.coingecko.com/coins/images/26375/large/sui_asset.jpeg' },
  { id: 'LTC', icon: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png' },
  { id: 'PEPE', icon: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg' },
];

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (symbol: string) => {
    setSelectedSymbol(symbol);
    setAnalysis('');
    setLoading(true);

    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol }),
    });

    const data = await res.json();
    setAnalysis(data.analysis);
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#121212] text-white p-2 sm:p-4">
      <div className="bg-[#1e1e1e] rounded-xl shadow-md w-full max-w-xl text-center p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">🚀 CryptoStrategy AI</h1>

        {/* 
          grid-cols-3 : 기본 3열 
          sm:grid-cols-4 : 작은 화면 이상에서는 4열 
          gap-2 : 버튼 간격 좁게 
        */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
          {symbols.map(({ id, icon }) => (
            <button
              key={id}
              onClick={() => handleAnalyze(id)}
              className={`p-2 rounded-lg text-sm flex flex-col items-center justify-center gap-1 transition ${
                selectedSymbol === id
                  ? 'bg-blue-500'
                  : 'bg-[#2e2e2e] hover:bg-blue-600'
              }`}
              disabled={loading}
            >
              <img
                src={icon}
                alt={id}
                className="w-6 h-6"
              />
              <span>{id}</span>
            </button>
          ))}
        </div>

        {loading && <div className="mb-4 text-blue-300">📡 분석 중입니다...</div>}

        {analysis && (
          <div className="mt-4 text-left bg-[#2e2e2e] p-3 rounded-md leading-relaxed tracking-wide markdown-report">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        )}
      </div>
    </main>
  );
}