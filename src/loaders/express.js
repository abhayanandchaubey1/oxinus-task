import cors from 'cors';
import bodyParser from 'body-parser';
import logger from 'morgan';
import routes from '../routes';
import { HttpException, messageResponse, formatErrorResponse } from '../utils';

export default ({ app }) => {
  app.use(logger(':method :url :status :response-time ms'));

  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable('trust proxy');

  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors({
    methods: 'GET,PUT,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,X-Requested-With,Content-Length,Accept,Origin',
    exposedHeaders: 'Authorization',
    credentials: true,
  }));

  // Middleware that transforms the raw string of req.body into json
  app.use(bodyParser.json());
  // Middleware to handle form data requests for file upload
  app.use(bodyParser.urlencoded({ extended: true }));

  // Load API routes
  app.use(routes());

  // / catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new HttpException.NotFound(formatErrorResponse('general', 'notFound'));
    next(err);
  });

  // / error handlers
  /* eslint-disable-next-line no-unused-vars */
  app.use((err, req, res, next) => {
    // console.error(err);
    res.status(err.status || 500);
    res.json(messageResponse(err.message));
  });
};
