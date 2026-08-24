const express = require('express');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean/lib/xss');
const expressRateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const imageService = require('../services/imageService');

function sanitizeInPlace(value) {
  if (!value || typeof value !== 'object') return;
  mongoSanitize.sanitize(value);
}

function applyXssInPlace(target) {
  if (!target || typeof target !== 'object') return;
  const cleaned = xssClean.clean(target);
  if (!cleaned || typeof cleaned !== 'object') return;
  for (const key of Object.keys(target)) {
    delete target[key];
  }
  Object.assign(target, cleaned);
}

const configureMiddleware = (app) => {
  app.use(express.json());
  app.use(cookieParser());

  app.use((req, _res, next) => {
    try {
      sanitizeInPlace(req.body);
      sanitizeInPlace(req.params);
      sanitizeInPlace(req.query);
      applyXssInPlace(req.body);
      applyXssInPlace(req.params);
      applyXssInPlace(req.query);
    } catch (_err) {
      // Express 5 query is a getter; skip rewrite rather than fail the request
    }
    next();
  });

  app.use(cors());

  imageService.ensureDirs();
  app.use(
    '/uploads',
    express.static(imageService.UPLOAD_ROOT, {
      fallthrough: true,
      maxAge: '7d',
      index: false,
    }),
  );

  app.use(
    expressRateLimit({
      windowMs: 10 * 60 * 1000,
      limit: 100,
      skip: (req) =>
        req.method === 'GET' &&
        (req.path.startsWith('/uploads/') ||
          req.path.startsWith('/api/images/') ||
          req.path.startsWith('/api/hub')),
    }),
  );

  app.use(hpp());
};

module.exports = configureMiddleware;
