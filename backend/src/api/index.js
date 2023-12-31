const express = require('express');
const cors = require('cors');
const app = express();
const authMiddleware = require('../auth/authMiddleware');
const {
  init: databaseInit,
  middleware: databaseMiddleware,
} = require('../database/databaseInit');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const helmet = require('helmet');

// Enables CORS
app.use(cors({ origin: true }));

// Initializes and adds the database middleware.
databaseInit().catch((error) => console.error(error));
app.use(databaseMiddleware);

// Configures the authentication middleware
// to set the currentUser to the requests
app.use(authMiddleware);

// Enables Helmet, a set of tools to
// increase security.
app.use(helmet());

// Parses the body of POST/PUT request
// to JSON
app.use(bodyParser.json());

// Configure the Entity routes
const routes = express.Router();
require('./auditLog')(routes);
require('./auth')(routes);
require('./file')(routes);
require('./iam')(routes);
require('./settings')(routes);
require('./customer')(routes);
require('./product')(routes);
require('./order')(routes);

// Add the routes to the /api endpoint
app.use('/hammad/api', routes);

// Exposes the build of the frontend
// to the root / of the server
const frontendDir = path.join(
  __dirname,
  '../../../frontend/build',
);

if (fs.existsSync(frontendDir)) {
  app.use('/', express.static(frontendDir));

  app.get('*', function(request, response) {
    response.sendFile(
      path.resolve(frontendDir, 'index.html'),
    );
  });
}

module.exports = app;
