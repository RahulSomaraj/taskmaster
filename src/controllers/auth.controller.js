const User = require('../models/User');
const rewardsService = require('../services/rewards.service');
const bcrypt = require('bcrypt');

class AuthController {
  // Show login page
  showLogin(req, res) {
    res.render('auth/login', {
      title: 'Login',
      user: null,
    });
  }

  // Show register page
  showRegister(req, res) {
    res.render('auth/register', {
      title: 'Register',
      user: null,
    });
  }

  // Handle user login
  async login(req, res) {
    try {
      const { email, password } = req.validatedData;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        req.session.flash = {
          type: 'error',
          message: 'Invalid email or password.',
        };
        return res.redirect('/auth/login');
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        req.session.flash = {
          type: 'error',
          message: 'Invalid email or password.',
        };
        return res.redirect('/auth/login');
      }

      // Set session
      req.session.userId = user._id;
      req.session.user = user.toPublicJSON();

      // Get motivational quote for login
      const motivationalQuote = rewardsService.getRandomQuote('login');

      req.session.flash = {
        type: 'success',
        message: `Welcome back, ${user.name}!`,
        motivationalQuote: motivationalQuote,
      };

      res.redirect('/');
    } catch (error) {
      console.error('Login error:', error);
      req.session.flash = {
        type: 'error',
        message: 'An error occurred during login. Please try again.',
      };
      res.redirect('/auth/login');
    }
  }

  // Handle user registration
  async register(req, res) {
    try {
      const { name, email, password } = req.validatedData;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        req.session.flash = {
          type: 'error',
          message: 'A user with this email already exists.',
        };
        return res.redirect('/auth/register');
      }

      // Create new user
      const user = new User({
        name,
        email,
        password, // This will be hashed by the virtual setter
      });

      await user.save();

      // Set session
      req.session.userId = user._id;
      req.session.user = user.toPublicJSON();

      req.session.flash = {
        type: 'success',
        message: `Welcome, ${user.name}! Your account has been created successfully.`,
      };

      res.redirect('/');
    } catch (error) {
      console.error('Registration error:', error);
      req.session.flash = {
        type: 'error',
        message: 'An error occurred during registration. Please try again.',
      };
      res.redirect('/auth/register');
    }
  }

  // Handle user logout
  logout(req, res) {
    req.session.destroy(err => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/auth/login');
    });
  }

  // Show user profile
  async showProfile(req, res) {
    try {
      const user = await User.findById(req.session.userId);
      if (!user) {
        req.session.flash = {
          type: 'error',
          message: 'User not found.',
        };
        return res.redirect('/');
      }

      res.render('auth/profile', {
        title: 'Profile',
        user: user.toPublicJSON(),
      });
    } catch (error) {
      console.error('Profile error:', error);
      req.session.flash = {
        type: 'error',
        message: 'An error occurred while loading your profile.',
      };
      res.redirect('/');
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { name, email } = req.body;
      const user = await User.findById(req.session.userId);

      if (!user) {
        req.session.flash = {
          type: 'error',
          message: 'User not found.',
        };
        return res.redirect('/auth/profile');
      }

      // Check if email is being changed and if it's already taken
      if (email !== user.email) {
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
          req.session.flash = {
            type: 'error',
            message: 'A user with this email already exists.',
          };
          return res.redirect('/auth/profile');
        }
      }

      // Update user
      user.name = name;
      user.email = email;
      await user.save();

      // Update session
      req.session.user = user.toPublicJSON();

      req.session.flash = {
        type: 'success',
        message: 'Profile updated successfully.',
      };

      res.redirect('/auth/profile');
    } catch (error) {
      console.error('Profile update error:', error);
      req.session.flash = {
        type: 'error',
        message: 'An error occurred while updating your profile.',
      };
      res.redirect('/auth/profile');
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        req.session.flash = {
          type: 'error',
          message: 'New passwords do not match.',
        };
        return res.redirect('/auth/profile');
      }

      const user = await User.findById(req.session.userId);
      if (!user) {
        req.session.flash = {
          type: 'error',
          message: 'User not found.',
        };
        return res.redirect('/auth/profile');
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        req.session.flash = {
          type: 'error',
          message: 'Current password is incorrect.',
        };
        return res.redirect('/auth/profile');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      req.session.flash = {
        type: 'success',
        message: 'Password changed successfully.',
      };

      res.redirect('/auth/profile');
    } catch (error) {
      console.error('Password change error:', error);
      req.session.flash = {
        type: 'error',
        message: 'An error occurred while changing your password.',
      };
      res.redirect('/auth/profile');
    }
  }
}

module.exports = new AuthController();
