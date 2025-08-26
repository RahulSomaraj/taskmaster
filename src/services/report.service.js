const Task = require('../models/Task');
const { Parser } = require('json2csv');
const dayjs = require('dayjs');

class ReportService {
  // Generate CSV export
  async generateCSV(userId, filters) {
    const tasks = await this.getFilteredTasks(userId, filters);
    
    const csvFields = [
      { label: 'Title', value: 'title' },
      { label: 'Description', value: 'description' },
      { label: 'Date', value: 'date' },
      { label: 'Due Time', value: 'dueTime' },
      { label: 'Status', value: 'status' },
      { label: 'Priority', value: 'priority' },
      { label: 'Category', value: 'category' },
      { label: 'Tags', value: 'tags' },
      { label: 'Estimated Minutes', value: 'estimatedMinutes' },
      { label: 'Created At', value: 'createdAt' },
      { label: 'Completed At', value: 'completedAt' },
      { label: 'Completion Time (minutes)', value: 'completionTimeMinutes' },
      { label: 'Is Overdue', value: 'isOverdue' }
    ];

    const csvData = tasks.map(task => ({
      title: task.title,
      description: task.description || '',
      date: dayjs(task.date).format('YYYY-MM-DD'),
      dueTime: task.dueTime || '',
      status: task.status,
      priority: task.priority,
      category: task.category,
      tags: task.tags ? task.tags.join(', ') : '',
      estimatedMinutes: task.estimatedMinutes || '',
      createdAt: dayjs(task.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      completedAt: task.completedAt ? dayjs(task.completedAt).format('YYYY-MM-DD HH:mm:ss') : '',
      completionTimeMinutes: task.completionTimeMinutes || '',
      isOverdue: task.isOverdue ? 'Yes' : 'No'
    }));

    const parser = new Parser({ fields: csvFields });
    return parser.parse(csvData);
  }

  // Generate HTML report (PDF alternative)
  async generatePDF(userId, filters) {
    const tasks = await this.getFilteredTasks(userId, filters);
    
    const html = this.generateReportHTML(tasks, filters);
    return html;
  }

  // Get filtered tasks for reports
  async getFilteredTasks(userId, filters) {
    const query = { userId };
    
    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.priority && filters.priority !== 'all') {
      query.priority = filters.priority;
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }
    
    if (filters.from && filters.to) {
      query.date = {
        $gte: new Date(filters.from),
        $lte: new Date(filters.to)
      };
    }

    return await Task.find(query)
      .sort({ date: -1, priority: -1 })
      .lean();
  }

  // Generate HTML for PDF report
  generateReportHTML(tasks, filters) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const cancelledTasks = tasks.filter(t => t.status === 'cancelled').length;
    const overdueTasks = tasks.filter(t => t.isOverdue).length;

    const dateRange = filters.from && filters.to 
      ? `${dayjs(filters.from).format('MMM DD, YYYY')} - ${dayjs(filters.to).format('MMM DD, YYYY')}`
      : 'All Time';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Task Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .summary {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          .summary-item {
            text-align: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            min-width: 120px;
            margin: 5px;
          }
          .summary-number {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
          }
          .summary-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 12px;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          .status-completed { color: #28a745; }
          .status-pending { color: #ffc107; }
          .status-cancelled { color: #dc3545; }
          .priority-high { color: #dc3545; }
          .priority-medium { color: #ffc107; }
          .priority-low { color: #28a745; }
          .overdue { color: #dc3545; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Task Report</h1>
          <p>Generated on ${dayjs().format('MMMM DD, YYYY at HH:mm')}</p>
          <p>Date Range: ${dateRange}</p>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <div class="summary-number">${totalTasks}</div>
            <div class="summary-label">Total Tasks</div>
          </div>
          <div class="summary-item">
            <div class="summary-number">${completedTasks}</div>
            <div class="summary-label">Completed</div>
          </div>
          <div class="summary-item">
            <div class="summary-number">${pendingTasks}</div>
            <div class="summary-label">Pending</div>
          </div>
          <div class="summary-item">
            <div class="summary-number">${cancelledTasks}</div>
            <div class="summary-label">Cancelled</div>
          </div>
          <div class="summary-item">
            <div class="summary-number">${overdueTasks}</div>
            <div class="summary-label">Overdue</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Category</th>
              <th>Due Time</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map(task => `
              <tr>
                <td>${task.title}</td>
                <td>${dayjs(task.date).format('MMM DD, YYYY')}</td>
                <td class="status-${task.status}">${task.status.charAt(0).toUpperCase() + task.status.slice(1)}</td>
                <td class="priority-${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</td>
                <td>${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</td>
                <td>${task.dueTime || '-'}</td>
                <td>${task.tags ? task.tags.join(', ') : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }

  // Get report summary statistics
  async getReportSummary(userId, filters) {
    const tasks = await this.getFilteredTasks(userId, filters);
    
    const summary = {
      total: tasks.length,
      completed: 0,
      pending: 0,
      cancelled: 0,
      overdue: 0,
      byPriority: { low: 0, medium: 0, high: 0 },
      byCategory: {},
      averageCompletionTime: 0
    };

    let totalCompletionTime = 0;
    let completedTasks = 0;

    tasks.forEach(task => {
      summary[task.status]++;
      
      if (task.isOverdue) {
        summary.overdue++;
      }
      
      summary.byPriority[task.priority]++;
      
      if (!summary.byCategory[task.category]) {
        summary.byCategory[task.category] = 0;
      }
      summary.byCategory[task.category]++;
      
      if (task.status === 'completed' && task.completionTimeMinutes) {
        totalCompletionTime += task.completionTimeMinutes;
        completedTasks++;
      }
    });

    if (completedTasks > 0) {
      summary.averageCompletionTime = Math.round(totalCompletionTime / completedTasks);
    }

    return summary;
  }
}

module.exports = new ReportService();
