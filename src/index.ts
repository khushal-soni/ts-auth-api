import app from "./middleware/express.middleware";
import Logger from "./utils/logger";
import { vars } from "./config/vars.config";

const { port, env } = vars;

class Server {
    static async start() {
        app.listen(port, () => {
            Logger.log(
                `App running in ${env} mode and server started on port: ${port} `
            );
        });
    }
}

Server.start();
