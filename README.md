  # 🌱 CROPIC — AI-Powered Crop Disease Detection & Field Monitoring

> **An AI-powered agricultural monitoring platform that uses computer vision, GPS-based location tracking, cloud image storage, and a role-based officer dashboard to help identify crop diseases and manage field observations.**

![CROPIC Banner](https://placehold.co/1200x400?text=CROPIC+-+AI+Crop+Monitoring)

## 📌 Overview

**CROPIC** is a full-stack smart agriculture application designed to assist farmers and agricultural authorities in monitoring crop health.

The system allows users to upload or capture crop images, automatically analyze them using a trained deep-learning model, detect possible plant diseases, record geographical information, and store observations for future monitoring.

The platform also includes an **Officer Portal** where authorized personnel can review submitted observations and approve or reject reports.

### 🎯 Problem

Farmers often need quick access to information about crop diseases, while agricultural authorities need a structured way to monitor field observations.

Traditional inspection can be:

* Time-consuming
* Difficult to scale
* Dependent on manual inspection
* Difficult to track geographically
* Difficult to maintain as historical records

### 💡 Solution

CROPIC combines **AI-based image classification + GPS data + cloud storage + database management + an administrative dashboard** into one platform.

---

# ✨ Key Features

## 🤖 AI Crop Disease Detection

CROPIC uses a custom **ResNet9-based PyTorch deep-learning model** to classify crop images.

The current model supports **38 classes** covering several crops and plant diseases, including:

* Apple
* Blueberry
* Cherry
* Corn
* Grape
* Orange
* Peach
* Bell Pepper
* Potato
* Raspberry
* Soybean
* Squash
* Strawberry
* Tomato

The model returns:

* Predicted disease/class
* Prediction confidence
* Health/disease status

Example:

```text
Image → Preprocessing → ResNet9 → Prediction
                         ↓
                  Disease Class
                         ↓
                 Confidence Score
```

---

## 🖼️ Image Processing

Before AI classification, uploaded images are processed using **rembg** to remove the background and isolate the relevant plant region.

The processed image is then:

1. Converted to RGB
2. Resized
3. Center-cropped
4. Converted into a PyTorch tensor
5. Passed to the trained model

This helps provide a cleaner image input to the classification model.

---

## 📍 GPS Location Capture

The frontend uses the browser's **Geolocation API** to capture the user's current location.

The application records:

* Latitude
* Longitude
* GPS accuracy

This allows crop observations to be associated with a geographical location.

The project also contains a GPS verification service that can calculate the distance between a captured location and a registered farm location.

---

## ☁️ Cloud Image Storage

Uploaded crop images can be stored using **Cloudinary**.

The application stores the resulting image URL along with the observation data.

This avoids storing large image files directly inside the database.

---

## 🗄️ MongoDB Database

CROPIC uses MongoDB for storing application data.

Observation records can contain information such as:

* Image URL
* Disease/classification
* Confidence
* Location
* Coordinates
* Crop growth stage
* Status
* Timestamp
* User information

---

## 👨‍🌾 Farmer Dashboard

The farmer-facing application provides an interface for:

* Uploading crop images
* Viewing image previews
* Capturing GPS location
* Selecting crop growth stage
* Sending images for AI analysis
* Viewing AI results
* Viewing previous submissions
* Monitoring crop health statistics

---

## 🛡️ Officer Portal

CROPIC includes a separate officer-facing interface for reviewing crop observations.

Authorized officers can:

* Log into the officer portal
* View submitted reports
* Search/filter observations
* View crop information
* View submitted images
* View location information
* Review AI confidence
* Approve reports
* Reject reports
* Add remarks

This creates a workflow between **field observations and administrative review**.

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │     CROPIC User      │
                         │   Farmer / Officer   │
                         └──────────┬──────────┘
                                    │
                                    ▼<img width="563" height="590" alt="Screenshot 2025-07-24 184929" src="https://github.com/user-attachments/assets/223ee8b5-49b4-4814-beb7-c35406528d64" />
<img width="1883" height="987" alt="Screenshot 2026-04-12 175441" src="https://github.com/user-attachments/assets/e6d44bcb-cb80-4d9a-a728-0d1752c88f51" />

                         ┌─────────────────────┐
                         │ React + TypeScript  │
                         │     Frontend        │
                         └──────────┬──────────┘
                                    │
                       HTTP / REST API Requests
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
       ┌─────────────────────┐             ┌─────────────────────┐
       │     FastAPI AI      │             │   Node.js / Express │
       │      Service        │             │     Backend API     │
       └──────────┬──────────┘             └──────────┬──────────┘
                  │                                   │
                  ▼                                   ▼
       ┌─────────────────────┐             ┌─────────────────────┐
       │  PyTorch ResNet9    │             │      MongoDB        │
       │ Disease Classifier  │             │      Database       │
       └──────────┬──────────┘             └─────────────────────┘
                  │
                  ▼
       ┌─────────────────────┐
       │      Cloudinary     │
       │    Image Storage    │
       └─────────────────────┘
```

---

# 🔄 Application Workflow

### 1. Capture / Upload

The farmer selects a crop image from their device.

### 2. GPS Capture

The browser requests the user's location and captures the current coordinates.

### 3. Image Preprocessing

The backend receives the image and processes it before inference.

```text
Original Image
      ↓
Background Removal
      ↓
RGB Conversion
      ↓
Resize
      ↓
Center Crop
      ↓
Tensor Conversion
```

### 4. AI Classification

The processed image is passed through the trained ResNet9 model.

```text
Input Image
     ↓
ResNet9
     ↓
38 Possible Classes
     ↓
Highest Probability
     ↓
Disease / Healthy Result
```

### 5. Result Generation

The API returns the predicted class and confidence score.

### 6. Database Storage

The observation is stored in MongoDB together with metadata.

### 7. Officer Review

The observation can be reviewed through the Officer Portal.

### 8. Decision

An authorized officer can mark the report as:

* Pending
* Approved
* Rejected

---

# 🧠 AI Model

CROPIC currently uses a custom **ResNet9 architecture implemented in PyTorch**.

The architecture contains:

* Convolutional blocks
* Batch Normalization
* ReLU activation
* Max Pooling
* Residual connections
* Adaptive Average Pooling
* Fully connected classification layer

Simplified architecture:

```text
Input Image
     │
     ▼
Conv Block
     │
     ▼
Conv Block + Pool
     │
     ▼
Residual Block
     │
     ▼
Conv Block + Pool
     │
     ▼
Conv Block + Pool
     │
     ▼
Residual Block
     │
     ▼
Adaptive Average Pooling
     │
     ▼
Fully Connected Layer
     │
     ▼
38 Classes
```

The trained weights are loaded from:

```text
plant_disease_model.pth
```

---

# 🔐 Security Components

The project contains several security-related components.

### Password Hashing

User passwords are hashed using **bcrypt** before being stored.

### JWT Authentication

The backend supports JSON Web Token authentication for user sessions.

### Role-Based Users

The system supports:

```text
farmer
authority
```

### Login Rate Limiting

The Express backend includes rate limiting for login requests to reduce excessive authentication attempts.

### Image Hashing

The project includes a SHA-256 image hashing service that can generate a unique digital fingerprint for an uploaded image.

```text
Image File
    ↓
SHA-256
    ↓
Unique Hash
```

### Location Verification

The project contains a GPS verification service that calculates the distance between the captured coordinates and registered farm coordinates.

---

# 🛠️ Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* React Leaflet
* Leaflet
* Framer Motion
* Lucide React

## Backend

* Node.js
* Express.js
* FastAPI
* Python
* Uvicorn

## AI / Machine Learning

* PyTorch
* Torchvision
* ResNet9
* rembg
* Pillow

## Database

* MongoDB
* Mongoose
* Motor

## Cloud

* Cloudinary

## Authentication & Security

* JWT
* bcrypt
* Express Rate Limit
* SHA-256 hashing

---

# 📁 Project Structure

```text
CROPIC/
│
├── backend/
│   │
│   ├── main.py
│   ├── server.js
│   ├── package.json
│   │
│   └── src/
│       ├── config/
│       │   ├── cloudinary.js
│       │   └── db.js
│       │
│       ├── controllers/
│       │   ├── authController.js
│       │   └── uploadController.js
│       │
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   ├── errorMiddleware.js
│       │   └── rateLimiter.js
│       │
│       ├── models/
│       │   ├── Image.js
│       │   └── User.js
│       │
│       ├── routes/
│       │   ├── authRoutes.js
│       │   └── uploadRoutes.js
│       │
│       ├── services/
│       │   ├── antifakeService.js
│       │   ├── gpsService.js
│       │   ├── hashService.js
│       │   └── imageService.js
│       │
│       └── utils/
│           ├── distanceCalc.js
│           └── timeValidator.js
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── OfficerPortal.tsx
│   │
│   └── package.json
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* Python 3.10+
* MongoDB / MongoDB Atlas
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/CROPIC.git

cd CROPIC
```

---

# ⚙️ Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install Node dependencies:

```bash
npm install
```

Install Python dependencies required by the AI service:

```bash
pip install fastapi uvicorn torch torchvision pillow python-multipart python-dotenv pymongo motor cloudinary rembg
```

Create a `.env` file:

```env
PORT=8000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret
```

### ⚠️ Important

Never commit your `.env` file.

Add it to `.gitignore`:

```gitignore
.env
node_modules/
__pycache__/
*.pyc
```

Also ensure that no MongoDB passwords, API keys, JWT secrets, or Cloudinary credentials are hard-coded inside the source code.

---

# ▶️ Start the Backend

### Node.js API

```bash
npm run dev
```

### AI FastAPI Service

From the backend directory:

```bash
python main.py
```

The AI API runs on:

```text
http://localhost:8000
```

---

# 💻 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide a local development URL, normally similar to:

```text
http://localhost:5173
```

---

# 🔌 Main API Endpoints

## AI Analysis

```http
POST /api/analyze
```

Accepts a crop image and returns the AI classification.

Example response:

```json
{
  "filename": "tomato.jpg",
  "status": "Disease Detected",
  "disease": "Tomato___Early_blight",
  "confidence": 94.2,
  "image": "cloudinary-image-url",
  "recommendation": "Detected: Tomato___Early_blight"
}
```

---

## Dashboard

```http
GET /api/user/dashboard
```

Returns dashboard statistics and previous observations.

---

## Officer Reports

```http
GET /api/officer/reports
```

Returns crop reports available for officer review.

---

## Update Report Status

```http
PATCH /api/reports/:report_id/status
```

Used to update a report's status.

---

## Authentication

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

---

# 📊 Example Classification

```text
Crop Image
     ↓
AI Processing
     ↓
Tomato___Late_blight
     ↓
Confidence: 92.4%
     ↓
Status: Disease Detected
```

---

# 🎓 Project Objectives

The main objectives of CROPIC are:

1. Develop an AI-based crop disease detection system.
2. Provide farmers with a simple image-based disease assessment interface.
3. Associate crop observations with geographical information.
4. Store crop observations for future monitoring.
5. Provide authorities with an observation review dashboard.
6. Combine machine learning with a full-stack web application.
7. Introduce security mechanisms such as authentication, password hashing, rate limiting, and image hashing.

---

# 🔮 Future Improvements

The current project provides the foundation for a larger agricultural intelligence platform.

Possible future improvements include:

* 📱 Native Android/iOS application
* 🌦️ Weather-based crop risk analysis
* 🌾 More crop and disease classes
* 🧠 Improved deep-learning model accuracy
* 📈 Historical crop-health analytics
* 🗺️ Interactive field-level disease maps
* 🔍 Advanced image authenticity detection
* 🛰️ Satellite-based crop monitoring
* 🔔 Disease outbreak notifications
* 🌐 Multi-language support for farmers
* 📡 Offline-first field reporting
* 💊 Disease-specific treatment recommendations
* 👨‍🌾 Farmer-to-agriculture-officer communication
* 📊 Regional disease trend analysis

---

# ⚠️ Current Limitations

CROPIC is currently a development-stage project.

Some components are implemented as foundations for future functionality.

For example, the image authenticity service currently acts as a placeholder and can be extended with real EXIF/forensic verification.

Similarly, GPS verification functionality exists in the backend services but can be further integrated into the complete submission workflow.

The AI model's performance should also be evaluated on real-world field images before being used for agricultural decision-making.

---

# 🌍 Potential Impact

CROPIC demonstrates how **Artificial Intelligence, Computer Vision, Geolocation, Cloud Computing, and Web Technologies** can work together to create a practical smart-agriculture platform.

The system can potentially help:

**Farmers**
→ Quickly assess crop images

**Agricultural Officers**
→ Review field observations

**Organizations**
→ Maintain centralized crop-health records

**Researchers**
→ Analyze disease patterns and historical observations

---

# 👨‍💻 Author

**Amaan Sayed**

Computer Science / IoT / Cybersecurity

---

# ⭐ Project Highlights

```text
🤖 AI-powered crop disease classification
🌱 38-class plant disease model
📍 GPS-based field monitoring
☁️ Cloud image storage
🗄️ MongoDB database
🔐 JWT + bcrypt authentication
🛡️ Rate limiting & image hashing
👨‍🌾 Farmer dashboard
👮 Officer review portal
⚡ React + TypeScript frontend
🐍 FastAPI + PyTorch AI service
🟢 Node.js + Express backend
```

---

## 📜 License

This project is developed for educational and research purposes.

---
