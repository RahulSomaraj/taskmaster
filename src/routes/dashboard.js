const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { validateDateRange, requireAuth } = require('../middlewares/validators');
const { requireAuth: requireAuthMiddleware } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(requireAuthMiddleware);

// Show main dashboard
router.get('/', dashboardController.showDashboard);

// Show reports page
router.get('/reports', dashboardController.showReports);

// Export CSV report
router.get('/reports/export.csv', validateDateRange, dashboardController.exportCSV);

// Export PDF report
router.get('/reports/export.pdf', validateDateRange, dashboardController.exportPDF);

// API routes for dashboard data
router.get('/api/data', dashboardController.getDashboardData);

// API routes for individual charts
router.get('/api/completion-rate-trend', dashboardController.getCompletionRateTrend);
router.get('/api/weekly-data', dashboardController.getWeeklyData);
router.get('/api/category-breakdown', dashboardController.getCategoryBreakdown);
router.get('/api/priority-breakdown', dashboardController.getPriorityBreakdown);
router.get('/api/kpis', dashboardController.getKPIs);

// API route for report preview
router.get('/api/report-preview', validateDateRange, dashboardController.getReportPreview);

module.exports = router;
