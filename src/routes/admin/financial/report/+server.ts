import {
  calculateFinancialMetrics,
  getDailyFinancialData,
  getTopSellingProducts,
} from "$lib/server/services/financialService";
import PDFDocument from "pdfkit";
import type { RequestHandler } from "./$types";

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Helper function to format date
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Helper function to add page header
function addPageHeader(
  doc: PDFDocument,
  pageNumber: number,
  totalPages: number
) {
  doc.save();
  doc.fillColor("#333333");
  doc.fontSize(10);
  doc.text(
    `Tinytech Financial Report - Page ${pageNumber} of ${totalPages}`,
    50,
    30,
    { align: "left", width: doc.page.width - 100 }
  );
  doc.restore();
}

// Helper function to draw summary box
function drawSummaryBox(
  doc: PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  value: string,
  color: string = "#333333"
) {
  // Box background
  doc.roundedRect(x, y, width, height, 5).fillAndStroke("#f8f9fa", "#e0e0e0");

  // Title
  doc.fillColor("#666666");
  doc.fontSize(9);
  doc.text(title, x + 10, y + 8, { width: width - 20 });

  // Value
  doc.fillColor(color);
  doc.fontSize(16);
  doc.font("Helvetica-Bold");
  doc.text(value, x + 10, y + 22, { width: width - 20 });
  doc.font("Helvetica");
  doc.fillColor("black");
}

