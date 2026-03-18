import colors from 'colors';
import app from "./server";
import { createServer } from 'http';
import { initSocket } from './config/socket';

const port = process.env.PORT || 8080;

// crear servidor HTTP a partir de express
const httpServer = createServer(app);

// inicializar socket.io
initSocket(httpServer);

httpServer.listen(port, () => {
  console.log(colors.cyan.bold(`🚀 REST API corriendo en el puerto ${port}`));
});
