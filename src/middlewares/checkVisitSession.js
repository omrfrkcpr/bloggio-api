"use strict";

const checkVisitSession = (req, res, next) => {
  const blogId = req.params.id;
  const userId = req.user._id.toString(); // Ensure user ID is a string

  // Log session data to troubleshoot
  console.log("Session data before:", req.session);

  // Initialize visitedBlogs for the session if it doesn't exist
  if (!req.session.visitedBlogs) {
    req.session.visitedBlogs = {};
  }

  // Initialize the user's visited blogs if it doesn't exist
  if (!req.session.visitedBlogs[userId]) {
    req.session.visitedBlogs[userId] = {};
  }

  // Check if the blog has already been visited by the user
  if (req.session.visitedBlogs[userId][blogId]) {
    req.isFirstVisit = false; // Blog has been visited before
  } else {
    req.session.visitedBlogs[userId][blogId] = true;
    req.isFirstVisit = true; // First time visit for this blog
  }

  console.log("Session data after:", req.session);

  next();
};

module.exports = checkVisitSession;
