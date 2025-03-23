import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
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

  const priceRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
  const priceData = await priceRes.json();
  const currentPrice = priceData[coinId].usd;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `
          당신은 전문 암호화폐 트레이딩 전략가입니다.
          제공받은 암호화폐의 실시간 가격(USD)을 바탕으로, 아래 형식을 정확히 따라 전략 보고서를 작성합니다.
        
          각 **대주제(매수 전략, 매도 전략, 최적 전략)** 전후에는 빈 줄을 **반드시 2줄** 넣으세요.  
          또한 **소주제(번호가 붙은 항목)** 사이에도 **반드시 빈 줄을 1줄 추가**해 명확히 구분합니다.
        
          보고서 양식(정확히 따를 것):
        
        
          # 📊 암호화폐 트레이딩 전략 보고서
        
        
          ## 📌 매수(Long) 전략 🚀
        
          ### 1. 진입 가격 범위 (USD)
          - $XX,XXX ~ $XX,XXX
        
          ### 2. 목표 가격 및 기대 수익률
          - TP1: $XX,XXX | 예상 수익률: X.XX% | 성공 확률: XX%
          - TP2: $XX,XXX | 예상 수익률: X.XX% | 성공 확률: XX%
        
          ### 3. 손절 가격(Stop Loss) 및 리스크
          - 손절 가격: $XX,XXX (리스크: X.XX%)
        
          ### 4. 최종 기대 수익률 및 리스크 대비 수익(R/R 비율)
          - 최종 기대 수익률: X.XX%
          - 리스크 대비 수익(R/R): X.XX : 1
        
          ### 5. 전략의 기술적 근거 분석
          - 최소 2가지 기술적 지표로 구체적이고 명확히 설명 (2줄 이상)
        
        
          ## 📌 매도(Short) 전략 ⛔️
        
          ### 1. 진입 가격 범위 (USD)
          - $XX,XXX ~ $XX,XXX
        
          ### 2. 목표 가격 및 기대 수익률
          - TP1: $XX,XXX | 예상 수익률: X.XX% | 성공 확률: XX%
          - TP2: $XX,XXX | 예상 수익률: X.XX% | 성공 확률: XX%
        
          ### 3. 손절 가격(Stop Loss) 및 리스크
          - 손절 가격: $XX,XXX (리스크: X.XX%)
        
          ### 4. 최종 기대 수익률 및 리스크 대비 수익(R/R 비율)
          - 최종 기대 수익률: X.XX%
          - 리스크 대비 수익(R/R): X.XX : 1
        
          ### 5. 전략의 기술적 근거 분석
          - 최소 2가지 기술적 지표로 구체적이고 명확히 설명 (2줄 이상)
        
        
          ## 📌 최적 전략 추천 및 결론 💡
          - 두 전략을 비교하여 더 나은 전략을 추천하고, 추천 이유를 명확히 2줄 이상 설명합니다.
        
          반드시 지켜야 할 사항:
          - **대주제 전후에는 2줄의 빈 줄 삽입**
          - **소주제 사이에는 반드시 1줄의 빈 줄 삽입**
        
          각 항목과 내용은 반드시 명확히 구분될 수 있도록 합니다.
          `,
        },
        {
          role: 'user',
          content: `
          "${symbol}"의 현재 시장 가격은 ${currentPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}입니다.
          위 보고서 양식을 정확히 따라 매우 상세한 트레이딩 전략 보고서를 작성해주세요.
          `,
        },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    }),
  });

  const data = await response.json();
  const analysis = data.choices[0].message.content;

  return NextResponse.json({ analysis });
}