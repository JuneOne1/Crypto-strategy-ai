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
}

export default function MarketTrendChart({ coinId }: MarketTrendChartProps) {
  const [priceData, setPriceData] = useState<number[]>([]);
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        // Coingecko의 7일간 시장 데이터 API 사용 (USD 기준)
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`);
        const data = await res.json();
        // data.prices: 배열 형식 [timestamp, price]
        const prices: [number, number][] = data.prices;
        // 데이터를 7일치로 단순화 (하루당 한 포인트 선택)
        const interval = Math.floor(prices.length / 7);
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
    <div className="relative w-full h-64 sm:h-80">
      <Line data={chartData} options={options} />
    </div>
  );
}