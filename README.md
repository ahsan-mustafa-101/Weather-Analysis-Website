# Weather-Analysis-Website
A full-stack weather forecasting web application that provides detailed weather data, 24-hour forecasts, interactive weather analytics, location-based weather detection, a 3D interactive Earth, and an AI-powered chatbot using real-time weather data.

## Preview
<p align="center">
  <img width="1917" height="1017" alt="image" src="https://github.com/user-attachments/assets/81aaf4de-65e0-49ca-9c7d-008a34329b72" />
</p>
   
<p align="center">
  <em>Figure 1: WeatherDrop startup interface</em>
</p>
<br>

<p align="center">
  <img width="1917" height="1010" alt="image" src="https://github.com/user-attachments/assets/604ea07e-ea13-4ba3-8470-ad363bb5ec14" />
</p>

<p align="center">
  <em>Figure 2: User current location weather forecast</em>
</p>
<br>

<p align="center">
  <img width="1917" height="1012" alt="image" src="https://github.com/user-attachments/assets/80d899f0-faa0-49cc-b406-4df61fd42036" />
</p>

<p align="center">
  <em>Figure 3: 24-hour weather forecast along with other weather insights</em>
</p>
<br>

<p align="center">
  <img width="1917" height="1017" alt="image" src="https://github.com/user-attachments/assets/684215cf-8ecf-4052-87f3-e57c519d7d5c" />
</p>

<p align="center">
  <em>Figure 4: Weather analysis charts of past 3 days weather data</em>
</p>
<br>

<p align="center">
  <img width="492" height="747" alt="image" src="https://github.com/user-attachments/assets/9a0a661a-e881-4c00-884a-7f85226aec2a" />
</p>

<p align="center">
  <em>Figure 5: WeatherDrop AI assistant</em>
</p>
<br>

## Features

- Search and explore weather for any location
- Automatic current-location weather detection
- Detailed 24-hour weather forecasts
- Weather analytics with interactive charts
- Wind, pressure, humidity, visibility, UV index, and dew point data
- AI-powered weather chatbot
- Interactive 3D Earth with location-based navigation
- Customizable units and 12/24-hour time format
- PostgreSQL database for storing locations and weather data
- Automatic scheduler for updating forecasts
- FastAPI backend with REST APIs
- Next.js frontend with responsive design

## Tech Stack

Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

Backend
- FastAPI
- Python

Database
- PostgreSQL

Tools
- Git
- GitHub

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ahsan-mustafa-101/Weather-Analysis-Website
cd weather-analysis
```

### 2. Install backend dependencies

```bash
pip install -r backend/requirements.txt
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
```

## Environment Variables

Create the following environment files before running the project.

### Root `.env`

```env
DATABASE_URL=your_postgresql_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

Used by the FastAPI backend to connect to PostgreSQL and access the Gemini API for the AI chatbot.

---

### `frontend/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Used by the Next.js frontend to communicate with the backend.


## Running the Project

### Start the backend

```bash
uvicorn main:app --reload
```

The backend runs on:

```
http://127.0.0.1:8000
```

---

### Start the frontend

```bash
cd frontend
npm run dev
```

The frontend runs on:

```
http://localhost:3000
```

## Deployment
- Backend & database is deployed on **Render** 
- Frontend is deployed on **Vercel**
- Check out the deployed application : **https://weatherdrop.vercel.app/**

  
## Author 
**Ahsan Mustafa** ⭐<br>
Computer Science Student<br>
Github: https://github.com/ahsan-mustafa-101
