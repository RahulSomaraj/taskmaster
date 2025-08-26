# Todo App - Daily Tasks, Monthly Summary & Analytics Dashboard

A production-ready Node.js web application for managing daily tasks with comprehensive analytics and reporting capabilities.

## 🚀 Features

### Core Functionality
- **Daily Task Management**: Add, edit, delete, complete, and filter daily tasks
- **Monthly Calendar View**: Visual summary of tasks across the month
- **Analytics Dashboard**: Real-time charts and KPIs for task performance
- **Reports & Export**: Generate CSV/PDF reports with date range filtering
- **User Authentication**: Secure login/registration with session management

### Task Features
- Priority levels (Low, Medium, High, Urgent)
- Categories (Work, Personal, Health, Learning, Finance, Other)
- Due times and estimated completion time
- Tags with autocomplete
- Status tracking (Pending, Completed, Cancelled)
- Overdue detection and streak tracking

### Analytics & Reports
- **Completion Rate Trend**: Daily/weekly completion patterns
- **Weekly Created vs Completed**: Task creation vs completion analysis
- **Category & Priority Breakdown**: Visual distribution charts
- **Current Streak**: Consecutive days of task completion
- **Average Completion Time**: Performance metrics
- **Overdue Tasks**: Tracking and trends
- **Export Options**: CSV and PDF reports with preview

### Security & Performance
- CSRF protection
- Rate limiting on auth routes
- Helmet security headers
- Password hashing with bcrypt
- Input validation with Zod
- Compression middleware
- Session management with MongoDB

## 🛠 Tech Stack

- **Backend**: Node.js 20+, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Views**: EJS templating engine
- **Styling**: Tailwind CSS (CDN)
- **Charts**: Chart.js (CDN)
- **Date Handling**: Day.js
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier
- **Containerization**: Docker + Docker Compose

## 📁 Project Structure

```
src/
├── config/          # Database configuration
├── controllers/     # Request handlers (MVC)
├── middlewares/     # Custom middleware
├── models/          # Mongoose schemas
├── routes/          # Route definitions
├── services/        # Business logic
├── utils/           # Utility functions
├── views/           # EJS templates
│   ├── auth/        # Authentication views
│   ├── dashboard/   # Dashboard views
│   ├── tasks/       # Task management views
│   ├── partials/    # Reusable components
│   └── layouts/     # Layout templates
└── app.js           # Main application file

tests/
├── unit/            # Unit tests
├── integration/     # Integration tests
└── setup.js         # Test configuration

public/              # Static assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- MongoDB 7.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # Start MongoDB (if using Docker)
   docker-compose up -d mongodb
   
   # Or connect to your existing MongoDB instance
   ```

5. **Seed the database** (optional)
   ```bash
   npm run seed
   # Creates demo users and 90 days of sample tasks
   ```

6. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Access the application**
   - Open http://localhost:3000
   - Login with demo account: `demo@demo.com` / `Demo@123`
   - Or admin account: `admin@demo.com` / `Admin@123`

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/todo-app

# Session
SESSION_SECRET=your-super-secret-session-key

# Application
NODE_ENV=development
PORT=3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start with nodemon
npm start           # Start production server

# Testing
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
npm run lint:fix    # Fix linting issues

# Database
npm run seed        # Seed database with demo data

# Docker
docker-compose up   # Start all services
docker-compose down # Stop all services
```

## 🐳 Docker Setup

### Using Docker Compose (Recommended)

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f app
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

### Manual Docker Build

```bash
# Build image
docker build -t todo-app .

# Run container
docker run -p 3000:3000 --env-file .env todo-app
```

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# With coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Model validation, service methods
- **Integration Tests**: API endpoints, authentication flows
- **E2E Tests**: Complete user workflows

## 📊 API Endpoints

### Authentication
- `GET /login` - Login page
- `POST /login` - Authenticate user
- `GET /register` - Registration page
- `POST /register` - Create new user
- `POST /logout` - Logout user

### Tasks
- `GET /tasks/daily` - Daily task view
- `GET /tasks/monthly` - Monthly calendar view
- `GET /tasks/create` - Task creation form
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/complete` - Mark task complete
- `POST /tasks/:id/cancel` - Cancel task

