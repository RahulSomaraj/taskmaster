const analyticsService = require('../services/analytics.service');
const reportService = require('../services/report.service');
const dayjs = require('dayjs');

class DashboardController {
  // Show main dashboard
  async showDashboard(req, res) {
    try {
      const dashboardData = await analyticsService.getDashboardData(req.user._id);

      res.render('dashboard/index', {
        title: 'Dashboard',
        dashboardData
      });

    } catch (error) {
      console.error('Dashboard error:', error);
      req.session.flash = {
        type: 'error',
        message: 'An error occurred while loading the dashboard.'
      };
      res.redirect('/');
    }
  }

  // Get dashboard data for AJAX requests
  async getDashboardData(req, res) {
    try {
      const dashboardData = await analyticsService.getDashboardData(req.user._id);

      res.json({
        success: true,
        data: dashboardData
      });

    } catch (error) {
      console.error('Dashboard data error:', error);
      res.status(400).json({
        success: false,
        message: 'An error occurred while fetching dashboard data.'
      });
    }
  }

  // Show reports page
  async showReports(req, res) {
    try {
      const filters = {
        from: req.query.from || dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
        to: req.query.to || dayjs().format('YYYY-MM-DD'),
        status: req.query.status || 'all',
        category: req.query.category || '',
        priority: req.query.priority || 'all'
      };

      const summary = await reportService.getReportSummary(req.user._id, filters);

      res.render('dashboard/reports', {
        title: 'Reports',
        filters,
        summary,
        categories: ['work', 'personal', 'health', 'finance', 'education', 'shopping', 'travel', 'other'],
        priorities: ['low', 'medium', 'high']
      });

    } catch (error) {
      console.error('Reports error:', error);
      req.session.flash = {
        type: 'error',
        message: 'An error occurred while loading reports.'
      };
      res.redirect('/dashboard');
    }
  }

  // Export CSV report
  async exportCSV(req, res) {
    try {
      const filters = {
        from: req.query.from,
        to: req.query.to,
        status: req.query.status,
        category: req.query.category,
        priority: req.query.priority,
        tags: req.query.tags ? req.query.tags.split(',') : []
      };

      const csv = await reportService.generateCSV(req.user._id, filters);

      const filename = `tasks-report-${dayjs().format('YYYY-MM-DD-HH-mm')}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);

    } catch (error) {
      console.error('CSV export error:', error);
      req.session.flash = {
        type: 'error',
        message: 'An error occurred while generating the CSV report.'
      };
      res.redirect('/dashboard/reports');
    }
  }

  // Export PDF report
  async exportPDF(req, res) {
    try {
      const filters = {
        from: req.query.from,
        to: req.query.to,
        status: req.query.status,
        category: req.query.category,
        priority: req.query.priority,
        tags: req.query.tags ? req.query.tags.split(',') : []
      };

      const pdf = await reportService.generatePDF(req.user._id, filters);

      const filename = `tasks-report-${dayjs().format('YYYY-MM-DD-HH-mm')}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdf);

    } catch (error) {
      console.error('PDF export error:', error);
      req.session.flash = {
        type: 'error',
        message: 'An error occurred while generating the PDF report.'
      };
      res.redirect('/dashboard/reports');
    }
  }

  // Get completion rate trend
  async getCompletionRateTrend(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const data = await analyticsService.getCompletionRateTrend(req.user._id, days);

      res.json({
        success: true,
        data
      });

    } catch (error) {
      console.error('Completion rate trend error:', error);
      res.status(400).json({
        success: false,
        message: 'An error occurred while fetching completion rate trend.'
      });
    }
  }

  // Get weekly data
  async getWeeklyData(req, res) {
    try {
      const weeks = parseInt(req.query.weeks) || 12;
      const data = await analyticsService.getWeeklyCreatedVsCompleted(req.user._id, weeks);

      res.json({
        success: true,
        data
      });

    } catch (error) {
      console.error('Weekly data error:', error);
      res.status(400).json({
        success: false,
        message: 'An error occurred while fetching weekly data.'
      });
    }
  }

  // Get category breakdown
  async getCategoryBreakdown(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const data = await analyticsService.getCategoryBreakdown(req.user._id, days);

      res.json({
        success: true,
        data
      });

    } catch (error) {
      console.error('Category breakdown error:', error);
      res.status(400).json({
        success: false,
        message: 'An error occurred while fetching category breakdown.'
      });
    }
  }

  // Get priority breakdown
  async getPriorityBreakdown(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const data = await analyticsService.getPriorityBreakdown(req.user._id, days);

      res.json({
        success: true,
        data
      });

    } catch (error) {
      console.error('Priority breakdown error:', error);
      res.status(400).json({
        success: false,
        message: 'An error occurred while fetching priority breakdown.'
      });
    }
  }

  // Get KPI data
  async getKPIs(req, res) {
    try {
      const [
        currentStreak,
        averageCompletionTime,
        overdueCount,
        monthlyCompletionRate,
        averageTasksPerDay
      ] = await Promise.all([
        analyticsService.getCurrentStreak(req.user._id),
        analyticsService.getAverageCompletionTime(req.user._id),
        analyticsService.getOverdueTasksCount(req.user._id),
        analyticsService.getMonthlyCompletionRate(req.user._id),
        analyticsService.getAverageTasksPerDay(req.user._id)
      ]);

      res.json({
        success: true,
        data: {
          currentStreak,
          averageCompletionTime,
          overdueCount,
          monthlyCompletionRate,
          averageTasksPerDay
        }
      });

    } catch (error) {
      console.error('KPI error:', error);
      res.status(400).json({
        success: false,
        message: 'An error occurred while fetching KPI data.'
      });
    }
  }

  // Get report preview data
  async getReportPreview(req, res) {
    try {
      const filters = {
        from: req.query.from,
        to: req.query.to,
        status: req.query.status,
        category: req.query.category,
        priority: req.query.priority,
        tags: req.query.tags ? req.query.tags.split(',') : []
      };

      const tasks = await reportService.getFilteredTasks(req.user._id, filters);
      const summary = await reportService.getReportSummary(req.user._id, filters);

      res.json({
        success: true,
        data: {
          tasks: tasks.slice(0, 10), // Show first 10 tasks as preview
          summary,
          totalTasks: tasks.length
        }
      });

    } catch (error) {
      console.error('Report preview error:', error);
      res.status(400).json({
        success: false,
        message: 'An error occurred while generating report preview.'
      });
    }
  }
}

module.exports = new DashboardController();
