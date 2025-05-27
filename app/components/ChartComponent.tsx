'use client';

import React from 'react';
import MarketTrendChart from './MarketTrendChart';

const symbolToId: Record<string, string> = {
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

interface ChartComponentProps {
  symbol: string;
}

export default function ChartComponent({ symbol }: ChartComponentProps) {
  const coinId = symbolToId[symbol];
  return (
    <main className="container mx-auto p-4">
      <MarketTrendChart coinId={coinId} symbol={symbol} />
    </main>
  );
}