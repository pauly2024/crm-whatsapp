import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    console.log("Testing DB connection...");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    
    const result = await prisma.$queryRawUnsafe("SELECT 1 as test");
    console.log("Connection test result:", result);
    
    return NextResponse.json({ 
      success: true, 
      message: "DB connection works",
      test: result 
    });
  } catch (error: any) {
    console.error("DB test error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || String(error),
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack 
    }, { status: 500 });
  }
}