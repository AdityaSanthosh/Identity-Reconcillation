"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const tslib_1 = require("tslib");
const winston_1 = tslib_1.__importDefault(require("winston"));
const LoggerWrapper = () => {
    return winston_1.default.createLogger({
        transports: [new winston_1.default.transports.Console()],
        exitOnError: false,
    });
};
exports.logger = LoggerWrapper();
//# sourceMappingURL=logger.js.map