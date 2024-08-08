"use strict";

const checkVisitSession = (req, res, next) => {
  const blogId = req.params.id;

  // Check if user already visited this blog in today
  if (req.session.visitedBlogs && req.session.visitedBlogs[blogId]) {
    return next();
  }

  // If its first time, then save it
  if (!req.session.visitedBlogs) {
    req.session.visitedBlogs = {};
  }
  req.session.visitedBlogs[blogId] = true;

  req.isFirstVisit = true; // Give permission to increase countOfVisitor
  next();
};

module.exports = checkVisitSession;
