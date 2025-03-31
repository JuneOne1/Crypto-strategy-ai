'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface MarketTrendChartProps {
  coinId: string; // Coingecko의 코인 ID (예: 'bitcoin')
  symbol: string; // 사용자가 선택한 심볼 (예: 'BTC')
}

export default function MarketTrendChart({ coinId, symbol }: MarketTrendChartProps) {
  const [priceData, setPriceData] = useState<number[]>([]);
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`);
        const data = await res.json();
        // data.prices: 배열 형식 [timestamp, price]
        const prices: [number, number][] = data.prices || [];
        const interval = Math.floor(prices.length / 7) || 1;
        const dailyData = prices.filter((_, i) => i % interval === 0);
        const dailyPrices = dailyData.map((item) => item[1]);
        const dailyDates = dailyData.map((item) => {
          const date = new Date(item[0]);
          return date.toLocaleDateString();
        });
        setPriceData(dailyPrices);
        setDates(dailyDates);
      } catch (error) {
        console.error('Error fetching market trend data:', error);
      }
    }
    if (coinId) {
      fetchMarketData();
    }
  }, [coinId]);

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: 'Price (USD)',
        data: priceData,
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold">최근 일주일 {symbol}의 가격 동향 📈</h2>
      <div className="relative w-full h-64 sm:h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}