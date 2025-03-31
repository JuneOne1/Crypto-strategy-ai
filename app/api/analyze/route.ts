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

    // GPT-3.5-turbo 모델 사용 (응답 시간을 고려하여)
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
다음 지시사항에 따라, 매우 자세하고 구조화된 보고서를 작성하세요. 보고서 내에 재미있는 이모지(예: 🚀, 📈, 💡, ⏳ 등)를 적극 활용해주세요.

📊 **보고서 형식 (반드시 준수):**

────────────────────────────────
# 🔎 암호화폐 트레이딩 전략 보고서

## 1. 최근 일주일 ${symbol}의 가격 동향 📈
- 해당 암호화폐의 지난 7일간의 가격 변동 추이를 간략하게 요약하거나, 차트 형태의 수치 데이터를 포함합니다.

## 2. 자산 정보
- **자산명:** ${symbol}
- **현재 가격(USD):** ${currentPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
- **최근 시장 동향:** (예: 최근 7일간 가격 변동 요약)

## 3. 매수(Long) 전략 🚀
1. **진입 가격 범위 (USD):** 구체적인 가격 범위를 제시
2. **목표 가격 (TP1, TP2):** 각 목표 가격과 예상 수익률(%) 및 성공 확률(%) 제시
3. **손절 가격 (Stop Loss):** 구체적인 가격과 예상 리스크(%) 명시
4. **최종 기대 수익률 (%):**
5. **리스크 대비 보상 비율 (R/R):** 예를 들어, 진입 가격 $100, 목표 가격 $120, 손절 $90이면 (120-100)/(100-90)=20/10=2:1
6. **전략 근거:** RSI, MACD, 거래량 등 기술적 지표 분석 및 매수 신호의 구체적 이유

## 4. 매도(Short) 전략 ⛔
- 위와 유사한 형식으로, 단기 하락 모멘텀에 기반한 전략을 상세히 제시

## 5. 최적 전략 추천 💡
- 매수와 매도 전략을 비교하여, 가장 유리한 전략과 그 이유를 구체적으로 설명

## 6. 종합 의견 및 유의사항 ⏳
- 시장 변동성, 거시경제 이슈, 리스크 관리 등에 대한 조언 포함

────────────────────────────────

추가 지침:
1) 각 항목마다 최소 2~3줄 이상의 상세한 설명을 포함할 것.
2) 모든 내용은 한국어로 작성하되, 가격은 USD 기준으로 표기할 것.
            `
          },
          {
            role: 'user',
            content: `
"${symbol}"의 현재 시장 가격은 ${currentPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}입니다.
위 보고서 형식을 엄격히 따라, 매우 상세한 매수/매도 전략과 최적 전략 추천을 작성해주세요.
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