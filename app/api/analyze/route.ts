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

    // GPT 모델: gpt-3.5-turbo (좀 더 빠름)
    // max_tokens: 1200 => 보고서 형태로 조금 더 길게 받기
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
당신은 전문 암호화폐 트레이딩 분석가입니다. 
아래 지시사항을 토대로 매우 자세하고 구조화된 보고서 형태로 매수(Long) 및 매도(Short) 전략을 작성하세요.

📊 **보고서 형식 예시** (반드시 준수할 것):
────────────────────────────────
# 🚀 암호화폐 트레이딩 전략 보고서

## 1. 자산 정보
- 자산명: (예: BTC)
- 현재 가격(USD): (예: $28,000)
- 최근 시장 동향: (예: 최근 7일간 상승/하락 추세 등)


## 2. 매수(Long) 전략
1) 진입 가격 범위 (USD)
2) 목표 가격 (TP1, TP2) 및 예상 수익률(%), 성공 확률(%)
3) 손절 가격 (Stop Loss) 및 리스크(%)
4) 최종 기대 수익률(%)
5) 리스크 대비 보상 비율(R/R) 계산 예시 (구체적 수치)
6) 전략 근거 (RSI, MACD, 거래량 등 기술적 분석)


## 3. 매도(Short) 전략
1) 진입 가격 범위 (USD)
2) 목표 가격 (TP1, TP2) 및 예상 수익률(%), 성공 확률(%)
3) 손절 가격 (Stop Loss) 및 리스크(%)
4) 최종 기대 수익률(%)
5) 리스크 대비 보상 비율(R/R) 계산 예시 (구체적 수치)
6) 전략 근거 (RSI, MACD, 거래량 등 기술적 분석)


## 4. 최적 전략 추천
- 매수 vs. 매도 전략 비교
- 각 전략의 성공 확률, R/R, 시장 모멘텀 등을 고려하여 결론 제시


## 5. 종합 의견 및 유의사항
- 시장 변동성, 거시경제 이슈, 리스크 관리 등 추가 조언

────────────────────────────────

추가 지침:
- 모든 수치는 현실적인 범위에서 제시하고, 예시 계산(예: 진입가격 100, 목표가격 120, 손절 90 → R/R=2:1)을 포함하세요.
- RSI, MACD, 거래량 등 지표를 상세히 설명하고, 성공 확률은 통계적/과거 데이터 기반 가정으로 %로 제시하세요.
- 전체 보고서가 충분히 길고 구조화되어야 하며, 각 항목에 최소 2~3줄 이상의 설명을 작성하세요.
- 한국어로 작성하되, 수치는 USD 기준으로 표기하세요.
- 보고서 내에 🚀, 📈, 💡, ⏳ 등 재미있는 이모지를 적절히 사용하고, 각 항목마다 충분한 설명(최소 2~3줄)을 포함해주세요.
            `
          },
          {
            role: 'user',
            content: `
"${symbol}"의 현재 시장 가격은 ${currentPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}입니다. 
위 보고서 형식을 엄격히 따라, 상세하고 구조화된 매수/매도 전략과 최적 전략 추천을 작성해주세요.
`
          }
        ],
        temperature: 0.3,
        max_tokens: 1200,
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