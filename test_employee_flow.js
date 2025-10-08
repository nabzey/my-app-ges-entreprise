const API_URL = 'http://localhost:8000';

// Test de connexion employé
async function testEmployeeLogin() {
  console.log('🔐 Test de connexion employé...');
  try {
    const response = await fetch(`${API_URL}/employees/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'marie@demo.com',
        password: 'marie123'
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Connexion réussie');
      console.log('👤 Utilisateur:', data.data.user.nom);
      console.log('🔑 Token reçu');
      return data.data.token;
    } else {
      console.log('❌ Échec de connexion:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    return null;
  }
}

// Test d'accès au dashboard employé
async function testEmployeeDashboard(token) {
  console.log('📊 Test d\'accès au dashboard employé...');
  try {
    const response = await fetch(`${API_URL}/employees/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Dashboard accessible');
      console.log('⏰ Heures travaillées:', data.data.workedHours);
      console.log('📅 Absences:', data.data.absences.length);
      console.log('📋 Emploi du temps disponible:', !!data.data.schedule);
      return true;
    } else {
      console.log('❌ Accès refusé:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    return false;
  }
}

// Test complet
async function runTests() {
  console.log('🚀 Démarrage des tests de flux employé...\n');
  
  const token = await testEmployeeLogin();
  if (token) {
    console.log('');
    await testEmployeeDashboard(token);
  }
  
  console.log('\n✨ Tests terminés');
}

runTests();
