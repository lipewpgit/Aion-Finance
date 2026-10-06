export const dynamic = "force-dynamic";

type ReferenceRates = {
  result?: string;
  provider?: string;
  time_last_update_unix?: number;
  rates?: Record<string, number>;
};

type AwesomeQuote = {
  bid?: string;
  ask?: string;
  low?: string;
  high?: string;
  pctChange?: string;
  timestamp?: string;
};

type AwesomeRates = Record<string, AwesomeQuote>;

function positiveNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function midpoint(item?: AwesomeQuote) {
  const bid = positiveNumber(item?.bid);
  const ask = positiveNumber(item?.ask);
  if (bid && ask) return (bid + ask) / 2;
  return bid ?? ask;
}

export async function GET() {
  const [referenceResult, marketResult] = await Promise.allSettled([
    fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Referência de moedas indisponível");
      return response.json() as Promise<ReferenceRates>;
    }),
    fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Mercado indisponível");
      return response.json() as Promise<AwesomeRates>;
    }),
  ]);

  const reference = referenceResult.status === "fulfilled" ? referenceResult.value : null;
  const market = marketResult.status === "fulfilled" ? marketResult.value : null;
  const usdBrl = positiveNumber(reference?.rates?.BRL);
  const usdEur = positiveNumber(reference?.rates?.EUR);
  const referenceTimestamp = positiveNumber(reference?.time_last_update_unix);
  const quotes: Record<string, Record<string, number | string | null>> = {};

  if (usdBrl) {
    quotes.USD = {
      rate: usdBrl,
      change: null,
      low: null,
      high: null,
      timestamp: referenceTimestamp ?? Math.floor(Date.now() / 1000),
      source: "ExchangeRate-API",
      kind: "Referência média de mercado",
    };
  }

  if (usdBrl && usdEur) {
    quotes.EUR = {
      rate: usdBrl / usdEur,
      change: null,
      low: null,
      high: null,
      timestamp: referenceTimestamp ?? Math.floor(Date.now() / 1000),
      source: "ExchangeRate-API",
      kind: "Referência média de mercado",
    };
  }

  for (const [key, symbol] of [["USDBRL", "USD"], ["EURBRL", "EUR"], ["BTCBRL", "BTC"]] as const) {
    const item = market?.[key];
    const rate = midpoint(item);
    if (!rate || (symbol !== "BTC" && quotes[symbol])) continue;
    quotes[symbol] = {
      rate,
      change: positiveNumber(item?.pctChange) ?? (Number.isFinite(Number(item?.pctChange)) ? Number(item?.pctChange) : null),
      low: positiveNumber(item?.low),
      high: positiveNumber(item?.high),
      timestamp: positiveNumber(item?.timestamp) ?? Math.floor(Date.now() / 1000),
      source: "AwesomeAPI",
      kind: symbol === "BTC" ? "Preço médio entre compra e venda" : "Cotação média de mercado",
    };
  }

  if (!quotes.USD || !quotes.EUR) {
    return Response.json({ error: "Não foi possível consultar as cotações agora." }, { status: 502 });
  }

  return Response.json(
    { quotes, provider: reference?.provider ?? "ExchangeRate-API" },
    { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
