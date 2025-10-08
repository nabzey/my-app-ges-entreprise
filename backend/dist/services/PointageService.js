"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointageService = void 0;
const PointageRepository_1 = require("../repositories/PointageRepository");
class PointageService {
    repo = new PointageRepository_1.PointageRepository();
    async create(pointageData, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        // Validate employee exists and is active
        const employee = await this.repo.prisma.employee.findUnique({
            where: { id: pointageData.employeeId }
        });
        if (!employee) {
            throw new Error('Employé non trouvé');
        }
        if (!employee.actif) {
            throw new Error('Employé inactif');
        }
        if (employee.entrepriseId !== entrepriseId) {
            throw new Error('Employé n\'appartient pas à cette entreprise');
        }
        const now = pointageData.heure || new Date();
        const data = {
            employeeId: pointageData.employeeId,
            date: now,
            type: pointageData.type,
            heure: now,
            entrepriseId: entrepriseId
        };
        const pointage = await this.repo.create(data);
        // If it's an arrival pointage, update/create attendance record
        if (pointageData.type === 'ARRIVEE') {
            await this.updateAttendanceRecord(pointageData.employeeId, now, entrepriseId);
        }
        return pointage;
    }
    async getLastPointageTimeForEmployees(user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        return await this.repo.getLastPointageTimeForEmployees(entrepriseId);
    }
    async findById(id, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        return await this.repo.findById(id);
    }
    async findAll(filters, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        return await this.repo.findAll({ ...filters, entrepriseId });
    }
    async findByEmployeeAndDate(employeeId, date, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        return await this.repo.findByEmployeeAndDate(employeeId, date);
    }
    async calculateWorkedHours(employeeId, month, year, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        return await this.repo.calculateWorkedHours(employeeId, month, year);
    }
    async getEmployeeAttendanceSummary(employeeId, month, year, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        const totalWorkedHours = await this.repo.calculateWorkedHours(employeeId, month, year);
        // Calculate working days in month
        const daysInMonth = new Date(year, month, 0).getDate();
        const workingDays = this.getWorkingDaysInMonth(year, month);
        // Count actual worked days (days with pointages)
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
        const workedDays = await this.repo.prisma.pointage.groupBy({
            by: ['date'],
            where: {
                employeeId,
                type: 'ARRIVEE',
                heure: {
                    gte: startOfMonth,
                    lte: endOfMonth
                },
                employee: { entrepriseId }
            },
            _count: true
        });
        const totalWorkedDays = workedDays.length;
        const averageHoursPerDay = totalWorkedDays > 0 ? totalWorkedHours / totalWorkedDays : 0;
        const attendanceRate = workingDays > 0 ? (totalWorkedDays / workingDays) * 100 : 0;
        return {
            totalWorkedHours,
            totalWorkedDays,
            averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
            attendanceRate: Math.round(attendanceRate * 100) / 100
        };
    }
    getWorkingDaysInMonth(year, month) {
        const daysInMonth = new Date(year, month, 0).getDate();
        let workingDays = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay();
            // Consider Monday to Friday as working days (0 = Sunday, 6 = Saturday)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                workingDays++;
            }
        }
        return workingDays;
    }
    async update(id, data, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        return await this.repo.update(id, data);
    }
    async delete(id, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        return await this.repo.delete(id);
    }
    async updateAttendanceRecord(employeeId, arrivalTime, entrepriseId) {
        // Get the date (YYYY-MM-DD format)
        const date = new Date(arrivalTime.getFullYear(), arrivalTime.getMonth(), arrivalTime.getDate());
        // Check if attendance record already exists for this date
        const existingAttendance = await this.repo.prisma.attendance.findUnique({
            where: {
                employeeId_date: {
                    employeeId,
                    date
                }
            }
        });
        // Determine status based on arrival time
        const hour = arrivalTime.getHours();
        const minute = arrivalTime.getMinutes();
        const timeInMinutes = hour * 60 + minute;
        const cutoffTime = 8 * 60 + 30; // 8:30 AM in minutes
        let status = timeInMinutes <= cutoffTime ? 'PRESENT' : 'RETARD';
        if (existingAttendance) {
            // Update existing record
            await this.repo.prisma.attendance.update({
                where: { id: existingAttendance.id },
                data: {
                    status,
                    arrivalTime
                }
            });
        }
        else {
            // Create new record
            await this.repo.prisma.attendance.create({
                data: {
                    employeeId,
                    date,
                    status,
                    arrivalTime,
                    entrepriseId
                }
            });
        }
    }
    async markAbsencesForDate(date, user) {
        const entrepriseId = user.entrepriseId;
        if (!entrepriseId) {
            throw new Error('Entreprise non sélectionnée');
        }
        // Get all active employees for this entreprise
        const employees = await this.repo.prisma.employee.findMany({
            where: { actif: true, entrepriseId }
        });
        // For each employee, check if they have an attendance record for the date
        for (const employee of employees) {
            const attendanceDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const existingAttendance = await this.repo.prisma.attendance.findUnique({
                where: {
                    employeeId_date: {
                        employeeId: employee.id,
                        date: attendanceDate
                    }
                }
            });
            if (!existingAttendance) {
                // Mark as absent
                await this.repo.prisma.attendance.create({
                    data: {
                        employeeId: employee.id,
                        date: attendanceDate,
                        status: 'ABSENT',
                        entrepriseId
                    }
                });
            }
        }
    }
}
exports.PointageService = PointageService;
//# sourceMappingURL=PointageService.js.map