const dayjs = require('dayjs');

class RewardsService {
  // Motivational quotes for different actions
  getMotivationalQuotes() {
    return {
      taskCreated: [
        {
          quote:
            "Every task you create is a step towards your dreams. You're building your future, one task at a time! 🌟",
          author: 'Your Future Self',
          image:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
          category: 'motivation',
        },
        {
          quote: "Small steps, big impact. You're a master of consistency and persistence! 💪",
          author: 'The Universe',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
          category: 'consistency',
        },
        {
          quote:
            "Your dedication to planning is inspiring. You're creating the life you deserve! ✨",
          author: 'Your Inner Guide',
          image:
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
          category: 'dedication',
        },
        {
          quote: "Every task is an opportunity to grow. You're becoming unstoppable! 🚀",
          author: 'Growth Mindset',
          image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
          category: 'growth',
        },
        {
          quote: "You're not just creating tasks, you're creating miracles. Keep going! 🌈",
          author: 'Your Potential',
          image:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
          category: 'miracles',
        },
      ],
      taskCompleted: [
        {
          quote: "BOOM! Another task conquered! You're absolutely crushing it today! 🎉",
          author: 'Your Success',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
          category: 'celebration',
        },
        {
          quote: "You're a productivity powerhouse! Every completion makes you stronger! 💪",
          author: 'Your Power',
          image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
          category: 'power',
        },
        {
          quote: "Mission accomplished! You're building unstoppable momentum! 🚀",
          author: 'Your Momentum',
          image:
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
          category: 'momentum',
        },
        {
          quote: "You're not just completing tasks, you're completing dreams! ✨",
          author: 'Your Dreams',
          image:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
          category: 'dreams',
        },
        {
          quote: "Another victory! You're becoming the person you always wanted to be! 🌟",
          author: 'Your Future',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
          category: 'victory',
        },
      ],
      login: [
        {
          quote: 'Welcome back, champion! Ready to conquer another amazing day? 🌅',
          author: 'Your Journey',
          image:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
          category: 'welcome',
        },
        {
          quote: "You're back! Your consistency is absolutely inspiring! 💫",
          author: 'Your Consistency',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
          category: 'consistency',
        },
        {
          quote: "Great to see you again! You're building something incredible! 🏗️",
          author: 'Your Building',
          image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
          category: 'building',
        },
        {
          quote: "You're here! That's the first step to another productive day! 👟",
          author: 'Your Steps',
          image:
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
          category: 'steps',
        },
        {
          quote: 'Welcome back, warrior! Your dedication is changing your life! ⚔️',
          author: 'Your Warrior',
          image:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
          category: 'warrior',
        },
      ],
      streak: [
        {
          quote: "🔥 3-day streak! You're on fire! Keep this momentum going!",
          author: 'Your Fire',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
          category: 'fire',
        },
        {
          quote: "🌟 7-day streak! You're absolutely unstoppable!",
          author: 'Your Unstoppable',
          image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
          category: 'unstoppable',
        },
        {
          quote: "💎 30-day streak! You're a diamond in the making!",
          author: 'Your Diamond',
          image:
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
          category: 'diamond',
        },
        {
          quote: "👑 100-day streak! You're royalty of consistency!",
          author: 'Your Royalty',
          image:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
          category: 'royalty',
        },
      ],
      milestone: [
        {
          quote: "🎯 10 tasks completed! You're hitting targets like a pro!",
          author: 'Your Target',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
          category: 'target',
        },
        {
          quote: "🏆 50 tasks completed! You're a productivity champion!",
          author: 'Your Champion',
          image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
          category: 'champion',
        },
        {
          quote: "💎 100 tasks completed! You're absolutely legendary!",
          author: 'Your Legend',
          image:
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
          category: 'legend',
        },
        {
          quote: "👑 500 tasks completed! You're the master of your destiny!",
          author: 'Your Mastery',
          image:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
          category: 'mastery',
        },
      ],
      statusChange: [
        {
          quote: "🌟 Status updated! You're taking control of your tasks!",
          author: 'Your Control',
          image:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
          category: 'control',
        },
        {
          quote: "✨ Every change is progress! You're moving forward!",
          author: 'Your Progress',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
          category: 'progress',
        },
        {
          quote: "💫 Adapting and evolving! You're becoming unstoppable!",
          author: 'Your Evolution',
          image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
          category: 'evolution',
        },
        {
          quote: '🎯 Flexibility is your superpower! Keep adapting!',
          author: 'Your Flexibility',
          image:
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
          category: 'flexibility',
        },
        {
          quote: '🚀 Every adjustment brings you closer to success!',
          author: 'Your Success',
          image:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
          category: 'success',
        },
      ],
      taskReset: [
        {
          quote: "🔄 Fresh start! You're giving yourself another chance!",
          author: 'Your Second Chance',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
          category: 'fresh_start',
        },
        {
          quote: '🌱 New beginnings! Every reset is growth!',
          author: 'Your Growth',
          image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
          category: 'growth',
        },
        {
          quote: "⭐ You're not giving up, you're starting over!",
          author: 'Your Persistence',
          image:
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
          category: 'persistence',
        },
        {
          quote: '💪 Resilience is your strength! Keep going!',
          author: 'Your Resilience',
          image:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
          category: 'resilience',
        },
        {
          quote: '🎯 Every reset is a step toward mastery!',
          author: 'Your Mastery',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
          category: 'mastery',
        },
      ],
    };
  }

