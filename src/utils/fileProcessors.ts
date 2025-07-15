/**
 * BlueMind File Processing Utilities
 * Robust CSV and Excel file processing with validation
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { BillingRecord } from '../types/billing.types';
import { PayrollRecord } from '../types/payroll.types';
import { parseFlexibleDate, isValidBillingDate, isValidPayrollDate } from '../constants/dateRanges';

interface PayrollRawRecord {
  'Pay Frequency': string;
  'Department': string;
  'Check Date': string;
  'Name': string;
  'Hours': string | number;
  'Total Paid': string | number;
  'Tax Withheld': string | number;
  'Deductions': string | number;
  'Net Pay': string | number;
  'Payment Details/Check No': string;
  'Employer Liability': string | number;
  'Total Expenses': string | number;
}

interface PayrollProcessingResult {
  records: PayrollRecord[];
  totalCost: number;
  totalHours: number;
  uniqueEmployees: number;
  errors: string[];
}

interface BillingProcessingResult {
  records: BillingRecord[];
  totalRevenue: number;
  totalBillableHours: number;
  uniqueEmployees: number;
  errors: string[];
}

/**
 * Enhanced file processor with proper Excel handling as specified
 */
export class FileProcessor {
  /**
   * Process CSV billing data
   */
  async processBillingCsv(filePath: string): Promise<BillingProcessingResult> {
    const csvContent = await this.loadCsvFile(filePath);
    const validRecords: BillingRecord[] = [];
    const errors: string[] = [];
    let totalRevenue = 0;
    let totalBillableHours = 0;
    const uniqueEmployees = new Set<string>();

    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        complete: (results) => {
          try {
            results.data.forEach((row: any, index) => {
              try {
                const billingRecord = this.validateBillingRecord(row, index + 2);
                
                if (billingRecord) {
                                     // Filter by Q2 billing date range (March 31 - June 28, 2025)
                   const sessionDate = parseFlexibleDate(billingRecord['Session Date']);
                   if (sessionDate && isValidBillingDate(sessionDate)) {
                     validRecords.push(billingRecord);
                     totalRevenue += billingRecord.Price || 0;
                     totalBillableHours += billingRecord.Hours || 0;
                     uniqueEmployees.add(billingRecord['Tech Name']);
                  } else if (sessionDate) {
                    // Log dates outside range for debugging
                    const dateStr = sessionDate.toLocaleDateString();
                    if (index < 10) { // Only log first 10 to avoid spam
                      // eslint-disable-next-line no-console
                      console.log(`Billing record ${index + 2} outside date range: ${dateStr} (${billingRecord['Session Date']})`);
                    }
                  }
                }
              } catch (error) {
                errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            });

            console.log('✅ Billing Data Summary:');
            console.log('• Total records processed:', validRecords.length);
            console.log('• Total revenue:', totalRevenue);
            console.log('• Total billable hours:', totalBillableHours);
            console.log('• Unique employees:', uniqueEmployees.size);

            resolve({
              records: validRecords,
              totalRevenue,
              totalBillableHours,
              uniqueEmployees: uniqueEmployees.size,
              errors
            });
                     } catch (error: any) {
             reject(error);
           }
         },
         error: (error: any) => {
           reject(new Error(`CSV parsing failed: ${error.message}`));
         }
      });
    });
  }

  /**
   * Process Excel payroll data with exact specifications
   */
  async processPayrollExcel(filePath: string): Promise<PayrollProcessingResult> {
    try {
      console.log('📊 Starting Excel payroll processing...');
      
      // Step 1: Load Excel file
      const excelBuffer = await this.loadExcelFile(filePath);
      
             // Step 2: Parse with proper SheetJS options
       const workbook = XLSX.read(excelBuffer, {
         cellStyles: true,
         cellFormula: true,
         cellDates: true,
         cellNF: true,
         sheetStubs: true,
         raw: false // Important: Don't use raw mode to get formatted values
       });

      console.log('📋 Available sheets:', workbook.SheetNames);
      
      // Step 3: Get the payroll sheet
      const sheetName = workbook.SheetNames[0]; // Should be "Payroll Summary"
      const worksheet = workbook.Sheets[sheetName];
      
      // Debug the sheet structure
      this.debugExcelReading(worksheet);
      
      // Step 4: CRITICAL - Use headers from row 7, data from row 8+
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        range: 'A7:L1000', // Headers at A7, data from A8 onwards
        defval: '', // Default value for empty cells
        blankrows: false // Skip blank rows
      }) as PayrollRawRecord[];

      console.log('📊 Raw data sample:', jsonData.slice(0, 3));
      console.log('📊 Total raw records:', jsonData.length);

      // Step 5: Clean and validate the data
      const cleanedData: PayrollRecord[] = jsonData
        .filter(row => {
          // Filter out rows where Name is empty or invalid
          return row.Name && 
                 typeof row.Name === 'string' && 
                 row.Name.trim() !== '' &&
                 !String(row.Name).toLowerCase().includes('total') && // Skip summary rows
                 !String(row.Name).toLowerCase().includes('grand total');
        })
        .map(row => {
          try {
            const cleanCheckDate = String(row['Check Date'] || '').trim().replace(/\s+/g, ' ');
            
            return {
              'Pay Frequency': String(row['Pay Frequency'] || '').trim(),
              'Department': String(row['Department'] || '').trim(),
              'Check Date': cleanCheckDate,
              'Name': String(row['Name'] || '').trim(),
              'Hours': this.parseNumber(row['Hours']),
              'Total Paid': this.parseNumber(row['Total Paid']),
              'Tax Withheld': this.parseNumber(row['Tax Withheld']),
              'Deductions': this.parseNumber(row['Deductions']),
              'Net Pay': this.parseNumber(row['Net Pay']),
              'Payment Details/Check No': String(row['Payment Details/Check No'] || '').trim(),
              'Employer Liability': this.parseNumber(row['Employer Liability']),
              'Total Expenses': this.parseNumber(row['Total Expenses'])
            };
          } catch (error) {
            console.error('❌ Error parsing row:', row, error);
            throw new Error(`Failed to parse payroll row: ${JSON.stringify(row)}`);
          }
        });

      console.log('✅ Cleaned payroll data:', cleanedData.length, 'records');
      console.log('👤 Sample employee:', cleanedData[0]);

      // Step 6: Filter by Q2 date range and calculate totals
      const validRecords: PayrollRecord[] = [];
      const errors: string[] = [];
      let totalPayrollCost = 0;
      let totalPayrollHours = 0;
      const uniqueEmployees = new Set<string>();

      cleanedData.forEach((payrollRecord, index) => {
        try {
          // Filter by Q2 payroll date range (April 18 - July 11, 2025)
          const checkDate = parseFlexibleDate(payrollRecord['Check Date']);
          if (checkDate && isValidPayrollDate(checkDate)) {
            validRecords.push(payrollRecord);
            totalPayrollCost += payrollRecord['Total Expenses'] || 0;
            totalPayrollHours += payrollRecord.Hours || 0;
            uniqueEmployees.add(payrollRecord.Name);
          } else if (checkDate) {
            // Log dates outside range for debugging
            const dateStr = checkDate.toLocaleDateString();
            if (index < 10) { // Only log first 10 to avoid spam
              console.log(`Payroll record outside date range: ${dateStr} (${payrollRecord['Check Date']})`);
            }
          }
        } catch (error) {
          errors.push(`Payroll record ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      // Step 7: Validate expected results
      this.validateExpectedResults(validRecords);

      console.log('📈 Final Payroll Summary:');
      console.log('• Q2 Records (4/18-7/11):', validRecords.length);
      console.log('• Total Q2 Cost: $', totalPayrollCost.toLocaleString());
      console.log('• Total Q2 Hours:', totalPayrollHours.toLocaleString());
      console.log('• Q2 Unique Employees:', uniqueEmployees.size);

      return {
        records: validRecords,
        totalCost: totalPayrollCost,
        totalHours: totalPayrollHours,
        uniqueEmployees: uniqueEmployees.size,
        errors
      };

    } catch (error) {
      console.error('❌ Failed to read Excel file:', error);
      throw new Error(`Excel file processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load CSV file using Papa Parse
   */
  private async loadCsvFile(filePath: string): Promise<string> {
    try {
      // Ensure proper URL format for Vercel deployment
      const fullUrl = filePath.startsWith('http') ? filePath : `${window.location.origin}${filePath}`;
      console.log('🔗 Fetching CSV from:', fullUrl);
      
      const response = await fetch(fullUrl);
      console.log('📊 CSV response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const text = await response.text();
      console.log('📝 CSV content length:', text.length, 'characters');
      
      if (text.length === 0) {
        throw new Error('CSV file is empty');
      }
      
      return text;
    } catch (error) {
      console.error('❌ CSV loading failed:', error);
      throw new Error(`Could not load CSV file: ${filePath}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load Excel file using SheetJS
   */
  private async loadExcelFile(filePath: string): Promise<ArrayBuffer> {
    try {
      // Ensure proper URL format for Vercel deployment
      const fullUrl = filePath.startsWith('http') ? filePath : `${window.location.origin}${filePath}`;
      console.log('🔗 Fetching Excel from:', fullUrl);
      
      const response = await fetch(fullUrl);
      console.log('📊 Excel response status:', response.status, response.statusText);
      console.log('📊 Excel response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      console.log('📊 Excel content-type:', contentType);
      
      if (contentType && contentType.includes('text/html')) {
        const htmlContent = await response.text();
        console.error('❌ Got HTML instead of Excel file:', htmlContent.substring(0, 500));
        throw new Error('Received HTML page instead of Excel file - file not found on server');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('📝 Excel file size:', arrayBuffer.byteLength, 'bytes');
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error('Excel file is empty');
      }
      
      return arrayBuffer;
    } catch (error) {
      console.error('❌ Excel loading failed:', error);
      throw new Error(`Could not load Excel file: ${filePath}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate and convert CSV row to BillingRecord
   */
  private validateBillingRecord(row: Record<string, string>, rowNumber: number): BillingRecord | null {
    try {
      // Required fields validation
      const requiredFields = ['Tech Name', 'Session Date', 'Hours', 'Price'];
      for (const field of requiredFields) {
        if (!row[field] || row[field].trim() === '') {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Type conversions with validation
      const hours = this.parseNumber(row.Hours);
      const price = this.parseNumber(row.Price);
      const rate = this.parseNumber(row.Rate);
      const batch = this.parseNumber(row.Batch);
      const code = this.parseNumber(row.Code);
      const units = this.parseNumber(row.Units);
      const conflictTech = this.parseNumber(row['Conflict Tech']);

      // Date validation
      const sessionDate = parseFlexibleDate(row['Session Date']);
      if (!sessionDate) {
        throw new Error(`Invalid session date: ${row['Session Date']}`);
      }

      return {
        County: row.County || '',
        Batch: batch,
        Location: row.Location || '',
        'Client Name': row['Client Name'] || '',
        'Tech Name': row['Tech Name'],
        'Edu ': row['Edu '] || '',
        Rate: rate,
        'Session Date': row['Session Date'],
        Code: code,
        'Start Time': row['Start Time'] || '',
        'End Time': row['End Time'] || '',
        Duration: row.Duration || '',
        Hours: hours,
        Units: units,
        Price: price,
        'Insurance Type': row['Insurance Type'] || '',
        Comment: row.Comment || '',
        Note: row.Note || '',
        'Conflict Client': row['Conflict Client'] || '',
        'Conflict Tech': conflictTech,
      };
    } catch (error) {
      throw new Error(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Validation failed'}`);
    }
  }



  /**
   * Parse number values from Excel (handles strings with $ and commas)
   */
  private parseNumber(value: string | number | undefined | null): number {
    if (value === undefined || value === null || value === '') {
      return 0;
    }
    
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    
    // Handle string values
    const stringValue = String(value).trim();
    if (stringValue === '') return 0;
    
    // Remove common formatting (commas, dollar signs, spaces)
    const cleanedValue = stringValue.replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleanedValue);
    
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Debug Excel sheet structure
   */
  private debugExcelReading(worksheet: XLSX.WorkSheet): void {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    console.log('📊 Sheet range:', worksheet['!ref']);
    
    // Show first 10 rows raw
    console.log('📋 First 10 rows:');
    for (let row = 0; row <= Math.min(10, range.e.r); row++) {
      const rowData: any[] = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellRef];
        rowData.push(cell ? cell.v : '');
      }
      console.log(`Row ${row}:`, rowData.filter(cell => cell !== '').join(' | '));
    }
    
    // Show headers specifically (row 6)
    console.log('📋 Headers (Row 6):');
    const headerRow: any[] = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 6, c: col });
      const cell = worksheet[cellRef];
      headerRow.push(cell ? cell.v : '');
    }
    console.log('Headers:', headerRow);
  }

  /**
   * Validate against expected Q2 2025 results
   */
  private validateExpectedResults(data: PayrollRecord[]): void {
    const totalExpenses = data.reduce((sum, r) => sum + (r['Total Expenses'] || 0), 0);
    const totalHours = data.reduce((sum, r) => sum + (r.Hours || 0), 0);
    const uniqueEmployees = new Set(data.map(r => r.Name)).size;
    
    console.log('🔍 Validation Results:');
    console.log('• Total Expenses:', totalExpenses.toLocaleString(), '(expected: ~417,646)');
    console.log('• Total Hours:', totalHours.toLocaleString(), '(expected: ~12,167)');
    console.log('• Unique Employees:', uniqueEmployees, '(expected: ~47)');
    
    // Find Malak's data
    const malakData = data.filter(r => r.Name === 'Seifeddine, Malak');
    const malakHours = malakData.reduce((sum, r) => sum + (r.Hours || 0), 0);
    const malakCost = malakData.reduce((sum, r) => sum + (r['Total Expenses'] || 0), 0);
    
    console.log('• Malak Hours:', malakHours.toLocaleString(), '(expected: ~472)');
    console.log('• Malak Cost: $', malakCost.toLocaleString(), '(expected: ~18,147)');

    // Warnings for unexpected values
    if (totalExpenses < 200000) {
      console.warn('⚠️ Warning: Total expenses seems low:', totalExpenses);
    }
    if (totalHours < 5000) {
      console.warn('⚠️ Warning: Total hours seems low:', totalHours);
    }
    if (uniqueEmployees < 30) {
      console.warn('⚠️ Warning: Employee count seems low:', uniqueEmployees);
    }
  }
}

// Export singleton instance
export const fileProcessor = new FileProcessor(); 