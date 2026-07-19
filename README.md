# Weather-Analysis-Website
A full stack weather forecasting web application that allows users to search locations & view 24-hour weather forecasts using the Open-Meteo API.

## Preview
(will add soon)

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
pip install -r requirements.txt
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
uvicorn api_creation:app --reload
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

## Future Improvements
- Data Analytics Charts/Graphs
- AI chat bot
- More weather information i.e. humidity, rain_probability etc
- Add new features

## Author 
**Ahsan Mustafa** ⭐<br>
Computer Science Student<br>
Github: https://github.com/ahsan-mustafa-101
