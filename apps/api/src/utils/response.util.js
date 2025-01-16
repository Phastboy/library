"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.response = void 0;
exports.response = {
    send: ({ res, statusCode, message, data = null, error = null, meta = null, timestamp = false, }) => {
        const response = {
            success: statusCode >= 200 && statusCode < 300,
            status: statusCode,
            message,
        };
        if (data)
            Object.assign(response, data);
        if (error)
            response.error = error;
        if (meta)
            response.meta = meta;
        if (timestamp)
            response.timestamp = new Date().toISOString();
        res.status(statusCode).json(response);
    },
};
//# sourceMappingURL=response.util.js.map