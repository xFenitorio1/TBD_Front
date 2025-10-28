/**
 * Export Utilities for Reports
 * Provides functions to export data in various formats (PDF, Excel, CSV)
 */
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'


// PDF Export Functions
export const generatePDFReport = (data, options = {}) => {
  const defaultOptions = {
    title: 'Reporte de Inventario',
    filename: 'inventory-report.pdf',
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    ...options
  }

  const doc = new jsPDF(
    defaultOptions.orientation,
    defaultOptions.unit,
    defaultOptions.format
  )

  // Agregar título
  doc.setFontSize(18)
  doc.text(defaultOptions.title, 14, 20)

  // Validar si hay productos
  if (data.products && data.products.length > 0) {
    const headers = Object.keys(data.products[0])
    const rows = data.products.map((p) => headers.map((h) => p[h]))

    // 👇 aquí va el uso correcto de autoTable
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 30
    })
  }

  // Descargar PDF
  doc.save(defaultOptions.filename)

  return { success: true, filename: defaultOptions.filename }
}


// Excel Export Functions
export const generateExcelReport = (data, options = {}) => {
  // This function would use SheetJS to generate Excel reports
  // You'll need to install: npm install xlsx
  
  const defaultOptions = {
    filename: 'inventory-report.xlsx',
    sheetName: 'Reporte',
    ...options
  }

  // Example implementation structure:
  // const workbook = XLSX.utils.book_new()
  // const worksheet = XLSX.utils.json_to_sheet(data)
  // XLSX.utils.book_append_sheet(workbook, worksheet, defaultOptions.sheetName)
  // XLSX.writeFile(workbook, defaultOptions.filename)
  
  console.log('Excel generation would happen here with:', { data, options: defaultOptions })
  return { success: true, filename: defaultOptions.filename }
}

// CSV Export Functions
export const generateCSVReport = (data, options = {}) => {
  const defaultOptions = {
    filename: 'inventory-report.csv',
    delimiter: ',',
    ...options
  }

  if (!data || data.length === 0) {
    throw new Error('No data provided for CSV export')
  }

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    headers.join(defaultOptions.delimiter),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle values that need quotes (contain commas, quotes, or newlines)
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(defaultOptions.delimiter)
    )
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', defaultOptions.filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return { success: true, filename: defaultOptions.filename }
}

// Specific Report Generators
export const generateInventoryReport = (inventoryData, options = {}) => {
  const reportData = {
    summary: {
      totalProducts: inventoryData.products?.length || 0,
      totalValue: inventoryData.products?.reduce((sum, p) => sum + (p.price * p.quantity), 0) || 0,
      lowStockCount: inventoryData.lowStockAlerts?.length || 0,
      storeCount: inventoryData.stores?.length || 0
    },
    products: inventoryData.products || [],
    lowStockAlerts: inventoryData.lowStockAlerts || [],
    stores: inventoryData.stores || []
  }

  return {
    pdf: () => generatePDFReport(reportData, { ...options, title: 'Reporte de Inventario' }),
    excel: () => generateExcelReport(reportData, { ...options, filename: 'inventory-report.xlsx' }),
    csv: () => generateCSVReport(reportData.products, { ...options, filename: 'inventory-products.csv' })
  }
}

export const generateSalesReport = (salesData, options = {}) => {
  const reportData = {
    summary: {
      totalSales: salesData.totalSales || 0,
      totalTransactions: salesData.transactions?.length || 0,
      averageOrderValue: salesData.totalSales / (salesData.transactions?.length || 1),
      period: options.period || 'month'
    },
    transactions: salesData.transactions || [],
    categorySales: salesData.categorySales || [],
    storePerformance: salesData.storePerformance || []
  }

  return {
    pdf: () => generatePDFReport(reportData, { ...options, title: 'Reporte de Ventas' }),
    excel: () => generateExcelReport(reportData, { ...options, filename: 'sales-report.xlsx' }),
    csv: () => generateCSVReport(reportData.transactions, { ...options, filename: 'sales-transactions.csv' })
  }
}

// Utility function to format data for export
export const formatDataForExport = (data, type = 'table') => {
  switch (type) {
    case 'table':
      return data.map(item => {
        const formatted = {}
        Object.keys(item).forEach(key => {
          if (item[key] !== null && item[key] !== undefined) {
            formatted[key] = item[key]
          }
        })
        return formatted
      })
    
    case 'summary':
      return {
        generatedAt: new Date().toISOString(),
        totalRecords: data.length,
        data: data
      }
    
    default:
      return data
  }
}

// Helper function to get file extension from filename
export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase()
}

// Helper function to validate export data
export const validateExportData = (data) => {
  if (!data) {
    throw new Error('No data provided for export')
  }
  
  if (Array.isArray(data) && data.length === 0) {
    throw new Error('Data array is empty')
  }
  
  if (typeof data === 'object' && Object.keys(data).length === 0) {
    throw new Error('Data object is empty')
  }
  
  return true
}

