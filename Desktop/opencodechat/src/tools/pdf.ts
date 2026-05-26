/**
 * PDF Tools for NeniCoder
 *
 * Create and read PDF files using pure Node.js — no extra npm packages needed.
 *
 * PDF Creation:
 *   pdf_create       — Create a PDF from text/markdown content
 *   pdf_create_table — Create a PDF with a data table
 *   pdf_create_invoice — Create a professional invoice PDF
 *   pdf_create_report — Create a multi-section report PDF
 *   pdf_merge         — Merge multiple PDFs into one
 *
 * PDF Reading:
 *   pdf_read          — Extract text content from a PDF
 *   pdf_info          — Get PDF metadata (pages, author, title, etc.)
 *   pdf_extract_images — Extract embedded images from a PDF
 *
 * All PDFs are saved to the workspace.
 */

import * as fs from "fs";
import * as path from "path";
import { config } from "../config.js";

// ── Helpers ───────────────────────────────────────────────

function pdfDir(): string {
  const dir = path.join(config.workspace, "pdfs");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ── PDF Creation (Pure Node.js — no dependencies) ─────────

/**
 * Escape special PDF characters in a string
 */
function pdfEscape(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Convert hex string to bytes
 */
function hexToBytes(hex: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bytes;
}

/**
 * Create a simple but valid PDF from text content
 */
export async function pdfCreate(
  filename: string,
  content: string,
  title?: string,
  author?: string
): Promise<string> {
  const filePath = path.join(pdfDir(), filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  const now = new Date();
  const dateStr = `D:${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;

  // Split content into lines, handling markdown-like formatting
  const lines = content.split("\n");
  const textLines: string[] = [];

  for (const line of lines) {
    // Convert markdown headers to plain text with markers
    if (line.startsWith("# ")) {
      textLines.push(`[H1] ${line.substring(2)}`);
    } else if (line.startsWith("## ")) {
      textLines.push(`[H2] ${line.substring(3)}`);
    } else if (line.startsWith("### ")) {
      textLines.push(`[H3] ${line.substring(4)}`);
    } else if (line.startsWith("---") || line.startsWith("===")) {
      textLines.push("[HR]");
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      textLines.push(`• ${line.substring(2)}`);
    } else if (line.startsWith("|") && line.endsWith("|")) {
      // Table row — strip pipes and format
      const cells = line.split("|").filter(c => c.trim()).map(c => c.trim());
      if (cells.every(c => /^[\s-]+$/.test(c))) {
        textLines.push("[HR]"); // Separator row
      } else {
        textLines.push(cells.join("  |  "));
      }
    } else {
      textLines.push(line);
    }
  }

  // Build PDF content streams
  const objects: string[] = [];
  const offsets: number[] = [];
  let pdf = "%PDF-1.4\n";

  // Object 1: Catalog
  offsets.push(pdf.length);
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

  // Object 2: Pages
  offsets.push(pdf.length + objects.join("").length);
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);

  // Build page content
  let pageContent = "BT\n/F1 12 Tf\n50 750 Td\n";
  const lineHeight = 16;
  let y = 0;

  for (const line of textLines) {
    if (line === "[HR]") {
      pageContent += "0 -8 Td\n0.5 w\n0 -4 m 512 -4 l S\n0 -4 Td\n";
      y += 16;
      continue;
    }

    let fontSize = 12;
    let fontName = "F1";

    if (line.startsWith("[H1] ")) {
      fontSize = 24;
      pageContent += `/F1 ${fontSize} Tf\n`;
      pageContent += pdfEscape(line.substring(5)) + " Tj\n";
      pageContent += "/F1 12 Tf\n";
      y += 32;
      continue;
    } else if (line.startsWith("[H2] ")) {
      fontSize = 18;
      pageContent += `/F1 ${fontSize} Tf\n`;
      pageContent += pdfEscape(line.substring(5)) + " Tj\n";
      pageContent += "/F1 12 Tf\n";
      y += 24;
      continue;
    } else if (line.startsWith("[H3] ")) {
      fontSize = 14;
      pageContent += `/F1 ${fontSize} Tf\n`;
      pageContent += pdfEscape(line.substring(5)) + " Tj\n";
      pageContent += "/F1 12 Tf\n";
      y += 20;
      continue;
    }

    // Word wrap long lines
    const maxChars = 85;
    if (line.length > maxChars) {
      const words = line.split(" ");
      let currentLine = "";
      for (const word of words) {
        if ((currentLine + " " + word).length > maxChars) {
          pageContent += pdfEscape(currentLine.trim()) + " Tj\n0 -" + lineHeight + " Td\n";
          currentLine = word;
          y += lineHeight;
        } else {
          currentLine += (currentLine ? " " : "") + word;
        }
      }
      if (currentLine) {
        pageContent += pdfEscape(currentLine.trim()) + " Tj\n0 -" + lineHeight + " Td\n";
        y += lineHeight;
      }
    } else {
      pageContent += pdfEscape(line || " ") + " Tj\n0 -" + lineHeight + " Td\n";
      y += lineHeight;
    }

    // Page break if needed
    if (y > 700) {
      pageContent += "0 750 Td\n";
      y = 0;
    }
  }

  pageContent += "ET\n";
  const contentStream = pageContent;

  // Object 3: Page
  const obj3Offset = pdf.length + objects.join("").length;
  offsets.push(obj3Offset);
  objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`);

  // Object 4: Content stream
  const obj4Offset = pdf.length + objects.join("").length;
  offsets.push(obj4Offset);
  objects.push(`4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`);

  // Object 5: Font
  const obj5Offset = pdf.length + objects.join("").length;
  offsets.push(obj5Offset);
  objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

  // Object 6: Info
  const obj6Offset = pdf.length + objects.join("").length;
  offsets.push(obj6Offset);
  objects.push(`6 0 obj\n<< /Title (${pdfEscape(title || filename)}) /Author (${pdfEscape(author || "NeniCoder")}) /Creator (NeniCoder) /Producer (NeniCoder PDF Engine) /CreationDate (${dateStr}) >>\nendobj\n`);

  // Build final PDF
  pdf += objects.join("");

  // Cross-reference table
  const xrefOffset = pdf.length;
  pdf += "xref\n";
  pdf += `0 ${offsets.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  // Trailer
  pdf += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R /Info 6 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  fs.writeFileSync(filePath, pdf);
  return `PDF created: ${filePath} (${textLines.length} lines, ${fs.statSync(filePath).size} bytes)`;
}

/**
 * Create a PDF with a data table
 */
export async function pdfCreateTable(
  filename: string,
  headers: string,
  rows: string,
  title?: string
): Promise<string> {
  const headerArr = headers.split(",").map(h => h.trim());
  const rowArr = rows.split("\n").map(r => r.split(",").map(c => c.trim()));

  const filePath = path.join(pdfDir(), filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  const now = new Date();
  const dateStr = `D:${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;

  const colWidth = 512 / headerArr.length;
  const rowHeight = 20;
  const startY = 700;
  const startX = 50;

  let content = "BT\n";

  // Title
  if (title) {
    content += "/F2 16 Tf\n";
    content += `${pdfEscape(title)} Tj\n`;
    content += "/F1 10 Tf\n";
    content += "0 -30 Td\n";
  }

  // Table header
  content += "0.5 w\n";
  content += "/F2 10 Tf\n";

  // Header background
  content += "0.9 0.9 0.9 rg\n";
  content += `${startX} ${startY - rowHeight} ${512} ${rowHeight} re f\n`;
  content += "0 0 0 rg\n";

  // Header text
  for (let i = 0; i < headerArr.length; i++) {
    const x = startX + 5 + i * colWidth;
    content += `1 0 0 1 ${x} ${startY - 14} Tm\n`;
    content += `${pdfEscape(headerArr[i])} Tj\n`;
  }

  // Header bottom line
  content += `${startX} ${startY - rowHeight} m ${startX + 512} ${startY - rowHeight} l S\n`;

  // Table rows
  content += "/F1 9 Tf\n";
  let y = startY - rowHeight;

  for (let r = 0; r < rowArr.length; r++) {
    y -= rowHeight;
    if (y < 50) break; // Page break

    // Alternating row background
    if (r % 2 === 0) {
      content += "0.97 0.97 0.97 rg\n";
      content += `${startX} ${y} ${512} ${rowHeight} re f\n`;
      content += "0 0 0 rg\n";
    }

    // Row text
    for (let c = 0; c < rowArr[r].length && c < headerArr.length; c++) {
      const x = startX + 5 + c * colWidth;
      content += `1 0 0 1 ${x} ${y + 6} Tm\n`;
      content += `${pdfEscape(rowArr[r][c] || "")} Tj\n`;
    }

    // Row line
    content += "0.3 w\n0.8 0.8 0.8 RG\n";
    content += `${startX} ${y} m ${startX + 512} ${y} l S\n`;
    content += "0.5 w\n0 0 0 RG\n";
  }

  // Table border
  content += `${startX} ${startY} m ${startX} ${y} l ${startX + 512} ${y} l ${startX + 512} ${startY} l S\n`;

  content += "ET\n";

  // Build PDF
  const objects: string[] = [];
  const offsets: number[] = [];
  let pdf = "%PDF-1.4\n";

  offsets.push(pdf.length);
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

  offsets.push(pdf.length + objects.join("").length);
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);

  offsets.push(pdf.length + objects.join("").length);
  objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n`);

  offsets.push(pdf.length + objects.join("").length);
  objects.push(`4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);

  offsets.push(pdf.length + objects.join("").length);
  objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

  offsets.push(pdf.length + objects.join("").length);
  objects.push(`6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);

  offsets.push(pdf.length + objects.join("").length);
  objects.push(`7 0 obj\n<< /Title (${pdfEscape(title || filename)}) /Creator (NeniCoder) /CreationDate (${dateStr}) >>\nendobj\n`);

  pdf += objects.join("");

  const xrefOffset = pdf.length;
  pdf += "xref\n";
  pdf += `0 ${offsets.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R /Info 7 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  fs.writeFileSync(filePath, pdf);
  return `Table PDF created: ${filePath} (${rowArr.length} rows × ${headerArr.length} cols, ${fs.statSync(filePath).size} bytes)`;
}

/**
 * Create a professional invoice PDF
 */
export async function pdfCreateInvoice(
  filename: string,
  data: string
): Promise<string> {
  // Parse invoice data (JSON or key:value format)
  let invoice: Record<string, any> = {};
  try {
    invoice = JSON.parse(data);
  } catch {
    // Parse key:value format
    for (const line of data.split("\n")) {
      const [key, ...rest] = line.split(":");
      if (key && rest.length) {
        invoice[key.trim()] = rest.join(":").trim();
      }
    }
  }

  const filePath = path.join(pdfDir(), filename.endsWith(".pdf") ? filename : `${filename}.pdf`);

  const companyName = invoice.company || "Nenifix";
  const companyAddress = invoice.address || "";
  const invoiceNumber = invoice.number || `INV-${Date.now()}`;
  const date = invoice.date || new Date().toLocaleDateString();
  const dueDate = invoice.due_date || date;
  const clientName = invoice.client || "Client";
  const clientAddress = invoice.client_address || "";
  const notes = invoice.notes || "";
  const currency = invoice.currency || "$";

  // Parse line items
  let items: Array<{ desc: string; qty: number; rate: number }> = [];
  if (invoice.items) {
    try {
      items = typeof invoice.items === "string" ? JSON.parse(invoice.items) : invoice.items;
    } catch {
      // Parse simple format: "Item 1, 2, 50\nItem 2, 1, 100"
      for (const line of invoice.items.split("\n")) {
        const parts = line.split(",");
        if (parts.length >= 3) {
          items.push({ desc: parts[0].trim(), qty: parseFloat(parts[1]) || 1, rate: parseFloat(parts[2]) || 0 });
        }
      }
    }
  }

  if (items.length === 0) {
    items = [{ desc: "Service", qty: 1, rate: 0 }];
  }

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const taxRate = parseFloat(invoice.tax_rate) || 0;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  // Build PDF content
  let content = "BT\n";

  // Company header
  content += "/F2 20 Tf\n";
  content += `${pdfEscape(companyName)} Tj\n`;
  content += "/F1 10 Tf\n";
  content += "0 -16 Td\n";
  content += `${pdfEscape(companyAddress)} Tj\n`;

  // Invoice title
  content += "/F2 28 Tf\n";
  content += "0 -40 Td\n";
  content += "INVOICE Tj\n";

  // Reset font
  content += "/F1 10 Tf\n";
  content += "0 -20 Td\n";

  // Invoice details (right-aligned area)
  content += `/F2 10 Tf\n`;
  content += `Invoice #: ${pdfEscape(invoiceNumber)} Tj\n`;
  content += "0 -14 Td\n";
  content += `Date: ${pdfEscape(date)} Tj\n`;
  content += "0 -14 Td\n";
  content += `Due: ${pdfEscape(dueDate)} Tj\n`;

  // Bill to
  content += "/F1 10 Tf\n";
  content += "0 -30 Td\n";
  content += `/F2 10 Tf\n`;
  content += `Bill To: Tj\n`;
  content += "/F1 10 Tf\n";
  content += "0 -14 Td\n";
  content += `${pdfEscape(clientName)} Tj\n`;
  content += "0 -12 Td\n";
  content += `${pdfEscape(clientAddress)} Tj\n`;

  // Line items table
  content += "0 -30 Td\n";
  content += "0.5 w\n";

  // Table header
  content += "0.9 0.9 0.9 rg\n";
  content += `50 0 400 20 re f\n`;
  content += "0 0 0 rg\n";
  content += "/F2 9 Tf\n";
  content += "1 0 0 1 55 6 Tm\n";
  content += "Description Tj\n";
  content += "1 0 0 1 350 6 Tm\n";
  content += "Qty Tj\n";
  content += "1 0 0 1 400 6 Tm\n";
  content += "Rate Tj\n";
  content += "1 0 0 1 460 6 Tm\n";
  content += "Amount Tj\n";

  content += "/F1 9 Tf\n";
  let tableY = -20;

  for (const item of items) {
    const amount = item.qty * item.rate;
    content += `1 0 0 1 55 ${tableY + 6} Tm\n`;
    content += `${pdfEscape(item.desc)} Tj\n`;
    content += `1 0 0 1 350 ${tableY + 6} Tm\n`;
    content += `${item.qty} Tj\n`;
    content += `1 0 0 1 400 ${tableY + 6} Tm\n`;
    content += `${currency}${item.rate.toFixed(2)} Tj\n`;
    content += `1 0 0 1 460 ${tableY + 6} Tm\n`;
    content += `${currency}${amount.toFixed(2)} Tj\n`;
    tableY -= 18;
  }

  // Totals
  content += "0 -10 Td\n";
  content += "0.5 w\n350 0 m490 0 l S\n";
  content += "0 -14 Td\n";
  content += `/F2 10 Tf\n`;
  content += `1 0 0 1 350 -2 Tm\n`;
  content += `Subtotal: ${currency}${subtotal.toFixed(2)} Tj\n`;
  content += "0 -14 Td\n";
  content += `Tax (${taxRate}%): ${currency}${tax.toFixed(2)} Tj\n`;
  content += "0 -18 Td\n";
  content += `/F2 14 Tf\n`;
  content += `TOTAL: ${currency}${total.toFixed(2)} Tj\n`;

  // Notes
  if (notes) {
    content += "/F1 9 Tf\n";
    content += "0 -40 Td\n";
    content += `/F2 10 Tf\n`;
    content += "Notes: Tj\n";
    content += "/F1 9 Tf\n";
    content += "0 -14 Td\n";
    content += `${pdfEscape(notes)} Tj\n`;
  }

  content += "ET\n";

  // Build PDF (same structure as above)
  const objects: string[] = [];
  const offsets: number[] = [];
  let pdf = "%PDF-1.4\n";

  offsets.push(pdf.length);
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  offsets.push(pdf.length + objects.join("").length);
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);
  offsets.push(pdf.length + objects.join("").length);
  objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n`);
  offsets.push(pdf.length + objects.join("").length);
  objects.push(`4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);
  offsets.push(pdf.length + objects.join("").length);
  objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
  offsets.push(pdf.length + objects.join("").length);
  objects.push(`6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);

  pdf += objects.join("");
  const xrefOffset = pdf.length;
  pdf += "xref\n";
  pdf += `0 ${offsets.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  fs.writeFileSync(filePath, pdf);
  return `Invoice PDF created: ${filePath}\nInvoice #: ${invoiceNumber}\nTotal: ${currency}${total.toFixed(2)}\nItems: ${items.length}`;
}

/**
 * Create a multi-section report PDF
 */
export async function pdfCreateReport(
  filename: string,
  title: string,
  sections: string
): Promise<string> {
  // Parse sections (format: "Section Title|Content\nSection Title2|Content2")
  const sectionList: Array<{ title: string; content: string }> = [];
  for (const line of sections.split("\n")) {
    const [secTitle, ...rest] = line.split("|");
    if (secTitle && rest.length) {
      sectionList.push({ title: secTitle.trim(), content: rest.join("|").trim() });
    }
  }

  if (sectionList.length === 0) {
    return pdfCreate(filename, sections, title);
  }

  // Build content with section headers
  let fullContent = `# ${title}\n\n`;
  for (const sec of sectionList) {
    fullContent += `## ${sec.title}\n\n${sec.content}\n\n`;
  }

  return pdfCreate(filename, fullContent, title);
}

// ── PDF Reading ───────────────────────────────────────────

/**
 * Read text content from a PDF file
 * Uses a lightweight approach — extracts text from PDF streams
 */
export async function pdfRead(filePath: string): Promise<string> {
  const fullPath = filePath.startsWith("/") ? filePath : path.join(config.workspace, filePath);

  if (!fs.existsSync(fullPath)) {
    return `Error: File not found: ${fullPath}`;
  }

  const buffer = fs.readFileSync(filePath);
  const pdfText = buffer.toString("latin1");

  // Extract text from PDF streams
  const textParts: string[] = [];

  // Find all text objects (BT...ET blocks)
  const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  while ((match = btEtRegex.exec(pdfText)) !== null) {
    const block = match[1];
    // Extract text from Tj and TJ operators
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      let text = tjMatch[1];
      // Unescape PDF string
      text = text
        .replace(/\\\n/g, "\n")
        .replace(/\\\r/g, "\r")
        .replace(/\\\t/g, "\t")
        .replace(/\\\\/g, "\\")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
        .replace(/\\(\d{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
      if (text.trim()) textParts.push(text);
    }

    // Also try TJ operator: [(text)] TJ
    const tjArrayRegex = /\[\s*\(([^)]*)\)\s*\]\s*TJ/g;
    while ((tjMatch = tjArrayRegex.exec(block)) !== null) {
      let text = tjMatch[1];
      text = text.replace(/\\\(/g, "(").replace(/\\\)/g, ")");
      if (text.trim()) textParts.push(text);
    }
  }

  if (textParts.length === 0) {
    // Fallback: try to extract any readable text
    const readable = pdfText.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
    if (readable.length > 100) {
      return readable.substring(0, 8000) + (readable.length > 8000 ? "\n... [truncated]" : "");
    }
    return "Could not extract readable text from this PDF. It may be image-based or use advanced encoding.";
  }

  const result = textParts.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  if (result.length > 8000) return result.substring(0, 8000) + "\n... [truncated]";
  return result || "No text content found in PDF.";
}

/**
 * Get PDF metadata (page count, title, author, etc.)
 */
export async function pdfInfo(filePath: string): Promise<string> {
  const fullPath = filePath.startsWith("/") ? filePath : path.join(config.workspace, filePath);

  if (!fs.existsSync(fullPath)) {
    return `Error: File not found: ${fullPath}`;
  }

  const buffer = fs.readFileSync(fullPath);
  const pdfText = buffer.toString("latin1");
  const stats = fs.statSync(fullPath);

  const info: Record<string, string> = {};

  // Extract metadata from Info object
  const titleMatch = pdfText.match(/\/Title\s*\(([^)]*)\)/);
  const authorMatch = pdfText.match(/\/Author\s*\(([^)]*)\)/);
  const creatorMatch = pdfText.match(/\/Creator\s*\(([^)]*)\)/);
  const producerMatch = pdfText.match(/\/Producer\s*\(([^)]*)\)/);
  const dateMatch = pdfText.match(/\/CreationDate\s*\(D:(\d{14})\)/);
  const modDateMatch = pdfText.match(/\/ModDate\s*\(D:(\d{14})\)/);

  // Count pages
  const pageMatches = pdfText.match(/\/Type\s*\/Page[^s]/g);
  const pageCount = pageMatches ? pageMatches.length : 0;

  // Extract PDF version
  const versionMatch = pdfText.match(/%PDF-(\d+\.\d+)/);

  info["File"] = path.basename(fullPath);
  info["Size"] = `${(stats.size / 1024).toFixed(1)} KB`;
  info["PDF Version"] = versionMatch ? versionMatch[1] : "Unknown";
  info["Pages"] = String(pageCount);
  if (titleMatch) info["Title"] = titleMatch[1];
  if (authorMatch) info["Author"] = authorMatch[1];
  if (creatorMatch) info["Creator"] = creatorMatch[1];
  if (producerMatch) info["Producer"] = producerMatch[1];
  if (dateMatch) {
    const d = dateMatch[1];
    info["Created"] = `${d.substr(0, 4)}-${d.substr(4, 2)}-${d.substr(6, 2)} ${d.substr(8, 2)}:${d.substr(10, 2)}`;
  }
  if (modDateMatch) {
    const d = modDateMatch[1];
    info["Modified"] = `${d.substr(0, 4)}-${d.substr(4, 2)}-${d.substr(6, 2)} ${d.substr(8, 2)}:${d.substr(10, 2)}`;
  }

  return Object.entries(info).map(([k, v]) => `${k}: ${v}`).join("\n");
}

/**
 * Merge multiple PDFs into one
 */
export async function pdfMerge(
  outputFilename: string,
  inputFiles: string
): Promise<string> {
  const files = inputFiles.split(",").map(f => f.trim());
  const outputPath = path.join(pdfDir(), outputFilename.endsWith(".pdf") ? outputFilename : `${outputFilename}.pdf`);

  // For a proper merge, we'd need to rewrite all object references
  // This is a simplified version that concatenates text content into a new PDF
  let combinedContent = "";

  for (const file of files) {
    const filePath = file.startsWith("/") ? file : path.join(config.workspace, file);
    if (!fs.existsSync(filePath)) {
      combinedContent += `\n\n[Missing file: ${file}]\n\n`;
      continue;
    }
    const text = await pdfRead(filePath);
    combinedContent += `\n\n--- ${path.basename(file)} ---\n\n${text}`;
  }

  return pdfCreate(outputFilename, combinedContent, `Merged: ${files.map(f => path.basename(f)).join(", ")}`);
}
