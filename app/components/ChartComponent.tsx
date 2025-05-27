'use client';

import { useEffect, useState } from 'react';
import type { ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { RSI, MACD } from 'technicalindicators';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const symbolToId: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  XRP: 'ripple',
  SOL: 'solana',
  BNB: 'binancecoin',
  DOGE: 'dogecoin',
  TRX: 'tron',
  LINK: 'chainlink',
  TON: 'toncoin',
  SUI: 'sui',
  LTC: 'litecoin',
  PEPE: 'pepe', // or appropriate Coingecko ID if different
};

interface ChartComponentProps {
  symbol: string;
}

// interface BinanceKline {
//   openTime: number;
//   open: string;
//   high: string;
//   low: string;
//   close: string;
//   volume: string;
//   closeTime: number;
//   quoteAssetVolume: string;
//   trades: number;
//   takerBaseAssetVolume: string;
//   takerQuoteAssetVolume: string;
//   ignore: string;
// }

interface MACDData {
  MACD: number;
  signal: number;
  histogram: number;
}

export default function ChartComponent({ symbol }: ChartComponentProps) {
  const [rsiData, setRsiData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [macdData, setMacdData] = useState<MACDData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const coinId = symbolToId[symbol];
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=5&interval=hourly`
        );
        const data = await res.json();
        // Coingecko returns data.prices as [timestamp, price][]
        const prices: number[] = data.prices.map((p: [number, number]) => p[1]);
        const times: string[] = data.prices.map((p: [number, number]) =>
          new Date(p[0]).toISOString()
        );

        const rsiValues = RSI.calculate({ values: prices, period: 14 });
        setRsiData(rsiValues);
        setLabels(times.slice(14));  

        const macdValues = MACD.calculate({
          values: prices,
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
          SimpleMAOscillator: false,
          SimpleMASignal: false,
        });
        const formattedMacd = macdValues.map((item) => ({
          MACD: item.MACD ?? 0,
          signal: item.signal ?? 0,
          histogram: item.histogram ?? 0,
        }));
        setMacdData(formattedMacd);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    }
    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: { unit: 'hour' }
      }
    }
  };

  const rsiChartData = {
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

  const macdLabels = labels.slice(12);
  const macdLine = macdData.map((item) => item.MACD);
  const signalLine = macdData.map((item) => item.signal);
  const histogramLine = macdData.map((item) => item.histogram);

  const macdChartData = {
    labels: macdLabels,
    datasets: [
      {
        label: 'MACD',
        data: macdLine,
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'Signal',
        data: signalLine,
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'Histogram',
        data: histogramLine,
        borderColor: 'rgb(255, 206, 86)',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold">RSI (14)</h2>
        <p className="text-sm text-gray-300 mt-1">
          RSI(Relative Strength Index)는 가격의 상승 압력과 하락 압력을 비교하여 매수/매도 강도를 나타냅니다. 일반적으로 70 이상은 과매수, 30 이하이면 과매도로 해석됩니다.
        </p>
        <div className="relative w-full h-64">
          <Line data={rsiChartData} options={options} />
        </div>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-bold">MACD</h2>
        <p className="text-sm text-gray-300 mt-1">
          MACD는 단기와 장기 이동평균의 차이를 나타내며, 시그널 선과의 교차로 매수/매도 신호를 제공합니다.
        </p>
        <div className="relative w-full h-64">
          <Line data={macdChartData} options={options} />
        </div>
      </div>
    </div>
  );
}