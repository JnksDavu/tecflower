import { createServer } from './app.js';
import { env } from './config/env.js';

const app = createServer();

app.listen(env.port, () => {
  console.log(`TecFlower API running on port ${env.port}`);
});
