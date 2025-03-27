'use client';

import { useEffect, useState } from 'react';
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
import { Line } from 'react-chartjs-2';
import { RSI, MACD } from 'technicalindicators';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartComponentProps {
  symbol: string;
}

// 1) Binance Kline 타입 정의
type BinanceKline = [
  openTime: number,
  open: string,
  high: string,
  low: string,
  close: string,
  volume: string,
  closeTime: number,
  quoteAssetVolume: string,
  trades: number,
  takerBaseAssetVolume: string,
  takerQuoteAssetVolume: string,
  ignore: string
];

export default function ChartComponent({ symbol }: ChartComponentProps) {
  const [rsiData, setRsiData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [macdData, setMacdData] = useState<{ MACD: number; signal: number; histogram: number }[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const pair = symbol + 'USDT';
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=1h&limit=100`);
        const ohlc: BinanceKline[] = await res.json(); 
        // 2) 이제 ohlc는 BinanceKline[] 타입

        // 3) 종가(Close)와 시간 추출
        const closes = ohlc.map((candle) => parseFloat(candle[4]));
        const times = ohlc.map((candle) => new Date(candle[0]).toLocaleTimeString());

        // RSI 계산
        const rsiValues = RSI.calculate({ values: closes, period: 14 });
        setRsiData(rsiValues);
        setLabels(times.slice(14));

        // MACD 계산
        const macdValues = MACD.calculate({
          values: closes,
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
          SimpleMAOscillator: false,
          SimpleMASignal: false,
        });
        setMacdData(macdValues);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    }

    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  // RSI 차트
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

  // MACD 차트
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
      {/* RSI 영역 */}
      <div className="mb-6">
        <div className="mb-4 text-left">
          <h2 className="text-xl font-bold">RSI(14)</h2>
          <p className="text-sm text-gray-300 mt-1">
            RSI(Relative Strength Index)는 가격의 상승 압력과 하락 압력을 비교하여 매수/매도 강도를 나타내는 지표입니다.
            일반적으로 RSI 값이 <span className="font-semibold">70 이상</span>이면 과매수 상태, 
            <span className="font-semibold"> 30 이하</span>이면 과매도 상태로 해석합니다.
          </p>
        </div>
        <Line data={rsiChartData} />
      </div>

      {/* MACD 영역 */}
      <div className="mb-4 text-left">
        <h2 className="text-xl font-bold">MACD</h2>
        <p className="text-sm text-gray-300 mt-1">
          MACD(Moving Average Convergence Divergence)는 단기(보통 12기간)와 장기(보통 26기간) 이동평균의 차이를 나타내는 지표입니다. 
          <br /><br />
          <span className="font-semibold">시그널 선</span>은 MACD의 9기간 이동평균으로, MACD 선과의 차이를 보여줍니다. 
          MACD 선이 시그널 선을 상향 돌파하면 매수 신호, 하향 돌파하면 매도 신호로 해석할 수 있습니다.
          <br /><br />
          <span className="font-semibold">히스토그램</span>은 MACD 선과 시그널 선의 차이를 나타내며, 양수이면 상승 모멘텀이 강하다는 의미, 
          음수이면 하락 모멘텀이 강하다는 의미로 해석할 수 있습니다.
        </p>
      </div>
      <Line data={macdChartData} />
    </div>
  );
}