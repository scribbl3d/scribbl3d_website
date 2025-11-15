import { NextResponse } from "next/server";

const VALID_DISCOUNT_CODES = {
  GET10OFF: 0.1, // 10% discount
};

export async function POST(req: Request) {
  const { code } = await req.json();

  if (code in VALID_DISCOUNT_CODES) {
    return NextResponse.json({
      discount: VALID_DISCOUNT_CODES[code as keyof typeof VALID_DISCOUNT_CODES],
    });
  } else {
    return NextResponse.json(
      { error: "Invalid discount code" },
      { status: 400 }
    );
  }
}
