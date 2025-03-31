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

    // gpt-3.5-turbo 모델 사용
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
아래 지시사항을 따라, **최근 7일 가격 동향**이나 **최근 시장 동향**은 텍스트로 언급하지 말고,
매우 자세하고 구조화된 보고서를 작성하세요. 
보고서에는 재미있는 이모지(예: 🚀, 📈, 💡, ⏳ 등)를 적극 활용하고, 
각 항목을 최소 2~3줄 이상의 상세 설명으로 작성해주세요.

📊 **보고서 형식 (반드시 준수):**

────────────────────────────────
# 🔎 암호화폐 트레이딩 전략 보고서

## 1. 자산 정보
- **자산명:** ${symbol}
- **현재 가격(USD):** ${currentPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}

## 2. 매수(Long) 전략 🚀
1. **진입 가격 범위 (USD)**
2. **목표 가격 (TP1, TP2)** 및 예상 수익률(%)·성공 확률(%)
3. **손절 가격 (Stop Loss)** 및 예상 리스크(%)
4. **최종 기대 수익률(%)**
5. **리스크 대비 보상 비율(R/R)**  
   (예: 진입 $100, 목표 $120, 손절 $90 → (120-100)/(100-90)=2:1)
6. **전략 근거** (RSI, MACD, 거래량 등)

## 3. 매도(Short) 전략 ⛔
- 위와 동일한 구조, 단기 하락 모멘텀 기반

## 4. 최적 전략 추천 💡
- 매수 vs 매도 비교 후 결론

## 5. 종합 의견 및 유의사항 ⏳
- 시장 변동성, 거시경제 이슈, 리스크 관리 등 추가 조언
────────────────────────────────

추가 지침:
1) **최근 7일 가격 동향**이나 **최근 시장 동향**은 절대 텍스트로 언급하지 마세요. (프론트엔드에서 차트로 대체)
2) 이모지를 최대한 다양하게 활용해 재미있게 작성하세요.
3) 모든 내용은 한국어로 작성하되, 가격은 USD 기준으로 표기하세요.
            `
          },
          {
            role: 'user',
            content: `
"${symbol}"의 현재 시장 가격은 ${currentPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}입니다.
위 보고서 형식을 엄격히 따라, 매수/매도 전략과 최적 전략을 매우 상세히 작성해 주세요.
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