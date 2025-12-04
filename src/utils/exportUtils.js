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
  const defaultOptions = {
    filename: 'inventory-report.xlsx',
    sheetName: 'Reporte',
    ...options
  }

  const workbook = XLSX.utils.book_new()

  // If data is an object with multiple sheets
  if (typeof data === 'object' && !Array.isArray(data)) {
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(data[key])
        XLSX.utils.book_append_sheet(workbook, worksheet, key.substring(0, 31))
      } else if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
        // Convert object to array of key-value pairs
        const objArray = Object.keys(data[key]).map(k => ({
          Campo: k,
          Valor: data[key][k]
        }))
        const worksheet = XLSX.utils.json_to_sheet(objArray)
        XLSX.utils.book_append_sheet(workbook, worksheet, key.substring(0, 31))
      }
    })
  } else if (Array.isArray(data)) {
    // Single sheet from array
    const worksheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, defaultOptions.sheetName)
  }

  XLSX.writeFile(workbook, defaultOptions.filename)
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

// Comprehensive Reports Export Function
export const generateComprehensiveReport = (reportData, options = {}) => {
  const defaultOptions = {
    title: 'Reporte Completo de Análisis',
    filename: 'reporte-completo',
    ...options
  }

  const formattedData = {
    'Resumen': [
      { Métrica: 'Ventas Totales', Valor: reportData.summary?.totalSales || 0 },
      { Métrica: 'Total de Productos', Valor: reportData.summary?.totalProducts || 0 },
      { Métrica: 'Productos con Stock Bajo', Valor: reportData.summary?.lowStockCount || 0 },
      { Métrica: 'Tiendas Activas', Valor: reportData.summary?.storeCount || 0 }
    ],
    'Ventas Mensuales': reportData.monthlySales || [],
    'Mejor Proveedor': reportData.bestSupplier ? [reportData.bestSupplier] : [],
    'Valor Inventario': reportData.inventoryValue || [],
    'Promedio Días Inventario': reportData.avgInventory || []
  }

  return {
    pdf: () => {
      const doc = new jsPDF('portrait', 'mm', 'a4')
      let yPosition = 20

      // Title
      doc.setFontSize(18)
      doc.setFont(undefined, 'bold')
      doc.text(defaultOptions.title, 14, yPosition)
      yPosition += 10

      // Date
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 14, yPosition)
      yPosition += 10

      // Summary Section
      if (formattedData.Resumen.length > 0) {
        doc.setFontSize(14)
        doc.setFont(undefined, 'bold')
        doc.text('Resumen General', 14, yPosition)
        yPosition += 7

        autoTable(doc, {
          startY: yPosition,
          head: [['Métrica', 'Valor']],
          body: formattedData.Resumen.map(item => [item.Métrica, item.Valor]),
          theme: 'grid',
          headStyles: { fillColor: [24, 103, 192] }
        })
        yPosition = doc.lastAutoTable.finalY + 10
      }

      // Monthly Sales Section
      if (formattedData['Ventas Mensuales'].length > 0) {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(14)
        doc.setFont(undefined, 'bold')
        doc.text('Tendencias de Ventas Mensuales', 14, yPosition)
        yPosition += 7

        autoTable(doc, {
          startY: yPosition,
          head: [['Mes', 'Año', 'Ventas Promedio Diarias', 'Diferencia Mes Anterior']],
          body: formattedData['Ventas Mensuales'].map(item => [
            item.month_name?.trim() || '',
            item.year || '',
            item.average_daily_sales || 0,
            item.difference_from_previous_month || 0
          ]),
          theme: 'grid',
          headStyles: { fillColor: [24, 103, 192] }
        })
        yPosition = doc.lastAutoTable.finalY + 10
      }

      // Best Supplier Section
      if (formattedData['Mejor Proveedor'].length > 0) {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(14)
        doc.setFont(undefined, 'bold')
        doc.text('Mejor Proveedor del Último Mes', 14, yPosition)
        yPosition += 7

        autoTable(doc, {
          startY: yPosition,
          head: [['Proveedor', 'Productos Vendidos']],
          body: formattedData['Mejor Proveedor'].map(item => [
            item.name_supplier || '',
            item.total_products_sold_last_month || 0
          ]),
          theme: 'grid',
          headStyles: { fillColor: [24, 103, 192] }
        })
        yPosition = doc.lastAutoTable.finalY + 10
      }

      // Inventory Value Section
      if (formattedData['Valor Inventario'].length > 0) {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(14)
        doc.setFont(undefined, 'bold')
        doc.text('Valor del Inventario por Tienda', 14, yPosition)
        yPosition += 7

        autoTable(doc, {
          startY: yPosition,
          head: [['Tienda', 'Productos Únicos', 'Valor Total']],
          body: formattedData['Valor Inventario'].map(item => [
            item.nameStore || '',
            item.uniqueProduct || 0,
            `$${new Intl.NumberFormat('es-CL').format(item.totalPriceInventory || 0)}`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [24, 103, 192] }
        })
        yPosition = doc.lastAutoTable.finalY + 10
      }

      // Average Days in Inventory Section
      if (formattedData['Promedio Días Inventario'].length > 0) {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(14)
        doc.setFont(undefined, 'bold')
        doc.text('Promedio de Días en Inventario', 14, yPosition)
        yPosition += 7

        autoTable(doc, {
          startY: yPosition,
          head: [['Producto', 'Días Promedio']],
          body: formattedData['Promedio Días Inventario'].map(item => [
            item.name_product || '',
            item.average_days || 0
          ]),
          theme: 'grid',
          headStyles: { fillColor: [24, 103, 192] }
        })
      }

      doc.save(`${defaultOptions.filename}.pdf`)
      return { success: true, filename: `${defaultOptions.filename}.pdf` }
    },
    excel: () => generateExcelReport(formattedData, { filename: `${defaultOptions.filename}.xlsx` }),
    csv: () => {
      // For CSV, combine all data into one sheet with section headers
      const combinedData = []

      Object.keys(formattedData).forEach(section => {
        combinedData.push({ Sección: section })
        if (Array.isArray(formattedData[section])) {
          formattedData[section].forEach(item => {
            combinedData.push(item)
          })
        }
        combinedData.push({}) // Empty row between sections
      })

      return generateCSVReport(combinedData, { filename: `${defaultOptions.filename}.csv` })
    }
  }
}
