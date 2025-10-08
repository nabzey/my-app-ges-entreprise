"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantPrisma = getTenantPrisma;
const client_1 = require("@prisma/client");
let prismaInstance;
function getTenantPrisma() {
    if (!prismaInstance) {
        prismaInstance = new client_1.PrismaClient();
    }
    return prismaInstance;
}
//# sourceMappingURL=tenantPrisma.js.map