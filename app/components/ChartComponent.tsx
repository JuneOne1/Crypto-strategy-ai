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

export default function ChartComponent({ symbol }: ChartComponentProps) {
  const [rsiData, setRsiData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  // MACD는 { MACD, signal, histogram } 배열을 반환하므로
  // 이를 저장할 state를 정의합니다.
  const [macdData, setMacdData] = useState<{ MACD: number; signal: number; histogram: number }[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const pair = symbol + 'USDT';
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=1h&limit=100`);
        const ohlc = await res.json();

        // OHLC 데이터에서 종가 배열(closes)과 시간(labels)을 추출
        const closes = ohlc.map((candle: any) => parseFloat(candle[4]));
        const times = ohlc.map((candle: any) => new Date(candle[0]).toLocaleTimeString());

        // 1) RSI 계산
        const rsiValues = RSI.calculate({ values: closes, period: 14 });
        setRsiData(rsiValues);
        // RSI는 처음 14개 데이터가 계산에 사용되므로, 라벨도 14개를 잘라냅니다.
        setLabels(times.slice(14));

        // 2) MACD 계산
        // fastPeriod=12, slowPeriod=26, signalPeriod=9가 기본
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

  // --- RSI 차트 데이터 구성 ---
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

  // --- MACD 차트 데이터 구성 ---
  // MACD 계산 결과는 가장 긴 기간(26) 이후부터 생성되므로,
  // 라벨도 그만큼 줄여야 실제 값과 맞출 수 있습니다.
  // (fast=12, slow=26, signal=9 => 실제 MACD 배열은 26 이후부터 유효)
  const macdLabels = labels.slice(12); // RSI 라벨도 14개가 줄어든 상태이므로, 여기서는 추가로 12개를 더 줄임
  // MACD, signal, histogram 배열
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
      {/* --- RSI 영역 --- */}
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

      {/* --- MACD 영역 --- */}
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