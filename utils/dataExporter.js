const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// Export data to CSV format
exports.exportToCSV = async (data, filename) => {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array');
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Handle values that need quotes (contain commas, quotes, or newlines)
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvContent += values.join(',') + '\n';
    });

    // Ensure uploads directory exists
    const uploadsDir = path.join('uploads', 'exports');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, `${filename}.csv`);
    fs.writeFileSync(filePath, csvContent);

    return filePath;
  } catch (error) {
    throw new Error(`CSV export failed: ${error.message}`);
  }
};

// Export data to Excel format
exports.exportToExcel = async (data, filename, sheetName = 'Data') => {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Add headers
    worksheet.addRow(headers);
    
    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => row[header] || '');
      worksheet.addRow(values);
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = Math.max(
        column.header.length,
        ...column.values.slice(1).map(v => String(v).length)
      ) + 2;
    });

    // Ensure uploads directory exists
    const uploadsDir = path.join('uploads', 'exports');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, `${filename}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  } catch (error) {
    throw new Error(`Excel export failed: ${error.message}`);
  }
};

// Export analytics data with multiple sheets
exports.exportAnalyticsToExcel = async (analyticsData, filename) => {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Dashboard Summary Sheet
    if (analyticsData.dashboard) {
      const dashboardSheet = workbook.addWorksheet('Dashboard Summary');
      
      // Add overview metrics
      dashboardSheet.addRow(['Metric', 'Value']);
      dashboardSheet.addRow(['Total Users', analyticsData.dashboard.overview?.totalUsers || 0]);
      dashboardSheet.addRow(['Total Courses', analyticsData.dashboard.overview?.totalCourses || 0]);
      dashboardSheet.addRow(['Active Enrollments', analyticsData.dashboard.overview?.activeEnrollments || 0]);
      dashboardSheet.addRow(['Completion Rate', `${analyticsData.dashboard.overview?.completionRate || 0}%`]);
      
      // Style header
      const headerRow = dashboardSheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    }

    // Enrollment Trends Sheet
    if (analyticsData.enrollmentTrends) {
      const enrollmentSheet = workbook.addWorksheet('Enrollment Trends');
      
      if (analyticsData.enrollmentTrends.length > 0) {
        const headers = Object.keys(analyticsData.enrollmentTrends[0]);
        enrollmentSheet.addRow(headers);
        
        analyticsData.enrollmentTrends.forEach(trend => {
          const values = headers.map(header => trend[header]);
          enrollmentSheet.addRow(values);
        });
        
        // Style header
        const headerRow = enrollmentSheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
      }
    }

    // Course Performance Sheet
    if (analyticsData.coursePerformance) {
      const courseSheet = workbook.addWorksheet('Course Performance');
      
      if (analyticsData.coursePerformance.length > 0) {
        const headers = Object.keys(analyticsData.coursePerformance[0]);
        courseSheet.addRow(headers);
        
        analyticsData.coursePerformance.forEach(course => {
          const values = headers.map(header => course[header]);
          courseSheet.addRow(values);
        });
        
        // Style header
        const headerRow = courseSheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
      }
    }

    // Feedback Analysis Sheet
    if (analyticsData.feedbackTrends) {
      const feedbackSheet = workbook.addWorksheet('Feedback Analysis');
      
      if (analyticsData.feedbackTrends.monthlyTrends?.length > 0) {
        const headers = Object.keys(analyticsData.feedbackTrends.monthlyTrends[0]);
        feedbackSheet.addRow(headers);
        
        analyticsData.feedbackTrends.monthlyTrends.forEach(trend => {
          const values = headers.map(header => trend[header]);
          feedbackSheet.addRow(values);
        });
        
        // Style header
        const headerRow = feedbackSheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
      }
    }

    // Auto-fit all columns
    workbook.worksheets.forEach(worksheet => {
      worksheet.columns.forEach(column => {
        if (column.values.length > 0) {
          column.width = Math.max(
            ...column.values.map(v => String(v).length)
          ) + 2;
        }
      });
    });

    // Ensure uploads directory exists
    const uploadsDir = path.join('uploads', 'exports');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, `${filename}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  } catch (error) {
    throw new Error(`Analytics Excel export failed: ${error.message}`);
  }
};

// Export data to JSON format
exports.exportToJSON = async (data, filename) => {
  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join('uploads', 'exports');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return filePath;
  } catch (error) {
    throw new Error(`JSON export failed: ${error.message}`);
  }
};

// Clean up old export files (older than 7 days)
exports.cleanupOldExports = async () => {
  try {
    const uploadsDir = path.join('uploads', 'exports');
    if (!fs.existsSync(uploadsDir)) {
      return;
    }

    const files = fs.readdirSync(uploadsDir);
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < sevenDaysAgo) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old export file: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up old exports:', error);
  }
}; 