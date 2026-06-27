const { google } = require('googleapis');
const serviceAccount = require('./blueprintbeing-d9e88-firebase-adminsdk-fbsvc-54b271cfda.json');

async function listDatabases() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/datastore', 'https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const projectId = serviceAccount.project_id;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases`;

    console.log(`Fetching databases for project: ${projectId}...`);
    const res = await client.request({ url });
    console.log("Databases found:");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error("Error listing databases:");
    console.error(error.response ? error.response.data : error.message);
  }
}

listDatabases();
