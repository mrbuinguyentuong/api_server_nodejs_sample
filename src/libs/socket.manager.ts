import * as Io from "socket.io";
import * as socketIoJwt from "socketio-jwt";
import { LogManager } from "../libs";
import config from "../configs/config";

class SocketManager {
    public io;
    public className = "SocketManager";

    constructor() {

    }

    public init(app) {
        let io = Io.listen(app);
        const fnName = "init";

        io.use(socketIoJwt.authorize({
            secret: config.jwt.secretKey,
            timeout: config.jwt.timeout,
            handshake: true,
            transports: ["websocket"]
        }));
        /* Catch event user connection */
        io.on("connection", (socket: any) => {
            LogManager.logInfo(this.className, fnName, "A user was connected");
            const { id } = socket.decoded_token;
            /* Join user to room */
            this.joinRoom(socket, id);

            /* Handler user disconnect socket */
            socket.on("disconnect", (reason) => {
                LogManager.logDebug(this.className, fnName, "A user was disconnect " + reason);
            });

            /* Handler when user disconnecting server */
            socket.on("disconnecting", () => {

            });

            /* Handler user connect socket error */
            socket.on("error", error => {
                LogManager.logWarn(this.className, fnName, "A user connect server fail " + error);
            });
        });
        this.io = io;
    }

    private joinRoom(socket, roomName) {
        const fnName = "joinRoom";
        socket.join(roomName, () => {
            let room = Object.keys(socket.rooms);
            LogManager.logDebug(this.className, fnName, room);
        });

        socket.emit("hello", {
            message: "Hello"
        });
    }
}

export default new SocketManager();