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

    // GPT-4 API 호출: 프롬프트 내용을 더 상세하게 작성하여, 
    // 리스크 대비 수익률, 성공 확률, 기술적 지표(RSI, MACD, 거래량 등)의 근거를 포함하도록 합니다.
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo', // GPT-4 모델 사용 (계정에 권한이 있어야 합니다)
        messages: [
          {
            role: 'system',
            content: `
당신은 전문 암호화폐 트레이딩 전략가입니다. 아래 지시사항에 따라, 주어진 암호화폐의 현재 시장 가격과 기술적 지표(예: RSI, MACD, 거래량)를 기반으로 매우 구체적인 매수(Long) 및 매도(Short) 전략을 한국어로 작성하세요.

응답은 반드시 아래 형식을 따라 작성합니다:

────────────────────────────
📌 매수(Long) 전략:
1. 진입 가격 범위 (USD): 구체적인 가격 범위를 제시합니다.
2. 목표 가격 (TP1, TP2): 각 목표 가격과 예상 수익률(%) 및 성공 확률(%)을 제시합니다.
3. 손절 가격 (Stop Loss): 구체적인 가격과 예상 리스크(%)를 명시합니다.
4. 최종 기대 수익률: 계산된 예상 수익률(%)을 제공합니다.
5. 리스크 대비 보상 비율 (R/R): (목표가격 - 진입가격) ÷ (진입가격 - 손절가격) 계산 예시 포함. 
   예를 들어, 진입가격이 $100, 목표가격이 $120, 손절가격이 $90이면, (120-100)/(100-90)=20/10=2:1.
6. 전략 근거: RSI, MACD, 거래량 등의 기술적 지표 분석과, 각 지표가 매수 신호로 작용하는 이유를 구체적으로 설명합니다.
────────────────────────────
📌 매도(Short) 전략:
위와 유사한 형식으로, 단기적 하락 모멘텀에 기반한 전략을 상세히 제시합니다.
────────────────────────────
📌 최적 전략 추천:
매수(Long)과 매도(Short) 전략을 비교하여, 가장 유리한 전략과 그 이유를 명확히 설명합니다.
────────────────────────────
추가 사항:
- RSI는 보통 14 기간을 사용하며, 30 이하이면 과매도, 70 이상이면 과매수로 해석합니다.
- MACD는 단기(12 기간)와 장기(26 기간) 이동평균의 차이로 계산하며, 시그널 선(9 기간 이동평균)과의 교차를 통해 신호를 제공합니다.
- 모든 응답은 구체적인 수치와 예시 계산을 포함하여, 매우 상세하게 작성되어야 합니다.
            `
          },
          {
            role: 'user',
            content: `"${symbol}"의 현재 시장 가격은 ${currentPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}입니다. 위 지시사항을 기반으로, 매우 상세한 매수(Long) 및 매도(Short) 전략과 최적 전략 추천을 작성해주세요.`
          }
        ],
        temperature: 0.2,
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