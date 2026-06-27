const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./blueprintbeing-d9e88-firebase-adminsdk-fbsvc-54b271cfda.json');

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = getFirestore(app, 'default');

async function makeAdmin() {
  try {
    const emailToUpgrade = 'elanwalton@gmail.com'; // We will search for this email
    console.log(`Searching for user with email: ${emailToUpgrade}`);
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(emailToUpgrade);
    console.log(`Found user: ${userRecord.uid}`);

    // 1. Update Firebase Auth Custom Claims
    await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
    console.log("✅ Successfully updated Auth Custom Claims to 'admin'.");

    // 2. Update Firestore Document
    await db.collection('users').doc(userRecord.uid).update({
      role: 'admin',
      updated_at: new Date().toISOString()
    });
    console.log("✅ Successfully updated Firestore document role to 'admin'.");

    console.log("\nYou are now an admin! You may need to log out and log back in for changes to fully apply.");
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log("Couldn't find an account with that email. Attempting to just upgrade the first user found...");
      
      const listUsersResult = await auth.listUsers(1);
      if (listUsersResult.users.length > 0) {
        const user = listUsersResult.users[0];
        console.log(`Upgrading ${user.email} (${user.uid})...`);
        
        await auth.setCustomUserClaims(user.uid, { role: 'admin' });
        await db.collection('users').doc(user.uid).update({ role: 'admin' });
        
        console.log("✅ Successfully upgraded the first user to Admin!");
      } else {
        console.log("No users found in Authentication.");
      }
    } else {
      console.error("Error making admin:", error);
    }
  }
}

makeAdmin();
