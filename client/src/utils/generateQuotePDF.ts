import jsPDF from 'jspdf';

interface QuoteData {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  city?: string;
  systemSize?: number;
  panelQuantity?: number;
  inverterSize?: number;
  batteryCapacity?: number;
  totalCost?: number;
  totalLoad?: number;
  result?: any;
  loadBreakdown?: any[];
}

export function generateQuotePDF(data: QuoteData, openInNewWindow: boolean = false) {
  const doc = new jsPDF();
  const { result = {}, totalLoad = 0, customerName, customerEmail, customerPhone, customerAddress, city, systemSize = 0, panelQuantity = 0, inverterSize = 0, batteryCapacity = 0, totalCost = 0, loadBreakdown = [] } = data;
  
  // Colors
  const primaryColor: [number, number, number] = [37, 99, 235]; // Blue
  const secondaryColor: [number, number, number] = [34, 197, 94]; // Green
  const textColor: [number, number, number] = [31, 41, 55]; // Dark gray
  const lightGray: [number, number, number] = [156, 163, 175];
  
  // Fonts
  doc.setFont('helvetica');
  
  // Header with gradient-like effect
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ElectroCare', 20, 20);
  
  // Tagline
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Powering Your Future with Solar Energy', 20, 28);
  
  // Quote Title
  doc.setTextColor(...textColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Solar System Quotation', 20, 55);
  
  // Date and Customer Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 65);
  if (customerName) {
    doc.text(`Customer: ${customerName}`, 20, 71);
  }
  if (customerEmail) {
    doc.text(`Email: ${customerEmail}`, 20, 77);
  }
  if (customerPhone) {
    doc.text(`Phone: ${customerPhone}`, 20, 83);
  }
  if (customerAddress) {
    doc.text(`Address: ${customerAddress}, ${city || ''}`, 20, 89);
  }
  
  // Load Requirements Section
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, 95, 190, 95);
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Load Requirements', 20, 105);
  
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Ensure totalLoad is a valid number
  const validTotalLoad = typeof totalLoad === 'number' && !isNaN(totalLoad) ? totalLoad : 0;
  const totalLoadKW = validTotalLoad / 1000;
  
  doc.text(`Total Connected Load: ${totalLoadKW.toFixed(2)} kW (${validTotalLoad} Watts)`, 25, 115);
  
  // Calculate daily energy consumption
  const dailyEnergy = result.dailyGeneration || result.dailyConsumption || (totalLoadKW * 5);
  doc.text(`Daily Energy Consumption: ${dailyEnergy.toFixed(1)} kWh`, 25, 122);
  
  // System Specifications Section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommended System Specifications', 20, 140);
  
  // Create a table-like structure
  const specs = [
    ['System Capacity', `${systemSize || result.systemSize || 0} kW`],
    ['Solar Panels (550W each)', `${panelQuantity || result.panelsRequired || 0} panels`],
    ['Total Panel Capacity', `${((panelQuantity || result.panelsRequired || 0) * 550 / 1000).toFixed(2)} kW`],
    ['Inverter Size', `${inverterSize || result.inverterSize || 0} kW`],
    ['Battery Capacity', `${batteryCapacity || result.batteryCapacity || 0} kWh`]
  ];
  
  let yPos = 150;
  doc.setFontSize(10);
  
  specs.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(label, 25, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 120, yPos);
    yPos += 7;
  });
  
  // Cost Breakdown Section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Cost Breakdown', 20, yPos + 10);
  
  yPos += 20;
  const estimatedCostValue = totalCost || result.estimatedCost || 0;
  const costs = [
    ['System Cost', `Rs. ${estimatedCostValue.toLocaleString()}`],
    ['Installation Charges (15%)', `Rs. ${Math.round(estimatedCostValue * 0.15).toLocaleString()}`],
    ['', ''],
    ['Total Investment', `Rs. ${Math.round(estimatedCostValue * 1.15).toLocaleString()}`]
  ];
  
  doc.setFontSize(10);
  costs.forEach(([label, value], index) => {
    if (index === 2) {
      // Draw a line for subtotal
      doc.setDrawColor(...textColor);
      doc.setLineWidth(0.3);
      doc.line(25, yPos - 2, 160, yPos - 2);
    } else if (label) {
      doc.setFont('helvetica', index === 3 ? 'bold' : 'normal');
      doc.setTextColor(...textColor);
      doc.text(label, 25, yPos);
      doc.setFont('helvetica', 'bold');
      if (index === 3) {
        doc.setTextColor(...primaryColor);
      }
      doc.text(value, 120, yPos);
    }
    yPos += 7;
  });
  
  // Environmental Impact Section - Check for page break
  if (yPos > 200) {
    doc.addPage();
    yPos = 30;
  } else {
    yPos += 10;
  }
  
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Environmental Impact', 20, yPos);
  
  yPos += 10;
  const sysSize = systemSize || result.systemSize || result.recommendedCapacity || 0;
  const environmental = [
    ['Annual CO₂ Reduction', `${(sysSize * 1.2).toFixed(1)} tons`],
    ['Equivalent Trees Planted', `${Math.round(sysSize * 30)} trees`],
    ['25-Year CO₂ Savings', `${(sysSize * 30).toFixed(0)} tons`]
  ];
  
  doc.setFontSize(10);
  environmental.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(label, 25, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text(value, 120, yPos);
    yPos += 7;
  });
  
  // ROI Analysis - Check if we need a new page
  if (yPos > 220) {
    doc.addPage();
    yPos = 30;
  } else {
    yPos += 10;
  }
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Return on Investment', 20, yPos);
  
  yPos += 10;
  const roi = [
    ['Estimated Monthly Savings', `Rs. ${Math.round(estimatedCostValue * 0.02).toLocaleString()}`],
    ['Estimated Annual Savings', `Rs. ${Math.round(estimatedCostValue * 0.24).toLocaleString()}`],
    ['Payback Period', `${result.paybackPeriod || '~4-5'} Years`],
    ['25-Year Total Savings', `Rs. ${(result.savings25Years || Math.round(estimatedCostValue * 6)).toLocaleString()}`],
    ['ROI Percentage', `${result.roiPercentage || 520}%`]
  ];
  
  doc.setFontSize(10);
  roi.forEach(([label, value], index) => {
    // Check if we need a new page before each line
    if (yPos > 270) {
      doc.addPage();
      yPos = 30;
    }
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(label, 25, yPos);
    doc.setFont('helvetica', 'bold');
    if (index === 3 || index === 4) {
      doc.setTextColor(...secondaryColor);
    } else {
      doc.setTextColor(...textColor);
    }
    doc.text(value, 120, yPos);
    yPos += 7;
  });
  
  // Package Includes Section
  if (yPos > 200) {
    doc.addPage();
    yPos = 30;
  } else {
    yPos += 15;
  }
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Package Includes', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  const includes = [
    '• Tier-1 Solar Panels (550W each) with 25-year warranty',
    '• MPPT Solar Inverter with 5-year warranty',
    '• Lithium/Tubular Batteries with warranty',
    '• Complete mounting structure and DC/AC cables',
    '• Professional installation and commissioning',
    '• Net metering application assistance',
    '• Annual maintenance for 5 years',
    '• 24/7 customer support'
  ];
  
  includes.forEach(item => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 30;
    }
    doc.text(item, 25, yPos);
    yPos += 7;
  });
  
  // Terms and Conditions - Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 30;
  } else {
    yPos += 10;
  }
  
  doc.setTextColor(...lightGray);
  doc.setFontSize(8);
  doc.text('Terms & Conditions:', 20, yPos);
  yPos += 5;
  doc.text('1. This quotation is valid for 30 days from the date of issue.', 20, yPos);
  yPos += 4;
  doc.text('2. Prices are subject to change based on market conditions.', 20, yPos);
  yPos += 4;
  doc.text('3. Installation timeline: 7-10 working days after confirmation.', 20, yPos);
  yPos += 4;
  doc.text('4. Payment terms: 50% advance, 50% on completion.', 20, yPos);
  
  // Footer - Add to each page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...primaryColor);
    doc.rect(0, 280, 210, 17, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('ElectroCare | Email: info@greentechpk.com | Phone: +92-300-1234567', 105, 288, { align: 'center' });
    doc.text('www.greentechpk.com', 105, 293, { align: 'center' });
  }
  
  // Either save or open in new window for printing
  if (openInNewWindow) {
    // Generate PDF as blob and open in new window for printing
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl, '_blank');
    
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
  } else {
    // Save the PDF normally
    const fileName = `SolarQuote_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
}