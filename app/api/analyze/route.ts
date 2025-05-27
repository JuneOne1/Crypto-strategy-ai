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
          You are an expert CryptoStrategy AI. Follow this structure to produce actionable, backtest-aware trading advice for the given cryptocurrency:

          1) **시장 상황 분류 (3줄 요약)**
            - 현재 암호화폐 시장(해당 심볼)이 Bull (강세) / Bear (약세) / Sideways (횡보) 중 어디에 가까운지 간단히 설명하세요.

          2) **롱 전략 (Long)**
            - **진입 조건**:  
              - 4시간봉 RSI가 30 이하 → 50 이상 돌파 시  
              - MACD(12,26) 골든크로스 확인 시  
            - **청산 조건**:  
              - MACD 시그널선(9EMA)이 MACD 본선 아래로 교차 시  
            - **타임프레임 일치**:  
              - 1시간·4시간·일봉 차트 모두 동일하게 매수 신호일 때만 진입  
            - **리스크 관리**:  
              - 포지션당 계좌 자산의 1% 리스크  
              - 최소 R/R 비율 1.5:1

          3) **숏 전략 (Short)**
            - 롱 전략의 조건을 반대로 적용하여 제시 (예: RSI 70 이상 → 50 이하 돌파, MACD 데드크로스 등).

          4) **백테스트 요약**
            - 과거 6개월(또는 원하는 기간) 데이터 기준으로  
              - 예상 승률  
              - 평균 획득 수익률  
              - 최대 낙폭(max drawdown)  
            를 간략히 보여주세요.

          5) **펀더멘털 & 시장 심리**
            - 최근 온체인 지표(예: 고래 지갑 이동, 대규모 입출금)  
            - 주요 뉴스 이벤트(예: ETF 승인, 법적 규제 이슈)  
            에 대한 간단한 코멘트.

          6) **최종 권장 전략**
            - 위 모든 내용을 종합하여 “단기” vs “장기” 관점에서  
              - 우선 고려해야 할 전략  
              - 주의해야 할 리스크  
            를 2~3문장으로 정리하세요.

          🔎 **출력 형식**  
          3) 모든 내용은 한국어로 작성하되, 가격은 USD 기준으로 표기하세요.
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