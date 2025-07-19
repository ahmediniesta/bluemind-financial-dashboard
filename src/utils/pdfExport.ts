/**
 * PDF Export Utility
 * Exports DOM elements to PDF while preserving styling and current state
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PDFExportOptions {
  filename?: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
  quality?: number;
  scale?: number;
  useCORS?: boolean;
}

/**
 * Export a DOM element to PDF
 * Captures the current state including sorting, filtering, etc.
 */
export const exportToPDF = async (
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> => {
  const {
    filename = 'export.pdf',
    title,
    orientation = 'landscape', // Landscape for better dashboard fit
    quality = 0.95,
    scale = 2, // Higher scale for better quality
    useCORS = true,
  } = options;

  try {
    // Show loading state
    const originalCursor = document.body.style.cursor;
    document.body.style.cursor = 'wait';

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale,
      useCORS,
      allowTaint: false,
      backgroundColor: '#ffffff',
      removeContainer: true,
      imageTimeout: 15000,
      height: element.scrollHeight,
      width: element.scrollWidth,
      scrollX: 0,
      scrollY: 0,
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png', quality);
    
    // Calculate PDF dimensions - use A3 for Employee Analysis for better readability
    const isEmployeeAnalysis = element.getAttribute('data-tab') === 'employee-analysis';
    const format = isEmployeeAnalysis ? 'a3' : 'a4';
    
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate image dimensions to fit on one page
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
    
    const finalWidth = imgWidth * ratio;
    const finalHeight = imgHeight * ratio;
    
    // Center the image on the page
    const x = (pageWidth - finalWidth) / 2;
    const y = (pageHeight - finalHeight) / 2;

    // Add title if provided
    if (title) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, pageWidth / 2, 15, { align: 'center' });
      
      // Add timestamp
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const timestamp = new Date().toLocaleString();
      pdf.text(`Generated on: ${timestamp}`, pageWidth / 2, 25, { align: 'center' });
    }

    // Add the image to PDF
    pdf.addImage(imgData, 'PNG', x, title ? y + 10 : y, finalWidth, finalHeight);
    
    // Add footer
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text('BlueMind Financial Dashboard', 10, pageHeight - 5);
    
    // Save the PDF
    pdf.save(filename);

    // Restore cursor
    document.body.style.cursor = originalCursor;
    
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    
    // Restore cursor on error
    document.body.style.cursor = 'default';
    
    // Show user-friendly error
    alert('Failed to export PDF. Please try again.');
    throw error;
  }
};

/**
 * Export Financial Overview tab to PDF
 */
export const exportFinancialOverviewToPDF = async (): Promise<void> => {
  const element = document.querySelector('[data-tab="financial-overview"]') as HTMLElement;
  if (!element) {
    throw new Error('Financial Overview tab not found');
  }

  // Prepare element for better PDF rendering
  const cleanup = prepareFinancialOverviewForPDF(element);

  try {
    const filename = `BlueMind_Financial_Overview_${new Date().toISOString().split('T')[0]}.pdf`;
    
    await exportToPDF(element, {
      filename,
      title: 'BlueMind Financial Overview - Q2 2025',
      orientation: 'landscape',
    });
  } finally {
    // Restore original styles
    cleanup();
  }
};

/**
 * Export Employee Analysis tab to PDF
 */
export const exportEmployeeAnalysisToPDF = async (): Promise<void> => {
  const element = document.querySelector('[data-tab="employee-analysis"]') as HTMLElement;
  if (!element) {
    throw new Error('Employee Analysis tab not found');
  }

  // Prepare element for better PDF rendering
  const cleanup = prepareEmployeeAnalysisForPDF(element);

  try {
    const filename = `BlueMind_Employee_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
    
    await exportToPDF(element, {
      filename,
      title: 'BlueMind Employee Analysis - Q2 2025',
      orientation: 'landscape',
      scale: 1.5, // Higher scale for better table readability
    });
  } finally {
    // Restore original styles
    cleanup();
  }
};

/**
 * Prepare element for PDF export by temporarily adjusting styles
 */
export const prepareElementForPDF = (element: HTMLElement): () => void => {
  const originalStyles = {
    overflow: element.style.overflow,
    height: element.style.height,
    maxHeight: element.style.maxHeight,
  };

  // Temporarily adjust styles for better PDF capture
  element.style.overflow = 'visible';
  element.style.height = 'auto';
  element.style.maxHeight = 'none';

  // Return cleanup function
  return () => {
    element.style.overflow = originalStyles.overflow;
    element.style.height = originalStyles.height;
    element.style.maxHeight = originalStyles.maxHeight;
  };
};

/**
 * Specifically prepare Employee Analysis for PDF export
 */
export const prepareEmployeeAnalysisForPDF = (element: HTMLElement): () => void => {
  // Add PDF export attribute to trigger CSS styles
  const originalPdfAttribute = element.getAttribute('data-pdf-export');
  element.setAttribute('data-pdf-export', 'true');

  const modifiedElements: Array<{ element: HTMLElement; property: string; originalValue: string }> = [];

  // The CSS handles most styling now, but we still need some JS-based fixes
  
  // Ensure main container has proper styling
  modifiedElements.push({
    element,
    property: 'overflow',
    originalValue: element.style.overflow,
  });
  element.style.overflow = 'visible';

  // Return cleanup function
  return () => {
    // Restore PDF export attribute
    if (originalPdfAttribute) {
      element.setAttribute('data-pdf-export', originalPdfAttribute);
    } else {
      element.removeAttribute('data-pdf-export');
    }

    // Restore other styles
    modifiedElements.forEach(({ element, property, originalValue }) => {
      if (originalValue) {
        (element.style as any)[property] = originalValue;
      } else {
        (element.style as any)[property] = '';
      }
    });
  };
};

/**
 * Specifically prepare Financial Overview for PDF export
 */
export const prepareFinancialOverviewForPDF = (element: HTMLElement): () => void => {
  // Add PDF export attribute to trigger CSS styles
  const originalPdfAttribute = element.getAttribute('data-pdf-export');
  element.setAttribute('data-pdf-export', 'true');

  // Return cleanup function
  return () => {
    // Restore PDF export attribute
    if (originalPdfAttribute) {
      element.setAttribute('data-pdf-export', originalPdfAttribute);
    } else {
      element.removeAttribute('data-pdf-export');
    }
  };
};