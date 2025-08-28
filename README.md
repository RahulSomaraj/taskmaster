# Todo Analytics App

A comprehensive todo application with advanced analytics, beautiful dashboard, and productivity insights.

## Features

### 🎯 Core Todo Features
- **Task Management**: Create, edit, delete, and organize tasks
- **Categories**: Organize tasks by work, personal, health, finance, education, shopping, travel, and more
- **Priorities**: Set low, medium, or high priority levels
- **Due Dates & Times**: Schedule tasks with specific dates and times
- **Status Tracking**: Track pending, completed, and cancelled tasks
- **Tags**: Add custom tags to tasks for better organization

### 📊 Beautiful Analytics Dashboard
- **Tabbed Interface**: Daily Tasks, Monthly Analytics, and Overview tabs
- **Daily Tasks Tab** (Default Active):
  - Daily completion trend chart with period filters (7D, 14D, 30D)
  - Today's task distribution (completed, pending, overdue)
  - Daily productivity score with circular progress indicator
  - Quick action buttons for adding tasks and viewing today's tasks
- **Monthly Analytics Tab**:
  - Monthly completion trend with period filters (3M, 6M, 12M)
  - Tasks by category breakdown
  - Weekly created vs completed comparison
  - Tasks by priority distribution
- **Overview Tab**:
  - Completion rate trend for last 30 days
  - Productivity insights (best day, most productive time, top category)

### 📈 KPI Dashboard
- **Current Streak**: Track consecutive days of task completion
- **Monthly Completion Rate**: Overall completion percentage for the month
- **Average Completion Time**: Average time to complete tasks
- **Overdue Tasks Count**: Number of tasks past their due date
- **Average Tasks Per Day**: Daily task creation average

### 🎨 Modern Design
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Beautiful UI**: Modern design with gradients, shadows, and smooth animations
- **Interactive Charts**: Powered by Chart.js with beautiful visualizations
- **Hover Effects**: Smooth transitions and interactive elements
- **Color-coded System**: Intuitive color scheme for different task statuses and priorities

### 📋 Task Views
- **Daily View**: View and manage tasks for today
- **Monthly View**: Calendar-style view of all tasks
- **Reports**: Generate detailed reports with filters
- **Export Options**: Export data as CSV or PDF

### 🔐 User Management
- **Authentication**: Secure login and registration
- **User Profiles**: Manage personal information
- **Session Management**: Secure session handling

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: EJS templates with Tailwind CSS
- **Charts**: Chart.js for beautiful data visualizations
- **Authentication**: Session-based authentication
- **Date Handling**: Day.js for efficient date operations

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd todo-analytics-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

4. Start the application:
```bash
npm start
```

5. Access the application at `http://localhost:3000`

## API Endpoints

### Dashboard APIs
- `GET /dashboard` - Main dashboard page
- `GET /dashboard/api/data` - Dashboard data
- `GET /dashboard/api/daily-data` - Daily analytics data
- `GET /dashboard/api/monthly-data` - Monthly analytics data
- `GET /dashboard/api/overview-data` - Overview analytics data
- `GET /dashboard/api/kpis` - Key Performance Indicators
- `GET /dashboard/reports` - Reports page

### Task APIs
- `GET /tasks/daily` - Daily tasks view
- `GET /tasks/monthly` - Monthly tasks view
- `GET /tasks/create` - Create new task
- `POST /tasks` - Save new task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

## Dashboard Features

### Daily Tasks Tab
The default active tab showing:
- **Completion Trend**: Line chart showing daily completion rates
- **Task Distribution**: Doughnut chart of today's task status
- **Productivity Score**: Circular progress indicator
- **Quick Actions**: Easy access to add tasks and view today's tasks

### Monthly Analytics Tab
Comprehensive monthly insights:
- **Monthly Trends**: Bar chart of monthly completion rates
- **Category Breakdown**: Doughnut chart of tasks by category
- **Weekly Comparison**: Bar chart comparing created vs completed tasks
- **Priority Distribution**: Doughnut chart of tasks by priority

### Overview Tab
High-level productivity insights:
- **Completion Rate Trend**: 30-day completion rate line chart
- **Productivity Insights**: Best day, most productive time, top category

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
