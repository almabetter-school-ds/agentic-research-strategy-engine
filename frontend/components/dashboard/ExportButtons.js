"use client";

import { Download } from "lucide-react";
import { downloadBlob } from "./analysisUtils";
import { Button } from "../ui/button";

const MIME = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

export function ExportButtons({ data, pdfTargetId }) {
  const report = buildReport(data);
  const exportButtonClass =
    "h-12 min-w-[92px] justify-start rounded-xl border-white/10 bg-elevated/90 px-4 text-[15px] font-semibold shadow-lg shadow-black/15 ring-1 ring-white/[0.04] backdrop-blur hover:-translate-y-0.5 hover:border-primary/55 hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent-blue/15 hover:shadow-primary/20";
  const exportIconClass = "text-primary";

  return (
    <div data-export-actions className="flex flex-wrap gap-2 lg:justify-end">
      <Button className={exportButtonClass} variant="secondary" onClick={() => printDashboardPdf(pdfTargetId, report)}>
        <Download size={17} className={exportIconClass} />
        PDF
      </Button>
      <Button className={exportButtonClass} variant="secondary" onClick={() => downloadBlob("analysis.docx", createDocx(report), MIME.docx)}>
        <Download size={17} className={exportIconClass} />
        Word
      </Button>
    </div>
  );
}

