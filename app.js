const { google } = require('googleapis');
const express = require('express');
const cors = require('cors');
const app = express();

// Use the port from the environment variable or default to 8080
const port = process.env.PORT || 8080;

// Enable CORS for your web app's domain
app.use(cors({ origin: 'https://hypeplify.com' }));

// Log startup
console.log('App starting...');

// Load the service account credentials from the environment variable
console.log('Loading service account credentials...');
const { GOOGLE_CREDENTIALS } = process.env;
if (!GOOGLE_CREDENTIALS) {
    throw new Error('GOOGLE_CREDENTIALS environment variable not set');
}

const credentials = JSON.parse(GOOGLE_CREDENTIALS); // Parse the environment variable

// Initialize the Google Sheets API client
console.log('Initializing Google Sheets API client...');
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

async function fetchData() {
    try {
        console.log('Fetching data from Google Sheets...');
        // Authenticate and create a Sheets client
        const authClient = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        // Define the spreadsheet IDs and ranges
        const keywordsSheetId = '1NYs_UpRBCkX6uoEia97br0hnWj4mgpqN39MiV34kKKI'; // Google Sheet 1
        const sentimentSheetId = '1Y91qmdS15I-LhZm7uh4XTi_daFAq-QMusXrfCuZEZpg'; // Google Sheet 2

        const keywordsRange = 'AI Tracker!A:P'; // Tab and range for keywords data
        const sentimentOverviewRange = 'Overview!A:H'; // Tab and range for sentiment data
        const sentimentVotesRange = 'Sentiment!A:C'; // Tab and range for sentiment votes

        // Fetch keywords data
        const keywordsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: keywordsSheetId,
            range: keywordsRange,
        });
        const keywordsData = keywordsResponse.data.values;

        // Fetch sentiment overview data
        const sentimentOverviewResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: sentimentSheetId,
            range: sentimentOverviewRange,
        });
        const sentimentOverviewData = sentimentOverviewResponse.data.values;

        // Fetch sentiment votes data
        const sentimentVotesResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: sentimentSheetId,
            range: sentimentVotesRange,
        });
        const sentimentVotesData = sentimentVotesResponse.data.values;

        // Return the fetched data
        return {
            keywordsData,
            sentimentOverviewData,
            sentimentVotesData,
        };

    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Define a route to serve the data
app.get('/', async (req, res) => {
    try {
        console.log('Handling request...');
        const data = await fetchData();
        res.json(data); // Send the fetched data as a JSON response
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).send('Error fetching data from Google Sheets');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
