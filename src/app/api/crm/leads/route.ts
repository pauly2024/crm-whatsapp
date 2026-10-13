import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Endpoint para importar lead de Caso 1 (Radar Leads)
export async function POST(request: Request) {
  try {
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
      return NextResponse.json(
        { error: "Datos requeridos: id, displayName, phoneNumber" },
        { status: 400 }
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

    return NextResponse.json({
      success: true,
      message: "Lead importado exitosamente al CRM",
      contacto,
      conversacion,
      leadCaso1,
    });
  } catch (error) {
    console.error("Error importando lead al CRM:", error);
    return NextResponse.json(
      { error: "Error interno al importar lead" },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificar estado
export async function GET(request: Request) {
  return NextResponse.json({
    status: "online",
    message: "Endpoint /api/crm/leads/import activo",
  });
}