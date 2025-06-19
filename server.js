/////////////////////////////////////////////////////////////////////////////////////////////////
// March 22, 2025
// yosuke.sawamura@zoom.us
// Workvivo One Time Passcode demo 
//
// node v20.19.2
// npm 11.0.0
//
// Note)
// 1. Make sure app.js (this) and package.json is present in the same directory.
//  $ npm install
// 2. Run the script
//  $ node app.js
//    or
//  $ pm2 start app.js --name "Workvivo-OPT"
//
// Official document can be found here:
//  https://developer.workvivo.com/#0e0bc409-1c94-4d14-88a6-e82cf0c5c032
// 
/////////////////////////////////////////////////////////////////////////////////////////////////



const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const request = require('request');
const path = require('path');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration from environment variables
const app_id = process.env.APP_ID;
const organization_id = process.env.ORGANIZATION_ID;
const iss = process.env.ISS;
const aud = process.env.AUD;

// Define key file paths
const PRIVATE_KEY_PATH = path.join(__dirname, 'jwtRS256.key');
const PUBLIC_KEY_PATH = path.join(__dirname, 'jwtRS256.key.pub');
const JWKS_PATH = path.join(__dirname, 'jwks.json');

// Helper functions
function generateRandomHexString() {
    return crypto.randomBytes(32).toString('hex');
}

function generateUUID() {
    return uuidv4();
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/generate-otp', async (req, res) => {
    // Set content type to JSON for all responses
    res.setHeader('Content-Type', 'application/json');

    try {
        const email = req.body.email;
        console.log("email: ", email);
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Read the private key
        const privateKey = fs.readFileSync(PRIVATE_KEY_PATH);
        const currentTime = Math.floor(Date.now() / 1000);

        // Read JWKS file to get kid
        const jwks = JSON.parse(fs.readFileSync(JWKS_PATH));
        const kid = jwks.keys[0].kid;

        // Create payload
        const payload = {
            //jti: generateUUID(),
            iss: iss,
            sub: 'app',
            workvivo_id: app_id,
            aud: aud,
            iat: currentTime,
            nbf: currentTime,
            exp: currentTime + (60 * 10),
            state: generateRandomHexString()
        };

        // Sign the token
        const token = jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            header: { kid: kid }
        });

        // Make API request
        const options = {
            'method': 'POST',
            'url': 'https://api.workvivo.io/v1/unwired/users/otp',
            'headers': {
                //'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Workvivo-Id': organization_id,
                'x-workvivo-jwt': token,
                'x-workvivo-jwt-keyid': kid
            },
            body: JSON.stringify({
                "email": email
            })
        };

        console.log();
        console.log('Generated JWT Token:');
        console.log(token);
        console.log();
        console.log("kid:", kid);
        console.log();
        console.log("options: ", options);
        console.log();

        const publicKey = fs.readFileSync(PUBLIC_KEY_PATH);
        try {
            const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
            console.log('\nVerified Token Payload:');
            console.log(JSON.stringify(decoded, null, 2));
        } catch (error) {
            console.error('Token verification failed:', error);
        }
        console.log();

        request(options, function (error, response) {
            //console.log('Response Body:', response.body);
            console.dir(JSON.parse(response.body), { depth: null });
            if (error) {
                return res.status(500).json({ error: 'Error making request: ' + error.message });
            }

            // Parse the response body
            let responseData;
            try {
                responseData = JSON.parse(response.body);
            } catch (e) {
                return res.status(500).json({ error: 'Invalid response from API' });
            }

            // Check if the response is successful (201 is success for this API)
            if (response.statusCode === 201 && responseData.status === 'success') {
                res.json({
                    status: responseData.status,
                    data: {
                        oneTimePasscode: responseData.data.one_time_passcode,
                        expiresAt: new Date(responseData.data.expires_at * 1000).toISOString(),
                        email: responseData.data.email,
                        workvivoUserId: responseData.data.workvivo_user_id,
                        organisationId: responseData.data.organisation_id,
                        loginUrl: responseData.data.login_url
                    },
                    message: responseData.message
                });
            } else {
                res.status(response.statusCode).json({
                    error: responseData.message || 'Failed to generate OTP',
                    details: responseData
                });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 8791;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 