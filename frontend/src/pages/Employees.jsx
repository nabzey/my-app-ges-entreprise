import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Plus, UserCheck, UserX, Users, FileText, Download, X, Scan } from 'lucide-react';
import { fetchEmployees, getEntreprise, getCurrentUser, fetchEntreprises, createEmployee, toggleEmployeeStatus, setEntreprise, fetchPayslipsByEmployee, downloadPayslipPDF, confirmEmployeeCode, createUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterContract, setFilterContract] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entreprise, setEntrepriseState] = useState(() => getEntreprise());
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        if (currentUser?.role === 'SUPER_ADMIN') {
          // Fetch all entreprises and their employees
          const entreprisesResponse = await fetchEntreprises();
          const allEntreprises = entreprisesResponse?.data || entreprisesResponse || [];
          let allEmployees = [];
          for (const ent of allEntreprises) {
            const data = await fetchEmployees({ entrepriseId: ent.id });
            const adapted = data.map(e => ({
              id: `${ent.id}-${e.id}`, // unique id
              name: e.nom,
              position: e.poste,
              contractType: e.typeContrat,
              rate: String(e.tauxSalaire),
              status: e.actif ? 'Actif' : 'Inactif',
              company: ent.nom,
              raw: e,
            }));
            allEmployees = allEmployees.concat(adapted);
          }
          setEmployees(allEmployees);
        } else {
          const query = entreprise ? { entrepriseId: entreprise.id } : {};
          const data = await fetchEmployees(query);
          // Adapter les données pour l'affichage
          const adapted = data.map(e => ({
            id: e.id,
            name: e.nom,
            position: e.poste,
            contractType: e.typeContrat,
            rate: String(e.tauxSalaire),
            status: e.actif ? 'Actif' : 'Inactif',
            company: entreprise?.nom || 'Mon Entreprise',
            raw: e,
          }));
          setEmployees(adapted);
        }
      } catch (err) {
        setError(err.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [entreprise, currentUser?.role]);

  useEffect(() => {
    async function loadEntreprises() {
      const currentUser = getCurrentUser();
      if (currentUser?.role === 'SUPER_ADMIN') {
        try {
          const fetched = await fetchEntreprises();
          const entreprisesList = fetched?.data || fetched || [];
          setEntreprises(entreprisesList);
        } catch (err) {
          console.error('Erreur lors du chargement des entreprises:', err);
        }
      }
    }
    loadEntreprises();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            employee.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || employee.status.toLowerCase() === filterStatus;
      const matchesContract = filterContract === 'all' || employee.contractType === filterContract;
      return matchesSearch && matchesStatus && matchesContract;
    });
  }, [employees, searchTerm, filterStatus, filterContract]);

  // Pagination (5 par page)
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageData = filteredEmployees.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, employees]);

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  const contractTypes = ['all', 'FIXE', 'JOURNALIER', 'HONORAIRE'];
  const statuses = ['all', 'Actif', 'Inactif'];

  const professionOptions = [
    'Développeur', 'Comptable', 'Caissier', 'Chauffeur', 'Technicien',
    'Agent', 'Responsable RH', 'Ingénieur', 'Commercial', 'Magasinier',
  ];
  const [showAdd, setShowAdd] = useState(false);
  const [showPayslips, setShowPayslips] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showConfirmCode, setShowConfirmCode] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeePayslips, setEmployeePayslips] = useState([]);
  const [employeeQRCode, setEmployeeQRCode] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [form, setForm] = useState({ nom: '', email: '', password: '', poste: '', typeContrat: 'FIXE', tauxSalaire: '', joursTravailles: '', coordonneesBancaires: '', entrepriseId: '' });
  const [userForm, setUserForm] = useState({ nom: '', email: '', role: 'EMPLOYE' });
  const rateLabel = form.typeContrat === 'FIXE'
    ? 'Salaire mensuel'
    : form.typeContrat === 'JOURNALIER'
      ? 'Taux journalier'
      : 'Salaire horaire';

  const toggleStatus = async (id) => {
    try {
      await toggleEmployeeStatus(id);
      // Refresh list after toggle
      const query = entreprise ? { entrepriseId: entreprise.id } : {};
      const data = await fetchEmployees(query);
      const adapted = data.map(e => ({
        id: e.id,
        name: e.nom,
        position: e.poste,
        contractType: e.typeContrat,
        rate: String(e.tauxSalaire),
        status: e.actif ? 'Actif' : 'Inactif',
        company: entreprise?.nom || 'Mon Entreprise',
        raw: e,
      }));
      setEmployees(adapted);
    } catch (err) {
      setError(err.message || 'Erreur lors du changement de statut');
    }
  };

  const openAddUserModal = (employee) => {
    setSelectedEmployee(employee);
    setUserForm({ nom: employee.name, email: '', role: 'EMPLOYE' });
    setShowAddUser(true);
  };

  const handleCreateUser = async () => {
    try {
      // Only allow admin roles to create users
      const currentUser = getCurrentUser();
      if (!['SUPER_ADMIN', 'ADMIN'].includes(currentUser?.role)) {
        alert('Seuls les administrateurs peuvent créer des utilisateurs.');
        return;
      }
      const payload = {
        nom: userForm.nom,
        email: userForm.email,
        role: userForm.role,
        entrepriseId: entreprise?.id,
      };
      // Call API to create user
      await createUser(payload);
      setShowAddUser(false);
      alert('Utilisateur ajouté avec succès');
    } catch (error) {
      alert('Erreur lors de la création de l\'utilisateur: ' + error.message);
    }
  };

  const viewPayslips = async (employee) => {
    try {
      setLoading(true);
      const payslips = await fetchPayslipsByEmployee(employee.id);
      setSelectedEmployee(employee);
      setEmployeePayslips(payslips);
      setShowPayslips(true);
    } catch (err) {
      alert('Erreur lors du chargement des bulletins: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  const downloadPDF = async (payslipId) => {
    try {
      const blob = await downloadPayslipPDF(payslipId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin_${payslipId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erreur lors du téléchargement: ' + error.message);
    }
  };

  const displayQRCode = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeQRCode(employee.raw.qrCode);
    setShowQRCode(true);
  };

  const openConfirmCodeModal = (employee) => {
    setSelectedEmployee(employee);
    setConfirmationCode('');
    setShowConfirmCode(true);
  };

  const handleConfirmCode = async () => {
    try {
      await confirmEmployeeCode(selectedEmployee.id, confirmationCode);
      setShowConfirmCode(false);
      // Refresh the employee list to show the QR code
      const query = entreprise ? { entrepriseId: entreprise.id } : {};
      const data = await fetchEmployees(query);
      const adapted = data.map(e => ({
        id: e.id,
        name: e.nom,
        position: e.poste,
        contractType: e.typeContrat,
        rate: String(e.tauxSalaire),
        status: e.actif ? 'Actif' : 'Inactif',
        company: entreprise?.nom || 'Mon Entreprise',
        raw: e,
      }));
      setEmployees(adapted);
      alert('Code confirmé, QR code généré !');
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  async function handleCreate() {
    try {
      const currentUser = getCurrentUser();
      let entrepriseId = entreprise?.id;

      // If super admin, allow selecting entrepriseId
      if (currentUser?.role === 'SUPER_ADMIN') {
        // Fetch entreprises for selection if not already fetched
        if (!entreprises.length) {
          const fetched = await fetchEntreprises();
          setEntreprises(fetched);
        }
      }

      const payload = {
        nom: form.nom,
        email: form.email,
        password: form.password || undefined,
        poste: form.poste,
        typeContrat: form.typeContrat,
        tauxSalaire: parseFloat(form.tauxSalaire),
        coordonneesBancaires: form.coordonneesBancaires || null,
        ...(form.typeContrat === 'JOURNALIER' && form.joursTravailles
          ? { joursTravailles: parseInt(form.joursTravailles, 10) }
          : {}),
        entrepriseId: entrepriseId,
      };

      // If super admin and entrepriseId selected in form, override
      if (currentUser?.role === 'SUPER_ADMIN' && form.entrepriseId) {
        payload.entrepriseId = parseInt(form.entrepriseId, 10);
      }

      const result = await createEmployee(payload);
      setShowAdd(false);

      // Reset form
      setForm({ nom: '', email: '', password: '', poste: '', typeContrat: 'FIXE', tauxSalaire: '', joursTravailles: '', coordonneesBancaires: '', entrepriseId: '' });

      // For super admin, if entrepriseId selected, set the entreprise context
      if (currentUser?.role === 'SUPER_ADMIN' && form.entrepriseId) {
        const selectedEntreprise = entreprises.find(ent => ent.id === parseInt(form.entrepriseId));
        if (selectedEntreprise) {
          setEntreprise(selectedEntreprise);
          setEntrepriseState(selectedEntreprise);
        }
      }

      // refresh list
      const query = entreprise ? { entrepriseId: entreprise.id } : {};
      const data = await fetchEmployees(query);
      const adapted = data.map(e => ({
        id: e.id,
        name: e.nom,
        position: e.poste,
        contractType: e.typeContrat,
        rate: String(e.tauxSalaire),
        status: e.actif ? 'Actif' : 'Inactif',
        company: entreprise?.nom || 'Mon Entreprise',
        raw: e,
      }));
      setEmployees(adapted);

      alert('Employé créé avec succès ! Un email avec les identifiants et le QR code a été envoyé.');
    } catch (err) {
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Employés {entreprise ? `- ${entreprise.nom}` : ''}</h1>
          <div className="text-sm text-gray-500">({filteredEmployees.length} employés)</div>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-4 h-4" />
          Ajouter un employé
        </button>
      </div>

      {/* Entreprise Banner (Admin/Caissier) */}
      {entreprise && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img
                src={entreprise.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(entreprise.nom)}&background=0d9488&color=fff`}
                alt={entreprise.nom}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <div className="text-lg font-semibold text-gray-900">{entreprise.nom}</div>
                <div className="text-sm text-gray-500">{entreprise.adresse} • Devise: {entreprise.paiement}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                onClick={() => navigate('/employees')}
              >
                Ajouter un employé
              </button>
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => navigate('/users')}
              >
                Gérer utilisateurs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom ou poste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'Tous les statuts' : status}
              </option>
            ))}
          </select>
          <select
            value={filterContract}
            onChange={(e) => setFilterContract(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {contractTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'Tous les contrats' : type}
              </option>
            ))}
          </select>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Plus de filtres
          </button>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter un employé</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input className="w-full px-3 py-2 border rounded-lg" value={form.nom} onChange={(e)=>setForm({...form, nom:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="w-full px-3 py-2 border rounded-lg" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe (optionnel - généré automatiquement si vide)</label>
                <input type="password" className="w-full px-3 py-2 border rounded-lg" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} placeholder="Laissez vide pour génération automatique" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                <input
                  list="profession-options"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={form.poste}
                  onChange={(e)=>setForm({...form, poste:e.target.value})}
                  placeholder="Sélectionner ou taper une profession"
                />
                <datalist id="profession-options">
                  {professionOptions.map(opt => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de contrat</label>
                  <select className="w-full px-3 py-2 border rounded-lg" value={form.typeContrat} onChange={(e)=>setForm({...form, typeContrat:e.target.value})}>
                    <option value="FIXE">FIXE</option>
                    <option value="JOURNALIER">JOURNALIER</option>
                    <option value="HONORAIRE">HONORAIRE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{rateLabel}</label>
                  <input type="number" min="0" className="w-full px-3 py-2 border rounded-lg" value={form.tauxSalaire} onChange={(e)=>setForm({...form, tauxSalaire:e.target.value})} />
                </div>
              </div>
              {form.typeContrat === 'JOURNALIER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jours travaillés</label>
                  <input type="number" min="1" className="w-full px-3 py-2 border rounded-lg" value={form.joursTravailles} onChange={(e)=>setForm({...form, joursTravailles:e.target.value})} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coordonnées bancaires</label>
                <input className="w-full px-3 py-2 border rounded-lg" value={form.coordonneesBancaires} onChange={(e)=>setForm({...form, coordonneesBancaires:e.target.value})} />
              </div>
              {currentUser?.role === 'SUPER_ADMIN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={form.entrepriseId || ''}
                    onChange={(e) => setForm({ ...form, entrepriseId: e.target.value })}
                  >
                    <option value="">Sélectionner une entreprise</option>
                    {entreprises.map((ent) => (
                      <option key={ent.id} value={ent.id}>
                        {ent.nom}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-2">
              <button className="px-4 py-2" onClick={() => setShowAdd(false)}>Annuler</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={handleCreate}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* Payslips Modal */}
      {showPayslips && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Bulletins de {selectedEmployee.name}
              </h3>
              <button
                onClick={() => setShowPayslips(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {employeePayslips.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun bulletin trouvé</h3>
                  <p className="mt-1 text-sm text-gray-500">Cet employé n'a pas encore de bulletins de paie.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employeePayslips.map((payslip) => (
                    <div key={payslip.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Période: {payslip.payRun?.periode ? new Date(payslip.payRun.periode).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : 'N/A'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Brut: {Number(payslip.brut).toLocaleString()} XOF |
                            Net: {Number(payslip.net).toLocaleString()} XOF |
                            Statut: <span className={`font-medium ${
                              payslip.status === 'PAYE' ? 'text-green-600' :
                              payslip.status === 'PARTIEL' ? 'text-yellow-600' : 'text-gray-600'
                            }`}>{payslip.status}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => downloadPDF(payslip.id)}
                          disabled={payslip.payRun?.status === 'BROUILLON'}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                            payslip.payRun?.status === 'BROUILLON'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                          title={payslip.payRun?.status === 'BROUILLON' ? 'Cycle en brouillon - Téléchargement indisponible' : 'Télécharger PDF'}
                        >
                          <Download className="w-4 h-4" />
                          Télécharger
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">QR Code - {selectedEmployee.name}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="bg-gray-100 p-4 rounded-lg inline-block">
                  <Scan className="w-32 h-32 text-gray-800 mx-auto" />
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Ce QR code permet à {selectedEmployee.name} de se pointer automatiquement.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Code QR :</h4>
                <div className="bg-white p-2 rounded border text-xs font-mono break-all">
                  {employeeQRCode}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Lien de pointage :</h4>
                <div className="bg-white p-2 rounded border text-xs font-mono break-all">
                  {window.location.origin}/employee-pointage
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Les employés peuvent scanner ce QR code ou accéder directement à ce lien pour se pointer.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                className="px-4 py-2"
                onClick={() => setShowQRCode(false)}
              >
                Fermer
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={() => {
                  navigator.clipboard.writeText(employeeQRCode);
                  alert('Code QR copié dans le presse-papiers !');
                }}
              >
                Copier le code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Code Modal */}
      {/* {showConfirmCode && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Confirmer le code pour {selectedEmployee.name}</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Entrez le code de confirmation reçu par email pour générer le QR code.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code de confirmation</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="Entrez le code"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                className="px-4 py-2"
                onClick={() => setShowConfirmCode(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={handleConfirmCode}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ajouter un utilisateur à {selectedEmployee?.name}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  value={userForm.nom}
                  onChange={(e) => setUserForm({ ...userForm, nom: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="EMPLOYE">Employé</option>
                  <option value="CAISSIER">Caissier</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-2">
              <button className="px-4 py-2" onClick={() => setShowAddUser(false)}>Annuler</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={handleCreateUser}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && (
          <div className="p-4 text-sm text-gray-500">Chargement...</div>
        )}
        {error && (
          <div className="p-4 text-sm text-red-600">{error}</div>
        )}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poste</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de contrat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taux/Salaire</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {pageData.map((employee) => (
          <tr key={employee.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openAddUserModal(employee)}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {employee.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {employee.position}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {employee.contractType}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {employee.rate}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {employee.company}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                employee.status === 'Actif' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {employee.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <button
                onClick={(e) => { e.stopPropagation(); toggleStatus(employee.id); }}
                className={`p-1 rounded ${
                  employee.status === 'Actif'
                    ? 'text-red-600 hover:bg-red-100'
                    : 'text-green-600 hover:bg-green-100'
                }`}
                title={employee.status === 'Actif' ? 'Désactiver' : 'Activer'}
              >
                {employee.status === 'Actif' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); viewPayslips(employee); }}
                className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-100"
                title="Voir bulletins"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/employee-pointage'); }}
                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                title="Scanner pointage"
              >
                <Scan className="w-4 h-4" />
              </button>
              <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100">
                Éditer
              </button>
              <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100">
                Supprimer
              </button>
            </td>
          </tr>
        ))}
      </tbody>
        </table>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de <span className="font-medium">{Math.min(filteredEmployees.length, startIndex + pageData.length)}</span> sur{' '}
              <span className="font-medium">{filteredEmployees.length}</span> employés
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Précédent
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 text-sm rounded-lg ${currentPage === i + 1 ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun employé trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">Essayez d'ajuster vos filtres ou ajoutez un nouvel employé.</p>
          </div>
        )}
      </div>
    </div>
  );
}
