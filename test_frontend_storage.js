// Test du stockage et récupération des données entreprise dans le frontend
console.log('=== Test Frontend Storage ===');

// Simuler la réponse du backend
const mockResponse = {
  data: {
    user: {
      id: 2,
      email: "admin@demo.com",
      role: "ADMIN",
      nom: "Admin Démo",
      entreprise: {
        id: 1,
        nom: "Entreprise Démo",
        logo: null,
        adresse: "Dakar, Sénégal",
        paiement: "XOF",
        dbName: "tenante"
      }
    },
    accesToken: "mock_token",
    refreshToken: "mock_refresh_token"
  }
};

// Simuler le stockage (comme dans login())
console.log('1. Stockage des données...');
localStorage.setItem('accessToken', mockResponse.data.accesToken);
localStorage.setItem('refreshToken', mockResponse.data.refreshToken);
localStorage.setItem('user', JSON.stringify(mockResponse.data.user));

if (mockResponse.data.user?.entreprise) {
  localStorage.setItem('entreprise', JSON.stringify(mockResponse.data.user.entreprise));
  console.log('✅ Entreprise stockée dans localStorage');
} else {
  localStorage.removeItem('entreprise');
  console.log('❌ Pas d\'entreprise à stocker');
}

// Simuler la récupération (comme dans getEntreprise())
console.log('\n2. Récupération des données...');

let cachedUser = null;
let cachedEntreprise = null;
let lastUserStr = null;
let lastEntrepriseStr = null;

function getEntreprise() {
  const str = localStorage.getItem('entreprise');
  if (str !== lastEntrepriseStr) {
    lastEntrepriseStr = str;
    cachedEntreprise = str ? JSON.parse(str) : null;
  }
  return cachedEntreprise;
}

function getCurrentUser() {
  const str = localStorage.getItem('user');
  if (str !== lastUserStr) {
    lastUserStr = str;
    cachedUser = str ? JSON.parse(str) : null;
  }
  return cachedUser;
}

const entreprise = getEntreprise();
const user = getCurrentUser();

console.log('Utilisateur récupéré:', user?.nom);
console.log('Entreprise récupérée:', entreprise?.nom);
console.log('Adresse entreprise:', entreprise?.adresse);

if (entreprise) {
  console.log('✅ Les données entreprise sont correctement récupérées');
} else {
  console.log('❌ Les données entreprise ne sont pas récupérées');
}

// Vérifier le contenu du localStorage
console.log('\n3. Contenu localStorage:');
console.log('user:', localStorage.getItem('user'));
console.log('entreprise:', localStorage.getItem('entreprise'));

console.log('\n=== Fin Test ===');
