const Task = require('../models/Task');
const dayjs = require('dayjs');

class AnalyticsService {
  // Get completion rate for last 30 days
  async getCompletionRateTrend(userId, days = 30) {
    const endDate = dayjs().endOf('day');
    const startDate = endDate.subtract(days - 1, 'day').startOf('day');

    const result = await Task.aggregate([
      {
        $match: {
          userId: Task.base.Types.ObjectId(userId),
          date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          date: "$_id",
          total: 1,
          completed: 1,
          completionRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $multiply: [{ $divide: ["$completed", "$total"] }, 100] }
            ]
          }
        }
      },
      { $sort: { date: 1 } }
    ]);

    return result;
  }

  // Get weekly created vs completed for last 12 weeks
  async getWeeklyCreatedVsCompleted(userId, weeks = 12) {
    const endDate = dayjs().endOf('week');
    const startDate = endDate.subtract(weeks - 1, 'week').startOf('week');

    const result = await Task.aggregate([
      {
        $match: {
          userId: Task.base.Types.ObjectId(userId),
          $or: [
            { date: { $gte: startDate.toDate(), $lte: endDate.toDate() } },
            { createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() } }
          ]
        }
      },
      {
        $facet: {
          created: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  week: { $week: "$createdAt" }
                },
                count: { $sum: 1 }
              }
            }
          ],
          completed: [
            {
              $match: { status: "completed" }
            },
            {
              $group: {
                _id: {
                  year: { $year: "$completedAt" },
                  week: { $week: "$completedAt" }
                },
                count: { $sum: 1 }
              }
            }
          ]
        }
      },
      {
        $project: {
          weeks: {
            $map: {
              input: { $range: [0, weeks] },
              as: "weekOffset",
              in: {
                week: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: {
                      $subtract: [
                        endDate.toDate(),
                        { $multiply: ["$$weekOffset", 7 * 24 * 60 * 60 * 1000] }
                      ]
                    }
                  }
                },
                created: {
                  $let: {
                    vars: {
                      weekData: {
                        $filter: {
                          input: "$created",
                          cond: {
                            $and: [
                              { $eq: ["$$this._id.year", { $year: { $subtract: [endDate.toDate(), { $multiply: ["$$weekOffset", 7 * 24 * 60 * 60 * 1000] }] } }] },
                              { $eq: ["$$this._id.week", { $week: { $subtract: [endDate.toDate(), { $multiply: ["$$weekOffset", 7 * 24 * 60 * 60 * 1000] }] } }] }
                            ]
                          }
                        }
                      }
                    },
                    in: { $ifNull: [{ $arrayElemAt: ["$$weekData.count", 0] }, 0] }
                  }
                },
                completed: {
                  $let: {
                    vars: {
                      weekData: {
                        $filter: {
                          input: "$completed",
                          cond: {
                            $and: [
                              { $eq: ["$$this._id.year", { $year: { $subtract: [endDate.toDate(), { $multiply: ["$$weekOffset", 7 * 24 * 60 * 60 * 1000] }] } }] },
                              { $eq: ["$$this._id.week", { $week: { $subtract: [endDate.toDate(), { $multiply: ["$$weekOffset", 7 * 24 * 60 * 60 * 1000] }] } }] }
                            ]
                          }
                        }
                      }
                    },
                    in: { $ifNull: [{ $arrayElemAt: ["$$weekData.count", 0] }, 0] }
                  }
                }
              }
            }
          }
        }
      }
    ]);

    return result[0]?.weeks || [];
  }

  // Get category breakdown for last 30 days
  async getCategoryBreakdown(userId, days = 30) {
    const endDate = dayjs().endOf('day');
    const startDate = endDate.subtract(days - 1, 'day').startOf('day');

    const result = await Task.aggregate([
      {
        $match: {
          userId: Task.base.Types.ObjectId(userId),
          date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          completed: 1,
          completionRate: {
            $cond: [
              { $eq: ["$count", 0] },
              0,
              { $multiply: [{ $divide: ["$completed", "$count"] }, 100] }
            ]
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return result;
  }

  // Get priority breakdown
  async getPriorityBreakdown(userId, days = 30) {
    const endDate = dayjs().endOf('day');
    const startDate = endDate.subtract(days - 1, 'day').startOf('day');

    const result = await Task.aggregate([
      {
        $match: {
          userId: Task.base.Types.ObjectId(userId),
          date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        }
      },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          priority: "$_id",
          count: 1,
          completed: 1,
          completionRate: {
            $cond: [
              { $eq: ["$count", 0] },
              0,
              { $multiply: [{ $divide: ["$completed", "$count"] }, 100] }
            ]
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return result;
  }

  // Calculate current streak (consecutive days with at least 1 completion)
  async getCurrentStreak(userId) {
    const result = await Task.aggregate([
      {
        $match: {
          userId: Task.base.Types.ObjectId(userId),
          status: "completed"
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const completedDates = result.map(r => r._id);
    let streak = 0;
    let currentDate = dayjs();

    while (completedDates.includes(currentDate.format('YYYY-MM-DD'))) {
      streak++;
      currentDate = currentDate.subtract(1, 'day');
    }

    return streak;
  }

  // Get average completion time
  async getAverageCompletionTime(userId, days = 30) {
    const endDate = dayjs().endOf('day');
    const startDate = endDate.subtract(days - 1, 'day').startOf('day');

    const result = await Task.aggregate([
      {
        $match: {
          userId: Task.base.Types.ObjectId(userId),
          status: "completed",
          completedAt: { $exists: true, $ne: null },
          createdAt: { $exists: true, $ne: null },
          completedAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        }
      },
      {
        $project: {
          completionTimeMinutes: {
            $divide: [
              { $subtract: ["$completedAt", "$createdAt"] },
              1000 * 60
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageMinutes: { $avg: "$completionTimeMinutes" },
          totalTasks: { $sum: 1 }
        }
      }
    ]);

    return result[0] ? Math.round(result[0].averageMinutes) : 0;
  }

  // Get overdue tasks count
  async getOverdueTasksCount(userId) {
    const now = new Date();
    
    const result = await Task.aggregate([
      {
        $match: {
          userId: Task.base.Types.ObjectId(userId),
          status: "pending",
          date: { $lt: now }
        }
      },
      {
        $count: "count"
      }
    ]);

    return result[0] ? result[0].count : 0;
  }

  // Get monthly completion rate
  async getMonthlyCompletionRate(userId) {
    const startOfMonth = dayjs().startOf('month');
    const endOfMonth = dayjs().endOf('month');

    const result = await Task.aggregate([
      {
        $match: {
          userId: Task.base.Types.ObjectId(userId),
          date: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          completionRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $multiply: [{ $divide: ["$completed", "$total"] }, 100] }
            ]
          }
        }
      }
    ]);

    return result[0] ? Math.round(result[0].completionRate) : 0;
  }

  // Get average tasks per day
  async getAverageTasksPerDay(userId, days = 30) {
    const endDate = dayjs().endOf('day');
    const startDate = endDate.subtract(days - 1, 'day').startOf('day');

    const result = await Task.aggregate([
      {
        $match: {
          userId: Task.base.Types.ObjectId(userId),
          date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          averageTasks: { $avg: "$count" },
          totalDays: { $sum: 1 }
        }
      }
    ]);

    return result[0] ? Math.round(result[0].averageTasks * 10) / 10 : 0;
  }

  // Get comprehensive dashboard data
  async getDashboardData(userId) {
    const [
      completionRateTrend,
      weeklyData,
      categoryBreakdown,
      priorityBreakdown,
      currentStreak,
      averageCompletionTime,
      overdueCount,
      monthlyCompletionRate,
      averageTasksPerDay
    ] = await Promise.all([
      this.getCompletionRateTrend(userId),
      this.getWeeklyCreatedVsCompleted(userId),
      this.getCategoryBreakdown(userId),
      this.getPriorityBreakdown(userId),
      this.getCurrentStreak(userId),
      this.getAverageCompletionTime(userId),
      this.getOverdueTasksCount(userId),
      this.getMonthlyCompletionRate(userId),
      this.getAverageTasksPerDay(userId)
    ]);

    return {
      completionRateTrend,
      weeklyData,
      categoryBreakdown,
      priorityBreakdown,
      kpis: {
        currentStreak,
        averageCompletionTime,
        overdueCount,
        monthlyCompletionRate,
        averageTasksPerDay
      }
    };
  }

  // Get today's task statistics
  async getTodayStats(userId) {
    const today = dayjs().startOf('day');
    const tomorrow = today.add(1, 'day');

    const result = await Task.aggregate([
      {
        $match: {
          userId: Task.base.Types.ObjectId(userId),
          date: { $gte: today.toDate(), $lt: tomorrow.toDate() },
          deletedAt: null
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "pending"] },
                    { $lt: ["$date", new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = result[0] || { total: 0, completed: 0, pending: 0, overdue: 0 };
    return stats;
  }

  // Get productivity score for today
  async getProductivityScore(userId) {
    const today = dayjs().startOf('day');
    const tomorrow = today.add(1, 'day');

    const result = await Task.aggregate([
      {
        $match: {
          userId: Task.base.Types.ObjectId(userId),
          date: { $gte: today.toDate(), $lt: tomorrow.toDate() },
          deletedAt: null
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = result[0] || { total: 0, completed: 0 };
    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    
    // Calculate productivity score based on completion rate and efficiency
    let productivityScore = completionRate;
    
    // Bonus for completing all tasks
    if (stats.completed === stats.total && stats.total > 0) {
      productivityScore += 10;
    }
    
    // Penalty for overdue tasks
    const overdueResult = await Task.aggregate([
      {
        $match: {
          userId: Task.base.Types.ObjectId(userId),
          date: { $lt: new Date() },
          status: "pending",
          deletedAt: null
        }
      },
      {
        $group: {
          _id: null,
          overdueCount: { $sum: 1 }
        }
      }
    ]);
    
    const overdueCount = overdueResult[0]?.overdueCount || 0;
    productivityScore = Math.max(0, productivityScore - (overdueCount * 5));
    
    return Math.round(Math.min(100, productivityScore));
  }

  // Get monthly trend data
  async getMonthlyTrend(userId, months = 12) {
    const endDate = dayjs().endOf('month');
    const startDate = endDate.subtract(months - 1, 'month').startOf('month');

    const result = await Task.aggregate([
      {
        $match: {
          userId: Task.base.Types.ObjectId(userId),
          date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          deletedAt: null
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" }
            ]
          },
          total: 1,
          completed: 1,
          completionRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $multiply: [{ $divide: ["$completed", "$total"] }, 100] }
            ]
          }
        }
      },
      { $sort: { month: 1 } }
    ]);

    return result;
  }

  // Get productivity insights
  async getProductivityInsights(userId) {
    const thirtyDaysAgo = dayjs().subtract(30, 'days');

    // Get best day of the week
    const bestDayResult = await Task.aggregate([
      {
        $match: {
          userId: Task.base.Types.ObjectId(userId),
          date: { $gte: thirtyDaysAgo.toDate() },
          status: "completed",
          deletedAt: null
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$date" },
          completedCount: { $sum: 1 }
        }
      },
      { $sort: { completedCount: -1 } },
      { $limit: 1 }
    ]);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bestDay = bestDayResult[0] ? dayNames[bestDayResult[0]._id - 1] : 'N/A';

    // Get most productive time (simplified - could be enhanced with actual time data)
    const bestTime = 'Morning (9-12 AM)'; // Placeholder

    // Get top category
    const topCategoryResult = await Task.aggregate([
      {
        $match: {
          userId: Task.base.Types.ObjectId(userId),
          date: { $gte: thirtyDaysAgo.toDate() },
          status: "completed",
          deletedAt: null
        }
      },
      {
        $group: {
          _id: "$category",
          completedCount: { $sum: 1 }
        }
      },
      { $sort: { completedCount: -1 } },
      { $limit: 1 }
    ]);

    const topCategory = topCategoryResult[0] ? topCategoryResult[0]._id : 'N/A';

    return {
      bestDay,
      bestTime,
      topCategory
    };
  }
}

module.exports = new AnalyticsService();
