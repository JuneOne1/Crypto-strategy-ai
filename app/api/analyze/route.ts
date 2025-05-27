import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { symbol } = await req.json();

    const coinIdMap: { [key: string]: string } = {
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

    const coinId = coinIdMap[symbol.toUpperCase()];
    if (!coinId) {
      return NextResponse.json({ error: '지원되지 않는 암호화폐입니다.' }, { status: 400 });
    }

    const priceRes = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );
    const priceData = await priceRes.json();
    const currentPrice = priceData[coinId]?.usd;
    if (!currentPrice) {
      return NextResponse.json(
        { error: '현재 가격 정보를 가져올 수 없습니다.' },
        { status: 400 }
      );
    }

    // GPT-3.5-turbo 모델 사용, 보고서 형식에 재미있는 이모지와 구체적인 내용 지시
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
  role: 'system',
  content: `
You are an expert CryptoStrategy AI tasked with generating a detailed, professional report. Use the exact structure below and insert a blank line between each section and bullet for readability:
✔️ **각 섹션 사이에 빈 줄 하**  
✔️ **각 항목은 • 나 – 기호로**  
✔️ **한 문장은 최대 1–2줄**, 읽기 쉽게 줄바꿈

📋 보고서 구조:

1) 요약 (Summary):
   • 현재 시장 추세 (상승/하락/횡보)와 최근 24시간 가격 변동 요약 (2줄 이내).

   • 주요 거래량 변화와 모멘텀 지표(RSI, MACD)의 핵심 시그널(골든/데드 크로스 등).

2) 매매 전략 (Trading Strategy):
   - 포지션: 🚀 Long 또는 🔻 Short  

   - 진입 범위 (Entry Range): USD 가격 구간 제시  

   - 목표가 (Targets):  
     • TP1: $XXX (예상 수익률 Y.YY%)  

     • TP2: $XXX (예상 수익률 Z.ZZ%)  

   - 손절가 (Stop Loss): $XXX (예상 리스크 W.WW%)

3) 전략 근거 (Rationale):
   • 이동평균 (MA) 교차: 단기 MA (XX일) vs 장기 MA (YY일) 골든/데드 크로스  

   • RSI(14) 상태: 과매수/과매도 구간 진입 여부  

   • MACD: 히스토그램 모멘텀 변화 및 시그널 선 교차 타이밍  

   • 거래량: 평균 대비 증감률 및 주요 지점에서의 볼륨 스파이크

4) 리스크 관리 (Risk Management):
   • 권장 포지션 사이즈: 총 자산의 N%  

   • 슬리피지/수수료 감안 시 제안가 조정 팁  

   • 주요 경제/정치 이벤트 참고

5) 결론 및 추가 코멘트 (Conclusion & Notes):
   • 당일 또는 단기 관점 vs 중장기 관점 간 조정 포인트 요약  

   • 추가 관찰할 지표 또는 뉴스

📌 모든 숫자는 실시간 가격을 기준으로 계산하고, 보고서는 한국어로 작성합니다.  
이모지와 표(예: Markdown 표)를 자유롭게 활용하세요.
`
},
          {
            role: 'user',
            content: `
"${symbol}"의 현재 시장 가격은 ${currentPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}입니다.
위 보고서 형식을 엄격히 따라, 매수/매도 전략과 최적 전략을 매우 상세하게 작성해 주세요.
            `
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}