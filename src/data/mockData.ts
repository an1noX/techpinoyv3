
// Mock data for the printer finder component
export const mockPrinters = [
  { 
    id: '1', 
    make: 'HP', 
    model: 'LaserJet Pro MFP M428fdn',
    imageUrl: 'https://placehold.co/200x200/e6f7ff/333?text=HP+LaserJet'
  },
  {
    id: '2',
    make: 'Canon',
    model: 'PIXMA TS8320',
    imageUrl: 'https://placehold.co/200x200/e6f7ff/333?text=Canon+PIXMA'
  },
  {
    id: '3',
    make: 'Brother',
    model: 'MFC-L8900CDW',
    imageUrl: 'https://placehold.co/200x200/e6f7ff/333?text=Brother+MFC'
  },
  {
    id: '4',
    make: 'Epson',
    model: 'WorkForce Pro WF-3820',
    imageUrl: 'https://placehold.co/200x200/e6f7ff/333?text=Epson+WF'
  }
];

// Mock printer makes and series data
export const mockPrinterMakes = [
  { id: '1', name: 'HP' },
  { id: '2', name: 'Canon' },
  { id: '3', name: 'Brother' },
  { id: '4', name: 'Epson' },
  { id: '5', name: 'Samsung' },
  { id: '6', name: 'Xerox' },
  { id: '7', name: 'Lexmark' },
  { id: '8', name: 'Ricoh' },
];

export const mockPrinterSeries = [
  { id: '1', name: 'LaserJet Pro', makeId: '1' },
  { id: '2', name: 'LaserJet Enterprise', makeId: '1' },
  { id: '3', name: 'PIXMA', makeId: '2' },
  { id: '4', name: 'imageCLASS', makeId: '2' },
  { id: '5', name: 'MFC', makeId: '3' },
  { id: '6', name: 'DCP', makeId: '3' },
  { id: '7', name: 'WorkForce', makeId: '4' },
  { id: '8', name: 'EcoTank', makeId: '4' },
];
