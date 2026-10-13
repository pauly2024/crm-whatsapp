import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// CORS headers para permitir peticiones desde Caso 1 (Radar Leads)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function corsResponse(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

// Endpoint para importar lead de Caso 1 (Radar Leads)
export async function POST(request: Request) {
  try {
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log("DATABASE_URL starts with:", process.env.DATABASE_URL?.substring(0, 30));
    const body = await request.json();

    const {
      id,
      displayName,
      formattedAddress,
      phoneNumber,
      email,
      website,
      opportunityScore,
      packageType,
      packagePrice,
      siteUrl,
    } = body;

    if (!id || !displayName || !phoneNumber) {
      return corsResponse(
        { error: "Datos requeridos: id, displayName, phoneNumber" },
        400
      );
    }

    // 1. Crear contacto en el CRM
    const contacto = await prisma.contacto.create({
      data: {
        leadId: id,
        nombre: displayName,
        telefono: phoneNumber,
        email: email || undefined,
        empresa: formattedAddress || "Taller mecánico",
        fuente: "Radar Leads Caso 1",
      },
    });

    // 2. Crear conversación WhatsApp
    const conversacion = await prisma.conversacion.create({
      data: {
        contactoId: contacto.id,
        numeroWhatsapp: phoneNumber,
        estado: "pendiente",
      },
    });

    // 3. Crear lead de Caso 1 referenciado
    const leadCaso1 = await prisma.leadCaso1.create({
      data: {
        id: id,
        displayName,
        formattedAddress,
        phoneNumber,
        email,
        website,
        opportunityScore,
        packageType,
        packagePrice,
        siteUrl,
        status: "Contactado",
      },
    });

    return corsResponse({
      success: true,
      message: "Lead importado exitosamente al CRM",
      contacto,
      conversacion,
      leadCaso1,
    });
  } catch (error: any) {
    console.error("Error importando lead al CRM:", error);
    console.error("Error message:", error?.message);
    console.error("Error code:", error?.code);
    console.error("Error meta:", error?.meta);
    console.error("Error stack:", error?.stack);
    return corsResponse(
      { error: "Error interno al importar lead", details: error?.message || String(error), code: error?.code, meta: error?.meta, stack: error?.stack },
      500
    );
  }
}

// Endpoint GET para verificar estado
export async function GET(request: Request) {
  return corsResponse({
    status: "online",
    message: "Endpoint /api/crm/leads/import activo",
    version: "2.1-debug",
    timestamp: new Date().toISOString(),
  });
}

// Manejar preflight OPTIONS
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}