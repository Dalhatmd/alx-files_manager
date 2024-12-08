import express from 'express';
const app = express();
import routes from './routes/index.js';

app.use('/', routes);

const port = 5000 || process.env.PORT;

app.listen(port, '0.0.0.0');