### Dashboard & Analytics
- `GET /dashboard` - Analytics dashboard
- `GET /dashboard/api/data` - Dashboard data (JSON)
- `GET /dashboard/api/completion-trend` - Completion rate trend
- `GET /dashboard/api/weekly-data` - Weekly statistics
- `GET /dashboard/api/category-breakdown` - Category distribution
- `GET /dashboard/api/priority-breakdown` - Priority distribution

### Reports
- `GET /reports` - Reports page
- `GET /reports/export.csv` - Export CSV report
- `GET /reports/export.pdf` - Export PDF report
- `GET /reports/api/preview` - Report preview data

## 🔐 Security Features

- **CSRF Protection**: All forms protected against CSRF attacks
- **Rate Limiting**: Auth routes protected against brute force
- **Input Validation**: Server-side validation with Zod
- **Password Security**: Bcrypt hashing with salt rounds
- **Session Security**: Secure session configuration
- **Security Headers**: Helmet.js for security headers
- **SQL Injection Protection**: Mongoose ODM protection

## 📈 Analytics Features

### Dashboard KPIs
- Current completion streak
- Monthly completion rate
- Average completion time
- Overdue tasks count
- Average tasks per day

### Charts
- **Completion Rate Trend**: Line chart showing daily completion rates
- **Weekly Created vs Completed**: Bar chart comparing task creation vs completion
- **Category Breakdown**: Doughnut chart showing task distribution by category
- **Priority Breakdown**: Pie chart showing task distribution by priority

### Reports
- **Date Range Filtering**: Custom date range selection
- **CSV Export**: Downloadable CSV with all task data
- **PDF Export**: Formatted PDF reports
- **Preview Table**: Interactive table with sorting and filtering

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode Ready**: CSS variables for easy theming
- **Accessibility**: ARIA labels, focus states, keyboard navigation
- **Interactive Elements**: Hover effects, transitions, loading states
- **Real-time Updates**: Live dashboard data updates
- **Form Validation**: Client and server-side validation
- **Flash Messages**: User feedback for all actions

## 🔧 Development

### Code Style
- ESLint configuration for code quality
- Prettier for consistent formatting
- Husky pre-commit hooks
- Conventional commit messages

### Database Schema

#### User Model
```javascript
{
  email: String (unique, required),
  passwordHash: String (required),
  name: String (required),
  role: String (enum: ['user', 'admin']),
  createdAt: Date,
  updatedAt: Date
}
```

#### Task Model
```javascript
{
  userId: ObjectId (ref: 'User'),
  title: String (required),
  description: String,
  date: Date (required),
  dueTime: String,
  status: String (enum: ['pending', 'completed', 'cancelled']),
  priority: String (enum: ['low', 'medium', 'high', 'urgent']),
  category: String (enum: ['work', 'personal', 'health', 'learning', 'finance', 'other']),
  tags: [String],
  estimatedMinutes: Number,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure MongoDB connection string
- [ ] Set strong `SESSION_SECRET`
- [ ] Configure rate limiting
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Environment-Specific Configs
- **Development**: Hot reload, detailed logging
- **Staging**: Production-like with test data
- **Production**: Optimized performance, security

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)
*Analytics dashboard with charts and KPIs*

### Daily Tasks
![Daily Tasks](screenshots/daily-tasks.png)
*Daily task management interface*

### Monthly View
![Monthly View](screenshots/monthly-view.png)
*Monthly calendar summary*

### Reports
![Reports](screenshots/reports.png)
*Reports and export functionality*

## 🐛 Known Issues

- None currently reported

## 🔮 Roadmap

### Planned Features
- [ ] Recurring tasks
- [ ] Task templates
- [ ] Team collaboration
- [ ] Mobile app
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Advanced analytics
- [ ] API rate limiting
- [ ] Webhook support

### Performance Improvements
- [ ] Database indexing optimization
- [ ] Caching layer
- [ ] CDN integration
- [ ] Image optimization
- [ ] Bundle size reduction

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the test examples

---

**Built with ❤️ using Node.js, Express, MongoDB, and Chart.js**
