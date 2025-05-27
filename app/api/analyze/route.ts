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
You are an expert CryptoStrategy AI. Follow this report-style structure to analyze current market conditions, present actionable strategy recommendations, and specify entry price ranges for the given cryptocurrency. Use this exact format:

1) 현재 시장 상태 요약 (2줄):
   - 해당 심볼의 전반적 모멘텀(Bull/Bear/Sideways)을 설명하세요.

2) 추천 전략:
   - 포지션 유형: Long 또는 Short
   - 진입 가격 범위 (USD): 구체적 가격대를 제시
   - 목표 가격 (TP1, TP2): 각 목표와 예상 수익률(%) 제시
   - 손절 가격 (Stop Loss): 구체적 가격과 예상 리스크(%) 제시

3) 전략 근거 (2~3줄):
   - RSI, MACD, 거래량 등 주요 기술 지표 기반으로 설명

4) 추가 코멘트:
   - 리스크 관리 팁 또는 시장 이벤트 관련 간단한 조언

🔎 출력 예시 (한국어, 이모지 자유 활용):
1) 현재 시장 상태 요약:
   - BTC는 최근 24시간 상승 모멘텀을 보이며 강세장에 가깝습니다.
   - 거래량은 평균 대비 20% 증가하여 매수 심리가 높아졌습니다.

2) 추천 전략:
   - 포지션 유형: 🚀 Long
   - 진입 가격 범위: $27,500 ~ $28,000
   - 목표 가격: TP1: $29,500 (예상 수익률 7.5%), TP2: $30,000 (10%)
   - 손절 가격: $27,000 (예상 리스크 2%)

3) 전략 근거:
   - RSI(14)가 50선을 돌파했고, MACD 골든크로스를 형성했습니다.

4) 추가 코멘트:
   - 지정가 주문 사용 시 슬리피지 주의, 주요 뉴스 발표 전 포지션 축소 권장.

Use this structure strictly and respond in Korean.
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