function printDashboardPdf(targetId, report) {
  const target = targetId ? document.getElementById(targetId) : null;
  if (!target) {
    downloadBlob("analysis.pdf", createPdf(report), MIME.pdf);
    return;
  }

  const printWindow = window.open("", "_blank", "width=1440,height=1000");
  if (!printWindow) {
    window.print();
    return;
  }

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map(node => {
      if (node.tagName.toLowerCase() === "link") {
        const href = new URL(node.getAttribute("href"), window.location.href).href;
        return `<link rel="stylesheet" href="${escapeHtml(href)}">`;
      }
      return node.outerHTML;
    })
    .join("\n");

  const title = report.title || "Market Analysis";
  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html class="dark">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} PDF</title>
    ${styles}
    <style>
      @page { size: A4 landscape; margin: 8mm; }
      html, body {
        background: #05070d !important;
        color: #eef2ff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        margin: 0;
        padding: 18px;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      [data-export-actions] { display: none !important; }
      #analysis-dashboard-print {
        width: 100% !important;
        max-width: none !important;
        animation: none !important;
      }
      #analysis-dashboard-print > section,
      #analysis-dashboard-print > div,
      .recharts-wrapper,
      table {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      svg { max-width: 100%; }
      * {
        box-shadow: none !important;
        text-shadow: none !important;
      }
      @media print {
        body { padding: 0; }
        #analysis-dashboard-print { gap: 14px !important; }
      }
    </style>
  </head>
  <body>
    ${target.outerHTML}
    <script>
      window.addEventListener("load", () => {
        setTimeout(() => {
          window.focus();
          window.print();
        }, 500);
      });
      window.addEventListener("afterprint", () => window.close());
    </script>
  </body>
</html>`);
  printWindow.document.close();
}

function buildReport(data = {}) {
  const metrics = [
    ["Overall Score", data.overallScore],
    ["Confidence", data.confidence],
    ["Market Size", data.marketSize],
    ["Competition Score", data.competitionScore],
    ["Investment Score", data.investmentScore],
    ["Risk Score", data.riskScore],
    ["Demand Score", data.demandScore],
    ["CAGR", data.cagr]
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  const sections = [
    ["Executive Summary", data.executiveSummary || data.summary],
    ["Market Opportunities", data.opportunities],
    ["Industry Trends", data.trends],
    ["Risks", data.risks],
    ["Growth Drivers", data.growthDrivers],
    ["Challenges", data.challenges],
    ["Go To Market", data.goToMarket],
    ["Recommendations", data.recommendations],
    ["Final AI Conclusion", data.finalConclusion]
  ].filter(([, value]) => hasContent(value));

  return {
    title: String(data.title || "Market Analysis"),
    generatedAt: new Date().toLocaleString(),
    metrics,
    sections,
    raw: data
  };
}

function hasContent(value) {
  return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim() !== "";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatValue(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function createPdf(report) {
  const lines = [
    report.title,
    `Generated: ${report.generatedAt}`,
    "",
    ...report.metrics.map(([label, value]) => `${label}: ${formatValue(value)}`),
    ""
  ];

  report.sections.forEach(([title, value]) => {
    lines.push(title);
    lines.push(...textLines(value));
    lines.push("");
  });

  const pages = paginate(wrapLines(lines, 88), 42);
  const objects = [];
  const pageRefs = [];
  const fontObjectNumber = 3 + pages.length * 2;

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("");

  pages.forEach((pageLines, index) => {
    const pageObjectNumber = 3 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    pageRefs.push(`${pageObjectNumber} 0 R`);
    const stream = [
      "BT",
      "/F1 11 Tf",
      "50 780 Td",
      "14 TL",
      ...pageLines.map(line => `(${pdfText(line)}) Tj T*`),
      "ET"
    ].join("\n");
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`);
    objects.push(`<< /Length ${byteLength(stream)} >>\nstream\n${stream}\nendstream`);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pageRefs.length} >>`;
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  return pdfDocument(objects);
}

function pdfDocument(objects) {
  const parts = ["%PDF-1.4\n"];
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(byteLength(parts.join("")));
    parts.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
  });
  const xrefOffset = byteLength(parts.join(""));
  parts.push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  offsets.slice(1).forEach(offset => parts.push(`${String(offset).padStart(10, "0")} 00000 n \n`));
  parts.push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return encode(parts.join(""));
}

function createDocx(report) {
  const paragraphs = [
    paragraph(report.title, true),
    paragraph(`Generated: ${report.generatedAt}`),
    ...report.metrics.map(([label, value]) => paragraph(`${label}: ${formatValue(value)}`))
  ];

  report.sections.forEach(([title, value]) => {
    paragraphs.push(paragraph(title, true));
    textLines(value).forEach(line => paragraphs.push(paragraph(line)));
  });

  return zipFiles({
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    "word/document.xml": `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs.join("")}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`
  });
}

function paragraph(text, bold = false) {
  const runProps = bold ? "<w:rPr><w:b/></w:rPr>" : "";
  return `<w:p><w:r>${runProps}<w:t xml:space="preserve">${xmlText(text)}</w:t></w:r></w:p>`;
}

function textLines(value) {
  if (Array.isArray(value)) return value.map((item, index) => `${index + 1}. ${formatValue(item)}`);
  return String(value || "").split(/\r?\n/).filter(Boolean);
}

function wrapLines(lines, width) {
  return lines.flatMap(line => {
    const words = String(line).split(/\s+/);
    const wrapped = [];
    let current = "";
    words.forEach(word => {
      if (`${current} ${word}`.trim().length > width) {
        if (current) wrapped.push(current);
        current = word;
      } else {
        current = `${current} ${word}`.trim();
      }
    });
    wrapped.push(current);
    return wrapped;
  });
}

function paginate(lines, pageSize) {
  const pages = [];
  for (let index = 0; index < lines.length; index += pageSize) pages.push(lines.slice(index, index + pageSize));
  return pages.length ? pages : [["Market Analysis"]];
}

function zipFiles(files) {
  const entries = Object.entries(files).map(([name, content]) => ({ name, data: encode(content) }));
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  entries.forEach(entry => {
    const nameBytes = encode(entry.name);
    const crc = crc32(entry.data);
    const localHeader = zipHeader(0x04034b50, [
      [20, 2], [0x0800, 2], [0, 2], [0, 2], [0, 2], [crc, 4],
      [entry.data.length, 4], [entry.data.length, 4], [nameBytes.length, 2], [0, 2]
    ]);
    localParts.push(localHeader, nameBytes, entry.data);

    const centralHeader = zipHeader(0x02014b50, [
      [20, 2], [20, 2], [0x0800, 2], [0, 2], [0, 2], [0, 2], [crc, 4],
      [entry.data.length, 4], [entry.data.length, 4], [nameBytes.length, 2], [0, 2],
      [0, 2], [0, 2], [0, 2], [0, 4], [offset, 4]
    ]);
    centralParts.push(centralHeader, nameBytes);
    offset += localHeader.length + nameBytes.length + entry.data.length;
  });

  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const end = zipHeader(0x06054b50, [
    [0, 2], [0, 2], [entries.length, 2], [entries.length, 2], [centralSize, 4], [offset, 4], [0, 2]
  ]);

  return concatBytes([...localParts, ...centralParts, end]);
}

function zipHeader(signature, fields) {
  const size = 4 + fields.reduce((total, [, bytes]) => total + bytes, 0);
  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);
  let offset = 0;
  view.setUint32(offset, signature, true);
  offset += 4;
  fields.forEach(([value, bytes]) => {
    if (bytes === 2) view.setUint16(offset, value, true);
    if (bytes === 4) view.setUint32(offset, value >>> 0, true);
    offset += bytes;
  });
  return new Uint8Array(buffer);
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let index = 0; index < bytes.length; index += 1) {
    crc ^= bytes[index];
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function concatBytes(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  parts.forEach(part => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function pdfText(value) {
  return String(value).replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function xmlText(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function encode(value) {
  return new TextEncoder().encode(value);
}

function byteLength(value) {
  return encode(value).length;
}
