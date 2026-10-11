import { NextResponse } from "next/server";
import { getProviderStatus, setRuntimeKeys, resetRuntimeKeys } from "@/lib/llm";

export async function GET() {
  try {
    const status = getProviderStatus();
    return NextResponse.json({ success: true, data: status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.reset) {
      resetRuntimeKeys();
    } else {
      setRuntimeKeys({
        cerebrasKey: body.cerebrasKey,
        openrouterKey: body.openrouterKey,
        apifyToken: body.apifyToken,
        forcedProvider: body.forcedProvider,
      });
    }

    const updatedStatus = getProviderStatus();
    return NextResponse.json({
      success: true,
      data: updatedStatus,
      message: "Provider configuration updated successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
