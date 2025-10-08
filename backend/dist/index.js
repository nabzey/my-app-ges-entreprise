"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const UsersRoute_1 = __importDefault(require("./routes/UsersRoute"));
const EmployeesRoute_1 = __importDefault(require("./routes/EmployeesRoute"));
const PayRunsRoute_1 = __importDefault(require("./routes/PayRunsRoute"));
const PayslipsRoute_1 = __importDefault(require("./routes/PayslipsRoute"));
const PaymentsRoute_1 = __importDefault(require("./routes/PaymentsRoute"));
const PointageRoute_1 = __importDefault(require("./routes/PointageRoute"));
const DashboardRoute_1 = __importDefault(require("./routes/DashboardRoute"));
const EntreprisesRoute_1 = __importDefault(require("./routes/EntreprisesRoute"));
const CongeRoutes_1 = __importDefault(require("./routes/CongeRoutes"));
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        process.env.FRONTEND_URL || 'http://localhost:5174'
    ],
    credentials: true,
}));
// Routes
app.use('/users', UsersRoute_1.default);
app.use('/employees', EmployeesRoute_1.default);
app.use('/payruns', PayRunsRoute_1.default);
app.use('/payslips', PayslipsRoute_1.default);
app.use('/payments', PaymentsRoute_1.default);
app.use('/pointages', PointageRoute_1.default);
app.use('/dashboard', DashboardRoute_1.default);
app.use('/entreprises', EntreprisesRoute_1.default);
app.use('/conges', CongeRoutes_1.default);
exports.default = app;
//# sourceMappingURL=index.js.map