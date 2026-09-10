import { NextResponse, type NextRequest } from "next/server";

/**
 * /api/* burada artık sadece web'in kendi kullandığı bir uç nokta değil —
 * cooksnap-mobile (Expo/React Native) da aynı /api/recipe ve /api/meals/*
 * route'larını "ortak backend" olarak çağırıyor (bkz. cooksnap-mobile
 * lib/api/client.ts). Native derlemede CORS diye bir kısıt yok, ama Expo'nun
 * web çıktısı (expo start --web / EAS web export) gerçek bir tarayıcıdan
 * farklı bir origin'den (localhost:8081 gibi) fetch attığı için tarayıcı
 * bunu CORS ile engelliyordu — bu middleware /api/* için Access-Control-*
 * başlıklarını ekleyip OPTIONS preflight'ı doğrudan burada karşılıyor.
 */
export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(corsHeaders())) {
    response.headers.set(key, value);
  }
  return response;
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export const config = {
  matcher: "/api/:path*",
};
