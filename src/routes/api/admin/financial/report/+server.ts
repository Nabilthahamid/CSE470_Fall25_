import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { calculateFinancialSummary } from "$lib/server/services/financialService";
import { generateFinancialReportPDF } from "$lib/server/services/pdfService";

export const GET: RequestHandler = async ({ url }) => {
  try {
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam) {
      startDate = new Date(startDateParam);
    }
    if (endDateParam) {
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    }

    const summary = await calculateFinancialSummary(startDate, endDate);
    const pdfBuffer = await generateFinancialReportPDF(
      summary,
      startDate,
      endDate
    );

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="financial-report-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return json(
      { error: error.message || "Failed to generate PDF report" },
      { status: 500 }
    );
  }
};

