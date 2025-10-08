const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8008';

// Cache for parsed data to avoid creating new objects
let cachedUser = null;
let cachedEntreprise = null;
let lastUserStr = null;
let lastEntrepriseStr = null;

function getToken() {
  return localStorage.getItem('accessToken');
}

export async function apiFetch(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : undefined;

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      // Token manquant, invalide ou accès refusé : forcer la déconnexion
      logout();
      window.location.href = '/login';
      return;
    }
    const message = data?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export async function login(email, password) {
  const payload = { email, password };
  const res = await apiFetch('/users/auth', { method: 'POST', body: payload });
  // Expected shape: { message, data: { user, accesToken, refreshToken } }
  const { data } = res;
  localStorage.setItem('accessToken', data.accesToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  // Pour ADMIN/CAISSIER, on conserve aussi les infos entreprise
  if (data.user?.entreprise) {
    localStorage.setItem('entreprise', JSON.stringify(data.user.entreprise));
  } else {
    localStorage.removeItem('entreprise');
  }
  // Clear cache to force refresh
  cachedUser = null;
  cachedEntreprise = null;
  lastUserStr = null;
  lastEntrepriseStr = null;
  return data;
}

export async function loginEmployee(email, password) {
  const payload = { email, password };
  const res = await apiFetch('/employees/login', { method: 'POST', body: payload });
  // Expected shape: { message, data: { user, token } }
  const { data } = res;
  localStorage.setItem('accessToken', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  // Pour les employés, on conserve aussi les infos entreprise
  if (data.user?.entreprise) {
    localStorage.setItem('entreprise', JSON.stringify(data.user.entreprise));
  } else {
    localStorage.removeItem('entreprise');
  }
  // Clear cache to force refresh
  cachedUser = null;
  cachedEntreprise = null;
  lastUserStr = null;
  lastEntrepriseStr = null;
  return data;
}

export function getEntreprise() {
  const str = localStorage.getItem('entreprise');
  if (str !== lastEntrepriseStr) {
    lastEntrepriseStr = str;
    cachedEntreprise = str ? JSON.parse(str) : null;
  }
  return cachedEntreprise;
}

export function setEntreprise(entreprise) {
  if (entreprise) {
    localStorage.setItem('entreprise', JSON.stringify(entreprise));
  } else {
    localStorage.removeItem('entreprise');
  }
}

export async function fetchEmployees(query = {}) {
  const params = new URLSearchParams(query);
  const res = await apiFetch(`/employees${params.toString() ? `?${params}` : ''}`);
  return res.data; // employees array
}

export async function createEmployee(payload) {
  // payload: { nom, poste, typeContrat: 'FIXE'|'JOURNALIER'|'HONORAIRE', tauxSalaire, coordonneesBancaires?, actif?, entrepriseId? }
  const res = await apiFetch('/employees', { method: 'POST', body: payload });
  return res.data;
}

export async function toggleEmployeeStatus(id) {
  const res = await apiFetch(`/employees/${id}/toggle`, { method: 'PATCH' });
  return res.data;
}

export async function updateEmployee(id, payload) {
  const res = await apiFetch(`/employees/${id}`, { method: 'PUT', body: payload });
  return res.data;
}

export async function deleteEmployee(id) {
  const res = await apiFetch(`/employees/${id}`, { method: 'DELETE' });
  return res.data;
}

export async function confirmEmployeeCode(employeeId, code) {
  const res = await apiFetch(`/employees/${employeeId}/confirm-code`, { method: 'POST', body: { code } });
  return res.data;
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('entreprise');
  // Clear cache
  cachedUser = null;
  cachedEntreprise = null;
  lastUserStr = null;
  lastEntrepriseStr = null;
}

export function getCurrentUser() {
  const str = localStorage.getItem('user');
  if (str !== lastUserStr) {
    lastUserStr = str;
    cachedUser = str ? JSON.parse(str) : null;
  }
  return cachedUser;
}

export async function fetchEntreprises() {
  const res = await apiFetch('/entreprises');
  return res.data;
}

export async function fetchEntrepriseStats(id) {
  const res = await apiFetch(`/entreprises/${id}/stats`);
  return res.data;
}

export async function initEntreprise(id) {
  const res = await apiFetch(`/users/entreprises/${id}/init`, { method: 'POST' });
  return res.data;
}

export async function fetchEntrepriseUsers(id) {
  const res = await apiFetch(`/users/entreprise/${id}/utilisateurs`);
  return res.data; // { admins:[], caissiers:[] }
}

export async function getEntrepriseById(id) {
  const list = await fetchEntreprises();
  return list.find(e => e.id === Number(id));
}

export async function getEntreprisePersonnel(id) {
  const res = await apiFetch(`/users/entreprise/${id}/personnel`);
  return res.data;
}

export async function createEntreprise(payload) {
  const res = await apiFetch('/users/entreprises', { method: 'POST', body: payload });
  return res.data;
}

export async function impersonateEntreprise(id) {
  const res = await apiFetch(`/users/entreprises/${id}/impersonate`, { method: 'POST' });
  const { data } = res;
  // Update localStorage with new token and entreprise
  localStorage.setItem('accessToken', data.accesToken);
  localStorage.setItem('entreprise', JSON.stringify(data.entreprise));
  return data;
}

export async function fetchGlobalStats() {
  const res = await apiFetch('/users/stats');
  return res.data;
}

// Paiements
export async function fetchPayments() {
  const res = await apiFetch('/payments');
  return res.data;
}

export async function fetchPaymentsByEmployee(employeeId) {
  const res = await apiFetch(`/payments/employee/${employeeId}`);
  return res.data;
}

export async function createPayment(payload) {
  const res = await apiFetch('/payments', { method: 'POST', body: payload });
  return res.data;
}

export async function updatePayment(id, payload) {
  const res = await apiFetch(`/payments/${id}`, { method: 'PUT', body: payload });
  return res.data;
}

export async function deletePayment(id) {
  const res = await apiFetch(`/payments/${id}`, { method: 'DELETE' });
  return res.data;
}

export async function downloadPaymentReceipt(id) {
  // Pour le PDF, on peut utiliser une fonction séparée ou fetch directement
  const token = getToken();
  const response = await fetch(`${API_URL}/payments/${id}/pdf`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Erreur lors du téléchargement');
  return response.blob();
}

// Bulletins de paie (pour sélection lors de paiement)
export async function fetchPayslips(query = {}) {
  const params = new URLSearchParams(query);
  const res = await apiFetch(`/payslips${params.toString() ? `?${params}` : ''}`);
  return res.data;
}

export async function fetchPayslipsByEmployee(employeeId) {
  const res = await apiFetch(`/payslips/employee/${employeeId}`);
  return res.data;
}

export async function generateMonthlyPayslips(period) {
  const res = await apiFetch('/payruns', {
    method: 'POST',
    body: period ? { period } : undefined
  });
  return res.data;
}

// PayRuns
export async function fetchPayRuns() {
  const res = await apiFetch('/payruns');
  return res.data;
}

export async function approvePayRun(payRunId) {
  const res = await apiFetch(`/payruns/${payRunId}/approve`, { method: 'PATCH' });
  return res.data;
}

export async function closePayRun(payRunId) {
  const res = await apiFetch(`/payruns/${payRunId}/close`, { method: 'PATCH' });
  return res.data;
}

// Payslips
export async function fetchPendingPayslipsCount() {
  const res = await apiFetch('/payslips/pending-count');
  return res.data;
}

export async function fetchPendingPayslips() {
  const res = await apiFetch('/payslips?status=EN_ATTENTE');
  return res.data;
}

export async function downloadPayslipPDF(payslipId) {
  const token = getToken();
  const response = await fetch(`${API_URL}/payslips/${payslipId}/pdf`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Erreur lors du téléchargement');
  return response.blob();
}

// Change user role (Super Admin only)
export async function changeUserRole(userId, newRole) {
  const res = await apiFetch('/users/change-role', { method: 'POST', body: { userId, newRole } });
  return res.data;
}

// Pointages
export async function createPointage(pointageData) {
  const res = await apiFetch('/pointages', { method: 'POST', body: pointageData });
  return res.data;
}

// Pointage employé (public - sans authentification)
export async function createEmployeePointage(pointageData) {
  const res = await fetch(`${API_URL}/pointages/employee`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pointageData),
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(errorData.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data;
}

export async function getPointages(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  const res = await apiFetch(`/pointages${params.toString() ? `?${params}` : ''}`);
  return res.data;
}

export async function getPointagesByEmployeeAndDate(employeeId, date) {
  const res = await apiFetch(`/pointages/employee/${employeeId}/date/${date}`);
  return res.data;
}

export async function getWorkedHours(employeeId, month, year) {
  const res = await apiFetch(`/pointages/employee/${employeeId}/worked-hours/${month}/${year}`);
  return res.data;
}

export async function getAttendanceSummary(employeeId, month, year) {
  const res = await apiFetch(`/pointages/employee/${employeeId}/attendance/${month}/${year}`);
  return res.data;
}

export async function updatePointage(id, updateData) {
  const res = await apiFetch(`/pointages/${id}`, { method: 'PUT', body: updateData });
  return res.data;
}

export async function deletePointage(id) {
  const res = await apiFetch(`/pointages/${id}`, { method: 'DELETE' });
  return res.data;
}

export async function getLastPointageTimes() {
  const res = await apiFetch('/pointages/last-pointage-times');
  return res.data;
}

export async function createUser(payload) {
  const res = await apiFetch('/users', { method: 'POST', body: payload });
  return res.data;
}

// Pointages et présences
export async function getAttendance(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await apiFetch(`/pointages/attendance${params.toString() ? `?${params}` : ''}`);
  return res.data;
}

export async function markAbsences(date) {
  const res = await apiFetch('/pointages/attendance/mark-absences', { method: 'POST', body: { date } });
  return res.data;
}

// Télécharger le QR code d'un employé
export async function downloadEmployeeQR(employeeId) {
  const token = getToken();
  const response = await fetch(`${API_URL}/employees/${employeeId}/qr`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Erreur lors du téléchargement du QR code');
  return response.blob();
}

// Dashboard
export async function getDashboardData() {
  const res = await apiFetch('/dashboard');
  return res.data;
}

// Employee Dashboard
export async function fetchEmployeeDashboard() {
  const res = await apiFetch('/employees/dashboard');
  return res.data;
}

// Employee Pointages
export async function fetchEmployeePointages() {
  const res = await apiFetch('/employees/pointages');
  return res.data;
}

// Employee Payslips
export async function fetchEmployeePayslips() {
  const res = await apiFetch('/employees/payslips');
  return res.data;
}

// Download Employee Payslip PDF
export async function downloadEmployeePayslipPDF(payslipId) {
  const token = getToken();
  const response = await fetch(`${API_URL}/payslips/my/${payslipId}/pdf`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Erreur lors du téléchargement');
  return response.blob();
}

// Congés
export async function createCongeRequest(data) {
  const res = await apiFetch('/conges/request', { method: 'POST', body: data });
  return res.data;
}

export async function getMyCongeRequests(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await apiFetch(`/conges/my-requests${params.toString() ? `?${params}` : ''}`);
  return res.data;
}

export async function cancelCongeRequest(id) {
  const res = await apiFetch(`/conges/my-requests/${id}/cancel`, { method: 'PATCH' });
  return res.data;
}

export async function getCongeBalance() {
  const res = await apiFetch('/conges/balance');
  return res.data;
}

export async function getAllCongeRequests(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await apiFetch(`/conges${params.toString() ? `?${params}` : ''}`);
  return res.data;
}

export async function approveCongeRequest(id, commentaireRH) {
  const res = await apiFetch(`/conges/${id}/approve`, { method: 'PATCH', body: { commentaireRH } });
  return res.data;
}

export async function rejectCongeRequest(id, commentaireRH) {
  const res = await apiFetch(`/conges/${id}/reject`, { method: 'PATCH', body: { commentaireRH } });
  return res.data;
}

export async function getCongeRequestsByEmployee(employeeId) {
  const res = await apiFetch(`/conges/employee/${employeeId}`);
  return res.data;
}
