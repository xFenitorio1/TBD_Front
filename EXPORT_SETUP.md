# Export Functionality Setup Guide

This guide explains how to set up and use the comprehensive export functionality in your Vue.js inventory management application.

## 🚀 Quick Start

### 1. Install Required Dependencies

```bash
# For PDF export functionality
npm install jspdf jspdf-autotable

# For Excel export functionality  
npm install xlsx

# Optional: For enhanced Excel styling
npm install exceljs
```

### 2. Update package.json

Add these dependencies to your `package.json`:

```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.1",
    "xlsx": "^0.18.5"
  }
}
```

## 📊 Export Features

### Available Export Formats

- **PDF**: Professional reports with tables, charts, and styling
- **Excel**: Spreadsheet format with multiple sheets and formatting
- **CSV**: Simple data export for external analysis

### Export Types

1. **Inventory Reports**: Product lists, stock levels, low stock alerts
2. **Sales Reports**: Transaction data, revenue analysis, performance metrics
3. **Custom Reports**: Any data structure you define

## 🔧 Implementation

### Basic Usage

The export functionality is already integrated into your `ReportsView.vue`. You can:

1. **Export to PDF**: Click the export button → "Exportar a PDF"
2. **Export to Excel**: Click the export button → "Exportar a Excel"  
3. **Export to CSV**: Click the export button → "Exportar a CSV"

### Custom Export Functions

```javascript
import { generateInventoryReport, generateSalesReport } from '../utils/exportUtils'

// Generate inventory report
const inventoryReport = generateInventoryReport(inventoryData, {
  title: 'Custom Report Title',
  filename: 'my-report.pdf'
})

// Export in different formats
inventoryReport.pdf()    // PDF format
inventoryReport.excel()  // Excel format
inventoryReport.csv()    // CSV format
```

## 📝 PDF Export Customization

### Using jsPDF with AutoTable

```javascript
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const generateCustomPDF = (data) => {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(20)
  doc.text('Custom Report Title', 20, 20)
  
  // Add table
  doc.autoTable({
    head: [['Column 1', 'Column 2', 'Column 3']],
    body: data.map(item => [item.col1, item.col2, item.col3]),
    startY: 30,
    styles: {
      fontSize: 10,
      cellPadding: 5
    }
  })
  
  doc.save('custom-report.pdf')
}
```

### Table Styling Options

```javascript
doc.autoTable({
  head: [headers],
  body: data,
  styles: {
    fontSize: 12,
    cellPadding: 8,
    lineColor: [200, 200, 200],
    lineWidth: 0.1
  },
  headStyles: {
    fillColor: [66, 139, 202],
    textColor: 255,
    fontSize: 14,
    fontStyle: 'bold'
  },
  alternateRowStyles: {
    fillColor: [245, 245, 245]
  }
})
```

## 📊 Excel Export Customization

### Using SheetJS (XLSX)

```javascript
import * as XLSX from 'xlsx'

const generateCustomExcel = (data) => {
  const workbook = XLSX.utils.book_new()
  
  // Create worksheet from JSON data
  const worksheet = XLSX.utils.json_to_sheet(data)
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  
  // Save file
  XLSX.writeFile(workbook, 'custom-report.xlsx')
}
```

### Multiple Sheets

```javascript
const workbook = XLSX.utils.book_new()

// Summary sheet
const summaryData = [{ total: 100, count: 50 }]
const summarySheet = XLSX.utils.json_to_sheet(summaryData)
XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

// Details sheet
const detailsSheet = XLSX.utils.json_to_sheet(detailedData)
XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Details')

XLSX.writeFile(workbook, 'multi-sheet-report.xlsx')
```

## 📋 CSV Export Features

### Automatic CSV Generation

The CSV export automatically:
- Handles special characters (commas, quotes, newlines)
- Creates proper headers from object keys
- Downloads files with appropriate MIME types
- Supports custom delimiters

### Custom CSV Options

```javascript
import { generateCSVReport } from '../utils/exportUtils'

generateCSVReport(data, {
  filename: 'custom-report.csv',
  delimiter: ';'  // Use semicolon instead of comma
})
```

## 🎨 Styling and Branding

### Custom Colors and Fonts

```javascript
// PDF styling
doc.setTextColor(66, 139, 202)  // Primary blue
doc.setFont('helvetica', 'bold')

// Excel styling (with ExcelJS)
worksheet.getCell('A1').font = {
  bold: true,
  size: 16,
  color: { argb: 'FF4285F4' }
}
```

### Company Branding

```javascript
const companyInfo = {
  name: 'Your Company Name',
  logo: 'path/to/logo.png',
  colors: {
    primary: [66, 139, 202],
    secondary: [255, 193, 7]
  }
}

// Apply branding to exports
const report = generateInventoryReport(data, {
  title: `${companyInfo.name} - Inventory Report`,
  branding: companyInfo
})
```

## 🚨 Error Handling

### Validation

```javascript
import { validateExportData } from '../utils/exportUtils'

try {
  validateExportData(data)
  // Proceed with export
} catch (error) {
  console.error('Export validation failed:', error.message)
  // Handle error (show user message, etc.)
}
```

### Progress Tracking

The export functions include progress tracking:

```javascript
const exportProgress = ref({
  show: true,
  type: 'info',
  title: 'Generating Report',
  message: 'Processing data...',
  percentage: 0
})

// Update progress
updateExportProgress(50, 'Halfway done...')
```

## 🔍 Troubleshooting

### Common Issues

1. **PDF not generating**: Check if jsPDF is properly imported
2. **Excel file corrupted**: Verify XLSX library version compatibility
3. **CSV encoding issues**: Ensure proper UTF-8 handling

### Debug Mode

```javascript
// Enable debug logging
const DEBUG_MODE = true

if (DEBUG_MODE) {
  console.log('Export data:', data)
  console.log('Export options:', options)
}
```

## 📚 Additional Resources

- [jsPDF Documentation](https://artskydj.github.io/jsPDF/docs/)
- [jsPDF AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- [SheetJS Documentation](https://docs.sheetjs.com/)
- [ExcelJS Documentation](https://github.com/exceljs/exceljs)

## 🎯 Next Steps

1. Install the required dependencies
2. Test the export functionality with sample data
3. Customize the export templates for your specific needs
4. Add company branding and styling
5. Implement additional export formats if needed

---

**Note**: The current implementation includes simulation of export processes. Replace the simulation code with actual export function calls once dependencies are installed.

