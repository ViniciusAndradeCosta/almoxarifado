import express from 'express';
import cors from 'cors';
import routes from './routes/routes.js';
import { iniciarScheduler } from './jobs/alertScheduler.js';
import { startEmailReader } from './jobs/emailReaderScheduler.js'; // <-- Importado aqui no topo!

const app = express();
app.use(express.json());
app.use(cors());
app.use(routes);

iniciarScheduler();
startEmailReader(); 

export default app;