const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');

// Service account key
const apikeys = require('../shr-duty-leave-automate-961d43720b19.json');
const SCOPE = ['https://www.googleapis.com/auth/drive'];

// Configure multer for file uploads
const upload = multer({ dest: path.join(__dirname, '../uploads') });

// Authorize Google Drive
async function authorize() {
    const jwtClient = new google.auth.JWT(
        apikeys.client_email,
        null,
        apikeys.private_key,
        SCOPE
    );
    await jwtClient.authorize();
    return jwtClient;
}

// Upload file to Google Drive
async function uploadFile(authClient, filePath, fileName) {
    const drive = google.drive({ version: 'v3', auth: authClient });
    const fileMetaData = { name: fileName };
    try {
        const file = await drive.files.create({
            resource: fileMetaData,
            media: { body: fs.createReadStream(filePath) },
            fields: 'id',
        });
        await drive.permissions.create({
            fileId: file.data.id,
            requestBody: { role: 'reader', type: 'anyone' },
        });
        return `https://drive.google.com/file/d/${file.data.id}/view`;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

// Vercel serverless function for file upload
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const multerUpload = upload.single('certificate');
        multerUpload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            const filePath = path.join(__dirname, '../uploads', req.file.filename);
            const fileName = req.file.originalname;

            try {
                const authClient = await authorize();
                const fileLink = await uploadFile(authClient, filePath, fileName);
                fs.unlinkSync(filePath); // Clean up uploaded file
                return res.status(200).json({ link: fileLink });
            } catch (error) {
                fs.unlinkSync(filePath);
                return res.status(500).json({ error: error.message });
            }
        });
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
};
