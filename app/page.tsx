'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import MarketTrendChart from './components/MarketTrendChart';
import Image from 'next/image';

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

// Coingecko ID 매핑
const coingeckoMap: { [key: string]: string } = {
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

  // 안내 문구를 여러 줄로 표기하기 위해 \n 사용
  const introText = 
    "💡 AI 기반 암호화폐 전략 분석 서비스입니다.\n" +
    "RSI, MACD, 거래량 등 다양한 기술 지표를 종합하여, 쉽고 빠르게 매수/매도 전략을 제시합니다.\n\n" +
    "📈 원하는 암호화폐 버튼을 클릭해 지금 바로 분석해 보세요!\n" +
    "*본 서비스는 참고용이며, 실제 투자 결정에 따른 책임은 사용자에게 있습니다.";

  return (
    <main className="min-h-screen bg-gray-900 text-white p-2 sm:p-4 flex flex-col items-center">
      {/* 상단 컨테이너: 제품 이름과 안내 문구 (폭: max-w-3xl) */}
      <div className="bg-[#1e1e1e] rounded-xl shadow-md w-full max-w-3xl text-center p-4 sm:p-6 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">
          🚀 CryptoStrategy AI
        </h1>
        
        {/* 안내 문구 */}
        <div className="mb-4 text-sm text-gray-300 whitespace-pre-line">
          {introText}
        </div>

        {/* 버튼들 출력 전 한 줄 띄우기 → margin-bottom 이용 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
          {symbols.map(({ id, icon }) => (
            <button
              key={id}
              onClick={() => handleAnalyze(id)}
              className={`p-2 rounded-lg text-sm flex items-center justify-center gap-2 transition ${
                selectedSymbol === id
                  ? 'bg-blue-500'
                  : 'bg-[#2e2e2e] hover:bg-blue-600'
              }`}
              disabled={loading}
            >
              <Image src={icon} alt={id} width={24} height={24} className="w-6 h-6" />
              <span>{id}</span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center space-x-2 text-blue-300">
            <svg
              className="w-6 h-6 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span>분석 중입니다...</span>
          </div>
        )}
      </div>

      {/* 하단 컨테이너: 분석 결과 + 차트 (폭: max-w-3xl) */}
      {selectedSymbol !== null && (
        <div className="bg-[#1e1e1e] rounded-xl shadow-md w-full max-w-3xl p-4 sm:p-6 mb-6">
          <div className="text-left bg-[#2e2e2e] p-4 rounded-md leading-relaxed tracking-wide markdown-report">
            {/* 최근 일주일 가격 동향 차트 */}
            <MarketTrendChart
              coinId={coingeckoMap[selectedSymbol!]}
              symbol={selectedSymbol!}
            />
            {/* GPT 분석 보고서 */}
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}
    </main>
  );
}