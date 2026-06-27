const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./blueprintbeing-d9e88-firebase-adminsdk-fbsvc-54b271cfda.json');

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function checkDatabase() {
  try {
    console.log("Trying to connect to the database named 'default'...");
    const db = getFirestore(app, 'default');
    
    const usersSnapshot = await db.collection('users').get();
    console.log(`Success! Found ${usersSnapshot.size} user documents in Firestore.`);
  } catch (error) {
    console.error("Error during check:", error);
  }
}

checkDatabase();
