"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const moduleAlias = tslib_1.__importStar(require("module-alias"));
const sourcePath = process.env.NODE_ENV === 'development' ? 'src' : __dirname;
moduleAlias.addAliases({
    '@server': sourcePath,
    '@config': `${sourcePath}/config`,
    '@domain': `${sourcePath}/domain`,
});
const express_1 = require("@config/express");
const http_1 = tslib_1.__importDefault(require("http"));
const logger_1 = require("@config/logger");
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || '8000';
function startServer() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.createServer)();
        const server = http_1.default.createServer(app).listen({ host, port }, () => {
            const addressInfo = server.address();
            logger_1.logger.info(`Server ready at http://${addressInfo.address}:${addressInfo.port}`);
        });
        const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
        signalTraps.forEach((type) => {
            process.once(type, () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                logger_1.logger.info(`process.once ${type}`);
                server.close(() => {
                    logger_1.logger.debug('HTTP server closed');
                });
            }));
        });
    });
}
startServer();
//# sourceMappingURL=index.js.map