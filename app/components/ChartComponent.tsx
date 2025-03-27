// app/components/ChartComponent.tsx
'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { RSI } from 'technicalindicators';

interface ChartComponentProps {
  symbol: string;
}

export default function ChartComponent({ symbol }: ChartComponentProps) {
  const [rsiData, setRsiData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // 여기서는 예시로 symbol에 따라 BTCUSDT 대신 symbolUSDT를 사용한다고 가정합니다.
        const pair = symbol + "USDT";
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=1h&limit=100`);
        const ohlc = await res.json();
        const closes = ohlc.map((candle: any) => parseFloat(candle[4]));
        const times = ohlc.map((candle: any) => new Date(candle[0]).toLocaleTimeString());
        const rsiValues = RSI.calculate({ values: closes, period: 14 });
        // RSI 계산 후 결과 배열은 14개 짧으므로 라벨도 슬라이스
        setRsiData(rsiValues);
        setLabels(times.slice(14));
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    }
    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: `RSI (14) for ${symbol}`,
        data: rsiData,
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <Line data={chartData} />
    </div>
  );
}