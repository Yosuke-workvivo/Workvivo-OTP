# Workvivo OTP Generator

A web application that generates One-Time Passcodes (OTP) for Workvivo users through API. This application provides a simple web interface where users can enter their email address to receive a secure OTP for authentication.

## What This Application Does

The application consists of:

1. **Web Interface**: A clean, responsive HTML form where users can enter their email address
2. **OTP Generation**: A backend API endpoint that generates secure OTPs using Workvivo's API
3. **JWT Authentication**: Secure token-based authentication using RSA256 signing
4. **Real-time Response**: Immediate feedback showing the generated OTP, expiration time, and login URL

### Key Features

- **Secure OTP Generation**: Uses Workvivo's official API with JWT authentication
- **Web Interface**: User-friendly form with real-time feedback
- **Token Verification**: Built-in JWT token verification for debugging
- **Error Handling**: Comprehensive error handling and user feedback
- **Responsive Design**: Works on desktop and mobile devices

## Requirements

### System Tested on

- **Node.js**: Version 20.19.2
- **npm**: Version 11.0.0
- **Operating System**: AlmaLinux

### Dependencies

The application requires the following npm packages (automatically installed via `npm install`):

- **express**: ^4.18.2 - Web framework for Node.js
- **jsonwebtoken**: ^9.0.0 - JWT token generation and verification
- **request**: ^2.88.2 - HTTP client for API requests
- **uuid**: ^9.0.0 - UUID generation for unique identifiers
- **dotenv**: ^16.5.0 - Environment variable management

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Workvivo Application Configuration
APP_ID=your_workvivo_app_id
ORGANIZATION_ID=your_workvivo_organization_id
ISS=your_issuer_identifier
AUD=your_audience_identifier

# Server Configuration (optional)
PORT=8791
```

#### Environment Variable Details

- **APP_ID**: Your Workvivo application ID (obtained from Workvivo developer portal)
- **ORGANIZATION_ID**: Your Workvivo organization ID (obtained from Workvivo admin panel)
- **ISS**: The issuer identifier for JWT tokens (your organization domain)
- **AUD**: The audience identifier for JWT tokens (Workvivo API endpoint)
- **PORT**: The port number for the web server (defaults to 8791 if not specified)

### Required Files

The application requires the following files to be present in the root directory:

1. **jwtRS256.key**: Private RSA key for JWT signing
2. **jwtRS256.key.pub**: Public RSA key for JWT verification
3. **jwks.json**: JSON Web Key Set containing key metadata

#### File Details

- **jwtRS256.key**: Private RSA-256 key used to sign JWT tokens
- **jwtRS256.key.pub**: Public RSA-256 key used to verify JWT tokens
- **jwks.json**: Contains key metadata including the `kid` (Key ID) used in JWT headers

## Installation and Setup

### 1. Clone or Download the Application

```bash
# If using git
git clone <repository-url>
cd workvivo-otp

# Or download and extract the files manually
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
# Edit .env with your actual values
```

### 4. Verify Required Files

Ensure the following files are present in the same directory:
- `jwtRS256.key`
- `jwtRS256.key.pub`
- `jwks.json`
 * There is a tool "generate-jwks.js" to generate for testing purpose.
 * Seek under tools directory.

### 5. Start the Application

#### Development Mode
```bash
node server.js
```

#### Production Mode (using PM2)
```bash
pm2 start server.js --name "Workvivo-OTP"
```

## Usage

### Starting the Server

1. Open a terminal in the application directory
2. Run: `node server.js`
3. The server will start on port 8791 (or the port specified in your .env file)
4. Access the application at: `http://<your-domain>:8791`

### Using the Application

1. Open your web browser and navigate to the application URL
2. Enter the email address for which you want to generate an OTPs
3. Click "Generate OTP"
4. The application will display:
   - The generated OTP code
   - Expiration time
   - Login URL
   - Associated email and user information

## API Endpoints

### GET `/`
- **Purpose**: Serves the main web interface
- **Response**: HTML page with the OTP generation form

### POST `/generate-otp`
- **Purpose**: Generates an OTP for the provided email
- **Request Body**: `{ "email": "user@example.com" }`
- **Response**: JSON object containing OTP details

#### Success Response (201)
```json
{
  "status": "success",
  "data": {
    "oneTimePasscode": "123456",
    "expiresAt": "2025-03-22T10:30:00.000Z",
    "email": "user@example.com",
    "workvivoUserId": "user_id",
    "organisationId": "org_id",
    "loginUrl": "https://<your-workvivo-domain>.workvivo.com/..."
  },
  "message": "OTP generated successfully"
}
```

#### Error Response (400/500)
```json
{
  "error": "Error message description",
  "details": {}
}
```

## Login users who can use One Time Passcode.
Workvivo calls users who can generate one time passcode, "Unwired" users.
These users need to have "allowOtpPasswordReset" to be "true" inside each users attribute.
Also make sure "authMode" is set to "password".
To modify these values seek to leverage using SCIM API.
https://support.workvivo.com/hc/en-gb/articles/27440099322141-SCIM-API-Direct

## Security Features

- **JWT Authentication**: All API requests are authenticated using RSA256-signed JWT tokens
- **Token Expiration**: JWT tokens expire after 10 minutes
- **Secure Headers**: Proper security headers for API communication
- **Input Validation**: Email validation and sanitization
- **Error Handling**: Secure error responses that don't expose sensitive information

## Troubleshooting

### Common Issues

1. **"Email is required" Error**
   - Ensure the email field is filled in the form

2. **"Error making request" Error**
   - Check your internet connection
   - Verify Workvivo API is accessible
   - Check environment variables are correctly set

3. **"Token verification failed" Error**
   - Ensure `jwtRS256.key` and `jwtRS256.key.pub` files are present
   - Verify the key files are not corrupted

4. **"Invalid response from API" Error**
   - Check Workvivo API documentation for any changes
   - Verify your APP_ID and ORGANIZATION_ID are correct

### Debug Information

The application logs detailed information to the console:
- Generated JWT tokens
- API request details
- Token verification results
- API response data

## Official Documentation

For more information about the Workvivo API, refer to the official documentation:
https://developer.workvivo.com/#0e0bc409-1c94-4d14-88a6-e82cf0c5c032

## License

This application is provided as-is for demonstration purposes. Please refer to Workvivo's terms of service for production use.

## Support

For issues related to:
- **Workvivo API**: Contact Workvivo support
- **Application Code**: Check the troubleshooting section above
- **Configuration**: Verify all environment variables and required files are properly set up 
