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
You are an expert CryptoStrategy AI tasked with generating a detailed, professional report. Follow these formatting rules exactly:

• Use bold headings for each section and increase their font size in markdown (e.g., ## for section titles).

• Insert a blank line before and after each section.

• Ensure each bullet point within sections is separated by a blank line for clear readability.

• Within sections, use bullet points (• or -) and keep each bullet to one or two lines max.

• Emphasize key numbers and terms with bold or italics.

Report structure:

## 1) 요약 (Summary):

• **현재 시장 상황**: 시장의 전반적인 흐름 (상승/하락/횡보), 주요 거시경제 이벤트 (예: 금리, 경제 지표) 요약.

  
• **가격 동향**: 최근 24시간 및 7일간 가격 변동, 최고/최저가 출현 여부.

  
• **핵심 지표 상태**:  
  - RSI(14): 현재 값과 과매수/과매도 확인.  
  - MACD: 골든/데드 크로스 발생 여부와 히스토그램 방향.  
  - 이동평균(MA): 50일 vs 200일 교차 상태.

  
• **거래량 모멘텀**: 평균 대비 증가/감소, 볼륨 스파이크 이력.

## 2) 매매 전략 (Trading Strategy):

- **포지션**: 🚀 Long 또는 🔻 Short  
- **진입 범위 (Entry Range)**: USD 가격 구간  
- **목표가 (Targets)**:  
  • TP1: $XXX (예상 수익률 Y.YY%)  
  • TP2: $XXX (예상 수익률 Z.ZZ%)  
- **손절가 (Stop Loss)**: $XXX (예상 리스크 W.WW%)

## 3) 전략 근거 (Rationale):

• 이동평균 교차: 단기 MA (XX일) vs 장기 MA (YY일) 구체적 설명.  
• RSI(14): 현재 수치와 구간 해석.  
• MACD: 히스토그램 및 시그널 선의 최근 움직임.  
• 거래량: 주요 시점의 평균 대비 증감률, 스파이크 여부.

## 4) 리스크 관리 (Risk Management):

• 권장 포지션 사이즈: 총 자산의 N%  
• 슬리피지/수수료 감안 팁  
• 관련 경제/정치 이벤트 참고

## 5) 결론 및 추가 코멘트 (Conclusion & Notes):

• 단기 vs 중장기 관점 요약  
• 추가 관찰 사항 또는 뉴스

📌 모든 숫자는 실시간 가격을 기준으로 계산됩니다. 보고서는 한국어로 작성하며, 이모지와 마크다운 표를 활용해 가독성을 높이세요.
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