  // Get a random quote for a specific action
  getRandomQuote(action) {
    const quotes = this.getMotivationalQuotes();
    const actionQuotes = quotes[action] || quotes.taskCompleted;
    return actionQuotes[Math.floor(Math.random() * actionQuotes.length)];
  }

  // Get multiple random quotes for variety
  getMultipleQuotes(action, count = 3) {
    const quotes = this.getMotivationalQuotes();
    const actionQuotes = quotes[action] || quotes.taskCompleted;
    const shuffled = [...actionQuotes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Get streak message based on count
  getStreakMessage(streakCount) {
    const quotes = this.getMotivationalQuotes().streak;

    if (streakCount >= 100) return quotes[3];
    if (streakCount >= 30) return quotes[2];
    if (streakCount >= 7) return quotes[1];
    if (streakCount >= 3) return quotes[0];

    return null;
  }

  // Get milestone message based on task count
  getMilestoneMessage(taskCount) {
    const quotes = this.getMotivationalQuotes().milestone;

    if (taskCount >= 500) return quotes[3];
    if (taskCount >= 100) return quotes[2];
    if (taskCount >= 50) return quotes[1];
    if (taskCount >= 10) return quotes[0];

    return null;
  }

  // Calculate user's current streak
  calculateStreak(completedTasks) {
    if (!completedTasks || completedTasks.length === 0) return 0;

    const today = dayjs().startOf('day');
    let streak = 0;
    let currentDate = today;

    // Sort tasks by completion date (most recent first)
    const sortedTasks = completedTasks
      .filter(task => task.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    for (let i = 0; i < sortedTasks.length; i++) {
      const taskDate = dayjs(sortedTasks[i].completedAt).startOf('day');

      if (taskDate.isSame(currentDate)) {
        streak++;
        currentDate = currentDate.subtract(1, 'day');
      } else if (taskDate.isBefore(currentDate)) {
        break;
      }
    }

    return streak;
  }

  // Get achievement badges
  getAchievementBadges() {
    return {
      firstTask: {
        name: 'First Steps',
        description: 'Completed your first task',
        icon: '🎯',
        color: 'bg-blue-500',
      },
      streak3: {
        name: 'On Fire',
        description: '3-day completion streak',
        icon: '🔥',
        color: 'bg-orange-500',
      },
      streak7: {
        name: 'Unstoppable',
        description: '7-day completion streak',
        icon: '🌟',
        color: 'bg-yellow-500',
      },
      streak30: {
        name: 'Diamond',
        description: '30-day completion streak',
        icon: '💎',
        color: 'bg-purple-500',
      },
      tasks10: {
        name: 'Target Master',
        description: 'Completed 10 tasks',
        icon: '🎯',
        color: 'bg-green-500',
      },
      tasks50: {
        name: 'Productivity Champion',
        description: 'Completed 50 tasks',
        icon: '🏆',
        color: 'bg-red-500',
      },
      tasks100: {
        name: 'Legend',
        description: 'Completed 100 tasks',
        icon: '💎',
        color: 'bg-indigo-500',
      },
      tasks500: {
        name: 'Master',
        description: 'Completed 500 tasks',
        icon: '👑',
        color: 'bg-yellow-600',
      },
    };
  }

  // Check for new achievements
  checkAchievements(userStats) {
    const badges = this.getAchievementBadges();
    const newAchievements = [];

    // Check for first task
    if (userStats.totalCompleted === 1) {
      newAchievements.push(badges.firstTask);
    }

    // Check for task count milestones
    if (userStats.totalCompleted === 10) {
      newAchievements.push(badges.tasks10);
    }
    if (userStats.totalCompleted === 50) {
      newAchievements.push(badges.tasks50);
    }
    if (userStats.totalCompleted === 100) {
      newAchievements.push(badges.tasks100);
    }
    if (userStats.totalCompleted === 500) {
      newAchievements.push(badges.tasks500);
    }

    // Check for streaks
    if (userStats.currentStreak === 3) {
      newAchievements.push(badges.streak3);
    }
    if (userStats.currentStreak === 7) {
      newAchievements.push(badges.streak7);
    }
    if (userStats.currentStreak === 30) {
      newAchievements.push(badges.streak30);
    }

    return newAchievements;
  }
}

module.exports = new RewardsService();
