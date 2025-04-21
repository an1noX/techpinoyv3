
import { WikiPrinter, WikiToner, WikiArticleType } from "@/types/types";

// Mock printer data for testing and development
export const MOCK_PRINTERS: Partial<WikiPrinter>[] = [
  {
    make: "HP",
    series: "LaserJet",
    model: "Pro M404n",
    description: "Black and white laser printer for small to medium business use. Fast printing at up to 40 pages per minute.",
    type: "laser",
    specs: {
      color: false,
      ppm: 40,
      duplex: true,
      connectivity: ["USB", "Ethernet"],
      paperSize: ["A4", "Letter", "Legal"]
    },
    maintenance_tips: "Replace toner when print quality diminishes. Clean printer regularly to prevent paper jams."
  },
  {
    make: "Brother",
    series: "MFC",
    model: "L8900CDW",
    description: "Color laser all-in-one printer with scanning, copying, and faxing capabilities.",
    type: "multifunction",
    specs: {
      color: true,
      ppm: 33,
      duplex: true,
      connectivity: ["USB", "Ethernet", "WiFi", "WiFi Direct"],
      paperSize: ["A4", "Letter", "Legal", "Photo"]
    },
    maintenance_tips: "Replace toner cartridges when indicated. Clean scanner glass regularly for best quality."
  }
];

// Define functions for mapping database entities to wiki article format
export const mapPrinterToArticle = (printer: WikiPrinter): WikiArticleType => {
  // Format specs as a string for content display
  const specsFormatted = printer.specs 
    ? Object.entries(printer.specs)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}: ${value.join(', ')}`;
          }
          return `${key}: ${value}`;
        })
        .join('\n') 
    : '';

  // Combine description and specs for content
  const content = `${printer.description || ''}\n\n${specsFormatted}\n\n${printer.maintenance_tips || ''}`;

  return {
    id: printer.id || '',
    title: `${printer.make} ${printer.model}`,
    content: content.trim(),
    category: 'printer',
    tags: [printer.series, printer.type].filter(Boolean) as string[],
    created_at: printer.created_at || new Date().toISOString(),
    updated_at: printer.updated_at || new Date().toISOString(),
    status: 'published',
    associated_with: printer.model
  };
};

export const mapTonerToArticle = (toner: WikiToner): WikiArticleType => {
  // Create a readable content description from toner properties
  const contentParts = [
    toner.description || `${toner.brand} ${toner.model} ${toner.color} toner cartridge`,
    toner.page_yield ? `Page Yield: Approximately ${toner.page_yield} pages` : '',
    toner.stock ? `Current Stock: ${toner.stock}` : '',
    toner.oem_code ? `OEM Code: ${toner.oem_code}` : ''
  ].filter(Boolean);

  const content = contentParts.join('\n\n');

  return {
    id: toner.id || '',
    title: `${toner.brand} ${toner.model} (${toner.color})`,
    content,
    category: 'toner',
    tags: toner.category || ['toner'],
    created_at: toner.created_at || new Date().toISOString(),
    updated_at: toner.updated_at || new Date().toISOString(),
    status: 'published'
  };
};
