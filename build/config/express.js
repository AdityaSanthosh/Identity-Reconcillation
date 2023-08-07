"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const createServer = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use(express_1.default.json());
    app.disable('x-powered-by');
    app.get('/health', (_req, res) => {
        res.send('UP');
    });
    return app;
};
exports.createServer = createServer;
//# sourceMappingURL=express.js.map