export const GET: RequestHandler = async ({ url }) => {
  // Get date range from query params or default to last 30 days
  const dateRange = url.searchParams.get("range") || "30";
  const endDate = new Date();
  const startDate = new Date();

  switch (dateRange) {
    case "7":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "365":
      startDate.setDate(startDate.getDate() - 365);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  // Get financial data
  const metrics = await calculateFinancialMetrics(startDate, endDate);
  const dailyData = await getDailyFinancialData(startDate, endDate);
  const topProducts = await getTopSellingProducts(10, startDate, endDate);

  // Create PDF with better margins
  const doc = new PDFDocument({
    margin: 50,
    size: "LETTER",
    info: {
      Title: "Tinytech Financial Report",
      Author: "Tinytech Admin",
      Subject: "Financial Report",
      Keywords: "financial, report, sales, revenue",
    },
  });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  let pageNumber = 1;
  const totalPages =
    Math.ceil((dailyData.length + topProducts.length) / 20) + 1; // Rough estimate

  // Professional Header with background
  doc.rect(0, 0, doc.page.width, 120).fill("#1a1a1a");
  doc.fillColor("white");
  doc.fontSize(28);
  doc.font("Helvetica-Bold");
  doc.text("TINYTECH", 50, 40, { align: "left" });
  doc.fontSize(18);
  doc.text("Financial Report", 50, 70, { align: "left" });
  doc.fontSize(10);
  doc.font("Helvetica");
  doc.fillColor("#cccccc");
  doc.text(
    `Generated: ${new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    50,
    95,
    { align: "left" }
  );
  doc.fillColor("black");

  // Reset Y position after header
  let yPosition = 140;

  // Report Period Section
  doc.fontSize(12);
  doc.fillColor("#666666");
  doc.text(
    `Report Period: ${formatDate(startDate)} to ${formatDate(endDate)}`,
    50,
    yPosition,
    {
      align: "left",
    }
  );
  doc.fillColor("black");
  yPosition += 30;

  // Financial Summary Boxes
  doc.fontSize(18);
  doc.font("Helvetica-Bold");
  doc.fillColor("#333333");
  doc.text("Financial Summary", 50, yPosition);
  yPosition += 30;

  const boxWidth = 155;
  const boxHeight = 70;
  const boxSpacing = 15;
  const startX = 50;

  // Calculate average order value
  const avgOrderValue =
    metrics.orderCount > 0 ? metrics.totalRevenue / metrics.orderCount : 0;

  // Revenue box
  drawSummaryBox(
    doc,
    startX,
    yPosition,
    boxWidth,
    boxHeight,
    "Total Revenue",
    formatCurrency(metrics.totalRevenue),
    "#2d5016"
  );

  // Profit box
  const profitColor = metrics.profit >= 0 ? "#2d5016" : "#a82d2d";
  drawSummaryBox(
    doc,
    startX + boxWidth + boxSpacing,
    yPosition,
    boxWidth,
    boxHeight,
    "Net Profit",
    formatCurrency(metrics.profit),
    profitColor
  );

  // Orders box
  drawSummaryBox(
    doc,
    startX + (boxWidth + boxSpacing) * 2,
    yPosition,
    boxWidth,
    boxHeight,
    "Total Orders",
    metrics.orderCount.toString(),
    "#333333"
  );

  // Profit Margin box (second row)
  yPosition += boxHeight + 15;
  drawSummaryBox(
    doc,
    startX,
    yPosition,
    boxWidth,
    boxHeight,
    "Profit Margin",
    `${metrics.profitMargin.toFixed(2)}%`,
    profitColor
  );

  // Total Cost box
  drawSummaryBox(
    doc,
    startX + boxWidth + boxSpacing,
    yPosition,
    boxWidth,
    boxHeight,
    "Total Cost",
    formatCurrency(metrics.totalCost),
    "#666666"
  );

  // Average Order Value box
  drawSummaryBox(
    doc,
    startX + (boxWidth + boxSpacing) * 2,
    yPosition,
    boxWidth,
    boxHeight,
    "Avg Order Value",
    formatCurrency(avgOrderValue),
    "#333333"
  );

  yPosition += boxHeight + 40;

  // Daily Breakdown Table
  if (dailyData.length > 0) {
    // Check if we need a new page
    if (yPosition > 650) {
      doc.addPage();
      yPosition = 50;
      pageNumber++;
    }

    doc.fontSize(18);
    doc.font("Helvetica-Bold");
    doc.fillColor("#333333");
    doc.text("Daily Breakdown", 50, yPosition);
    yPosition += 25;

    // Table header with background
    const tableStartY = yPosition;
    const rowHeight = 25;
    const headerHeight = 35;
    const colWidths = [100, 110, 110, 110, 90];
    const colHeaders = ["Date", "Revenue", "Cost", "Profit", "Orders"];
    const colAlignments: ("left" | "center" | "right")[] = [
      "left",
      "right",
      "right",
      "right",
      "center",
    ];

    // Header background
    doc
      .rect(50, tableStartY, doc.page.width - 100, headerHeight)
      .fill("#f0f0f0");

    // Header text
    doc.fontSize(10);
    doc.font("Helvetica-Bold");
    doc.fillColor("#333333");
    let currentX = 50;
    colHeaders.forEach((header, index) => {
      doc.text(header, currentX + 10, tableStartY + 12, {
        width: colWidths[index] - 20,
        align: colAlignments[index],
      });
      currentX += colWidths[index];
    });

    yPosition = tableStartY + headerHeight;
    doc.font("Helvetica");
    doc.fontSize(9);

    // Table rows with alternating colors
    dailyData.forEach((day, index) => {
      // Check if we need a new page
      if (yPosition + rowHeight > doc.page.height - 80) {
        doc.addPage();
        pageNumber++;
        yPosition = 50;
        // Redraw header on new page
        doc
          .rect(50, yPosition, doc.page.width - 100, headerHeight)
          .fill("#f0f0f0");
        doc.font("Helvetica-Bold");
        doc.fontSize(10);
        currentX = 50;
        colHeaders.forEach((header, idx) => {
          doc.text(header, currentX + 10, yPosition + 12, {
            width: colWidths[idx] - 20,
            align: colAlignments[idx],
          });
          currentX += colWidths[idx];
        });
        yPosition += headerHeight;
        doc.font("Helvetica");
        doc.fontSize(9);
      }

      // Row background (alternating)
      if (index % 2 === 0) {
        doc
          .rect(50, yPosition, doc.page.width - 100, rowHeight)
          .fill("#fafafa");
      }

      // Row border
      doc.strokeColor("#e0e0e0");
      doc
        .moveTo(50, yPosition + rowHeight)
        .lineTo(doc.page.width - 50, yPosition + rowHeight)
        .stroke();

      // Date
      const date = new Date(day.date);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      doc.fillColor("#333333");
      doc.text(dateStr, 50 + 10, yPosition + 7, {
        width: colWidths[0] - 20,
        align: "left",
      });

      // Revenue
      doc.text(formatCurrency(day.revenue), 150 + 10, yPosition + 7, {
        width: colWidths[1] - 20,
        align: "right",
      });

      // Cost
      doc.text(formatCurrency(day.cost), 260 + 10, yPosition + 7, {
        width: colWidths[2] - 20,
        align: "right",
      });

      // Profit (colored)
      doc.fillColor(day.profit >= 0 ? "#2d5016" : "#a82d2d");
      doc.text(formatCurrency(day.profit), 370 + 10, yPosition + 7, {
        width: colWidths[3] - 20,
        align: "right",
      });
      doc.fillColor("#333333");

      // Orders
      doc.text(day.orderCount.toString(), 480 + 10, yPosition + 7, {
        width: colWidths[4] - 20,
        align: "center",
      });

      yPosition += rowHeight;
    });

    // Bottom border
    doc.strokeColor("#333333");
    doc.lineWidth(2);
    doc
      .moveTo(50, yPosition)
      .lineTo(doc.page.width - 50, yPosition)
      .stroke();
    doc.lineWidth(1);

    yPosition += 30;
  }

  // Top Products Table
  if (topProducts.length > 0) {
    // Check if we need a new page
    if (yPosition > 650) {
      doc.addPage();
      yPosition = 50;
      pageNumber++;
    }

    doc.fontSize(18);
    doc.font("Helvetica-Bold");
    doc.fillColor("#333333");
    doc.text("Top Selling Products", 50, yPosition);
    yPosition += 25;

    // Table header
    const tableStartY = yPosition;
    const rowHeight = 30;
    const headerHeight = 35;
    const colWidths = [250, 90, 120, 120];
    const colHeaders = ["Product Name", "Quantity", "Revenue", "Profit"];
    const colAlignments: ("left" | "center" | "right")[] = [
      "left",
      "center",
      "right",
      "right",
    ];

    // Header background
    doc
      .rect(50, tableStartY, doc.page.width - 100, headerHeight)
      .fill("#f0f0f0");

    // Header text
    doc.fontSize(10);
    doc.font("Helvetica-Bold");
    doc.fillColor("#333333");
    let currentX = 50;
    colHeaders.forEach((header, index) => {
      doc.text(header, currentX + 10, tableStartY + 12, {
        width: colWidths[index] - 20,
        align: colAlignments[index],
      });
      currentX += colWidths[index];
    });

    yPosition = tableStartY + headerHeight;
    doc.font("Helvetica");
    doc.fontSize(9);

    // Table rows
    topProducts.forEach((product, index) => {
      // Check if we need a new page
      if (yPosition + rowHeight > doc.page.height - 80) {
        doc.addPage();
        pageNumber++;
        yPosition = 50;
        // Redraw header on new page
        doc
          .rect(50, yPosition, doc.page.width - 100, headerHeight)
          .fill("#f0f0f0");
        doc.font("Helvetica-Bold");
        doc.fontSize(10);
        currentX = 50;
        colHeaders.forEach((header, idx) => {
          doc.text(header, currentX + 10, yPosition + 12, {
            width: colWidths[idx] - 20,
            align: colAlignments[idx],
          });
          currentX += colWidths[idx];
        });
        yPosition += headerHeight;
        doc.font("Helvetica");
        doc.fontSize(9);
      }

      // Row background (alternating)
      if (index % 2 === 0) {
        doc
          .rect(50, yPosition, doc.page.width - 100, rowHeight)
          .fill("#fafafa");
      }

      // Row border
      doc.strokeColor("#e0e0e0");
      doc
        .moveTo(50, yPosition + rowHeight)
        .lineTo(doc.page.width - 50, yPosition + rowHeight)
        .stroke();

      // Product name (truncate if too long)
      const productName =
        product.productName.length > 35
          ? product.productName.substring(0, 32) + "..."
          : product.productName;
      doc.fillColor("#333333");
      doc.text(productName, 50 + 10, yPosition + 9, {
        width: colWidths[0] - 20,
        align: "left",
      });

      // Quantity
      doc.text(product.quantitySold.toString(), 300 + 10, yPosition + 9, {
        width: colWidths[1] - 20,
        align: "center",
      });

      // Revenue
      doc.text(formatCurrency(product.revenue), 390 + 10, yPosition + 9, {
        width: colWidths[2] - 20,
        align: "right",
      });

      // Profit (colored)
      doc.fillColor(product.profit >= 0 ? "#2d5016" : "#a82d2d");
      doc.text(formatCurrency(product.profit), 510 + 10, yPosition + 9, {
        width: colWidths[3] - 20,
        align: "right",
      });
      doc.fillColor("#333333");

      yPosition += rowHeight;
    });

    // Bottom border
    doc.strokeColor("#333333");
    doc.lineWidth(2);
    doc
      .moveTo(50, yPosition)
      .lineTo(doc.page.width - 50, yPosition)
      .stroke();
    doc.lineWidth(1);
  }

  // Footer on all pages
  doc.on("pageAdded", () => {
    pageNumber++;
    const footerY = doc.page.height - 40;

    // Footer line
    doc.strokeColor("#cccccc");
    doc
      .moveTo(50, footerY - 10)
      .lineTo(doc.page.width - 50, footerY - 10)
      .stroke();

    // Footer text
    doc.fontSize(8);
    doc.fillColor("#666666");
    doc.font("Helvetica");
    doc.text(
      `Generated by Tinytech Admin Dashboard | ${new Date().toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      )}`,
      50,
      footerY,
      {
        align: "center",
        width: doc.page.width - 100,
      }
    );
    doc.fillColor("black");
  });

  // Add footer to first page
  const footerY = doc.page.height - 40;
  doc.strokeColor("#cccccc");
  doc
    .moveTo(50, footerY - 10)
    .lineTo(doc.page.width - 50, footerY - 10)
    .stroke();
  doc.fontSize(8);
  doc.fillColor("#666666");
  doc.font("Helvetica");
  doc.text(
    `Generated by Tinytech Admin Dashboard | ${new Date().toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`,
    50,
    footerY,
    {
      align: "center",
      width: doc.page.width - 100,
    }
  );
  doc.fillColor("black");

  doc.end();

  // Wait for PDF to finish generating
  await new Promise<void>((resolve) => {
    doc.on("end", resolve);
  });

  const pdfBuffer = Buffer.concat(chunks);

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="financial-report-${dateRange}days-${Date.now()}.pdf"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
};
