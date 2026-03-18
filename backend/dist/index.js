"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const colors_1 = __importDefault(require("colors"));
const server_1 = __importDefault(require("./server"));
const http_1 = require("http");
const socket_1 = require("./config/socket");
const port = process.env.PORT || 8080;
// crear servidor HTTP a partir de express
const httpServer = (0, http_1.createServer)(server_1.default);
// inicializar socket.io
(0, socket_1.initSocket)(httpServer);
httpServer.listen(port, () => {
    console.log(colors_1.default.cyan.bold(`🚀 REST API corriendo en el puerto ${port}`));
});
//# sourceMappingURL=index.js.map