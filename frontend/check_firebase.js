const admin = require('firebase-admin');
const serviceAccount = require('./blueprintbeing-d9e88-firebase-adminsdk-fbsvc-54b271cfda.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

async function checkDatabase() {
  try {
    console.log("1. Checking Firebase Authentication users...");
    const listUsersResult = await auth.listUsers();
    console.log(`   Found ${listUsersResult.users.length} users in Auth.`);
    listUsersResult.users.forEach((userRecord) => {
      console.log(`   - [Auth] UID: ${userRecord.uid}, Email: ${userRecord.email}`);
    });

    console.log("\n2. Checking Firestore 'users' collection...");
    const usersSnapshot = await db.collection('users').get();
    console.log(`   Found ${usersSnapshot.size} user documents in Firestore.`);
    usersSnapshot.forEach(doc => {
      console.log(`   - [DB] UID: ${doc.id}, Data:`, doc.data());
    });

    console.log("\nDone!");
  } catch (error) {
    console.error("Error during check:", error);
  }
}

checkDatabase();
