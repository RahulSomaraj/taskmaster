const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');

// Home page - redirect to daily tasks
router.get('/', requireAuth, (req, res) => {
  res.redirect('/tasks/daily');
});

module.exports = router;
