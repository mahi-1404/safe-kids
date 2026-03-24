"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const socket_1 = require("./config/socket");
const auth_1 = __importDefault(require("./routes/auth"));
const child_1 = __importDefault(require("./routes/child"));
const location_1 = __importDefault(require("./routes/location"));
const alert_1 = __importDefault(require("./routes/alert"));
const command_1 = __importDefault(require("./routes/command"));
const screentime_1 = __importDefault(require("./routes/screentime"));
const geofence_1 = __importDefault(require("./routes/geofence"));
const reports_1 = __importDefault(require("./routes/reports"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/child', child_1.default);
app.use('/api/location', location_1.default);
app.use('/api/alert', alert_1.default);
app.use('/api/command', command_1.default);
app.use('/api/screentime', screentime_1.default);
app.use('/api/geofence', geofence_1.default);
app.use('/api/reports', reports_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'SafeKids backend running' });
});
// Socket.io for real-time
(0, socket_1.initSocket)(server);
// Start server
const PORT = process.env.PORT || 5000;
(0, database_1.connectDB)().then(() => {
    server.listen(PORT, () => {
        console.log(`SafeKids backend running on port ${PORT}`);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map