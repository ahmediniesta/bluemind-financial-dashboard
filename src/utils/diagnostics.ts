/**
 * Diagnostic utilities to help debug the payroll calculation discrepancy
 */

// Add this to your browser console to debug
export function debugPayrollCalculation() {
  console.log('🔍 DIAGNOSTIC: Starting payroll calculation debug...');
  
  // Check if parseAccountingNumber is working
  const testValues = [
    '1000.00',
    '(1,683.94)',
    '(6.60)',
    '50000.00',
    '(100.00)'
  ];
  
  console.log('🔍 Testing parseAccountingNumber function:');
  testValues.forEach(value => {
    // This should match the FileProcessor's parseAccountingNumber
    const result = parseAccountingNumber(value);
    console.log(`   ${value} -> ${result}`);
  });
  
  function parseAccountingNumber(value: any): number {
    if (!value || value === '') return 0;
    
    const str = String(value).trim();
    
    if (str.startsWith('(') && str.endsWith(')')) {
      const numberStr = str.slice(1, -1).replace(/,/g, '');
      const result = -parseFloat(numberStr) || 0;
      console.log(`🔍 parseAccountingNumber: "${value}" -> ${result} (parentheses detected)`);
      return result;
    }
    
    if (str.startsWith('-')) {
      const numberStr = str.slice(1).replace(/,/g, '');
      const result = -parseFloat(numberStr) || 0;
      console.log(`🔍 parseAccountingNumber: "${value}" -> ${result} (negative sign)`);
      return result;
    }
    
    const numberStr = str.replace(/,/g, '');
    const result = parseFloat(numberStr) || 0;
    if (result > 10000) {
      console.log(`🔍 parseAccountingNumber: "${value}" -> ${result} (positive)`);
    }
    return result;
  }
  
  console.log('🔍 Expected Results:');
  console.log('   - Revenue: $773,034.41');
  console.log('   - Payroll: $456,070.37');
  console.log('   - Current showing: $478,241.12');
  console.log('   - Difference: $', (478241.12 - 456070.37).toFixed(2));
  
  return {
    expectedRevenue: 773034.41,
    expectedPayroll: 456070.37,
    currentPayroll: 478241.12,
    difference: 478241.12 - 456070.37
  };
}

// Instructions for manual testing
console.log(`
🔍 MANUAL TESTING INSTRUCTIONS:
1. Open browser console (F12)
2. Paste this code:
   
   window.debugPayrollCalculation = function() {
     console.log('🔍 DIAGNOSTIC: Starting payroll calculation debug...');
     
     function parseAccountingNumber(value) {
       if (!value || value === '') return 0;
       const str = String(value).trim();
       if (str.startsWith('(') && str.endsWith(')')) {
         const numberStr = str.slice(1, -1).replace(/,/g, '');
         const result = -parseFloat(numberStr) || 0;
         console.log('🔍 parseAccountingNumber: "' + value + '" -> ' + result + ' (parentheses detected)');
         return result;
       }
       if (str.startsWith('-')) {
         const numberStr = str.slice(1).replace(/,/g, '');
         const result = -parseFloat(numberStr) || 0;
         console.log('🔍 parseAccountingNumber: "' + value + '" -> ' + result + ' (negative sign)');
         return result;
       }
       const numberStr = str.replace(/,/g, '');
       const result = parseFloat(numberStr) || 0;
       if (result > 10000) {
         console.log('🔍 parseAccountingNumber: "' + value + '" -> ' + result + ' (positive)');
       }
       return result;
     }
     
     const testValues = ['1000.00', '(1,683.94)', '(6.60)', '50000.00', '(100.00)'];
     console.log('🔍 Testing parseAccountingNumber function:');
     testValues.forEach(value => {
       const result = parseAccountingNumber(value);
       console.log('   ' + value + ' -> ' + result);
     });
     
     console.log('🔍 Expected vs Current:');
     console.log('   - Expected Revenue: $773,034.41');
     console.log('   - Expected Payroll: $456,070.37');
     console.log('   - Current Payroll: $478,241.12');
     console.log('   - Difference: $' + (478241.12 - 456070.37).toFixed(2));
   };

3. Run: debugPayrollCalculation()
4. Check for parseAccountingNumber debug messages in the console
5. Look for any errors or unexpected values
`);