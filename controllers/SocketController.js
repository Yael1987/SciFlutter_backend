import { Server } from "socket.io";

export default class SocketController {
  constructor(server) {
    this.io = new Server(server, {
      connectionStateRecovery: {}
    });
  }
}