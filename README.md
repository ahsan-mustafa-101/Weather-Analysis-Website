# Weather-Analysis-Website
A full stack weather forecasting web application that allows users to search locations & view 24-hour weather forecasts using the Open-Meteo API.

## Preview
<p align="center">
  <img width="1918" height="862" alt="Home Page" src="https://github.com/user-attachments/assets/e3b0c36e-506d-4910-be09-07bb3e8cc7fc" />
</p>
   
<p align="center">
  <em>Figure 1: WeatherDrop home page startup interface</em>
</p>
<br>

<p align="center">
  <img width="1917" height="901" alt="image" src="https://github.com/user-attachments/assets/5f29d331-8128-47dc-a567-e7613e4bcf29" />
</p>

<p align="center">
  <em>Figure 2: Searched location along a 3d Earth model displayed</em>
</p>

<p align="center">
  <img width="1917" height="601" alt="image" src="https://github.com/user-attachments/assets/d44a5ee8-450f-481c-a9d3-5fcc766e5b8e" />
</p>

<p align="center">
  <em>Figure 3: Searched location 24-hour weather forecast results</em>
</p>


## Features

- Search any city
- Store locations in PostgreSQL
- Fetch hourly weather data
- Automatic scheduler updates
- Responsive design
- FastAPI backend
- Next.js frontend

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
```

Used by the FastAPI backend to connect to PostgreSQL.

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
  
## Future Improvements
- Data Analytics Charts/Graphs
- AI chat bot
- More weather information i.e. humidity, rain_probability etc
- Add new features

## Author 
**Ahsan Mustafa** ⭐<br>
Computer Science Student<br>
Github: https://github.com/ahsan-mustafa-101
