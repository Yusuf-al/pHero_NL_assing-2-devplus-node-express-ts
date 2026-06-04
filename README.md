# Devpulse

## Live URL : https://node-express-typescript-project.vercel.app/

Add your deployed API URL here:

`[https://your-api-url.com](https://node-express-typescript-project.vercel.app/)`

---

## Project Overview

Devpulse API is a RESTful backend application built with Node.js, Express, TypeScript, and PostgreSQL. It allows users to report, manage, and track issues while enforcing role-based access control for contributors and maintainers.

---

## Features

* User Registration and Login
* JWT-based Authentication
* Role-based Authorization (Contributor & Maintainer)
* Create Issues
* Update Issues
* Delete Issues
* Get Single Issue
* Get All Issues
* Filter Issues by Type and Status
* Sort Issues by Newest or Oldest
* Reporter Information Included with Issues
* Global Error Handling
* Request Logging Middleware
* PostgreSQL Database Integration

---

## Tech Stack

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* PostgreSQL
* pg

### Authentication

* JWT (JSON Web Token)
* bcrypt

### Development Tools

* tsx
* dotenv


## API Endpoints

### Authentication &  Register User
# POST /api/auth/signup
# POST /api/auth/login

#### Create Issue
# POST /api/issues


#### Get All Issues
# GET /api/issues


Query Parameters:

```http
?sort=newest
?sort=oldest

?type=bug
?type=feature_request

?status=open
?status=in_progress
?status=resolved
```

---

#### Get Single Issue

# GET /api/issues/:id



#### Update Issue

# PUT /api/issues/:id

#### Delete Issue

# DELETE /api/issues/:id

Authorization Rules:

* Maintainer can update any issue
* Contributor can update only their own issue when status is "open"


## Database Schema

### Users Table

| Column   | Type                     |
| -------- | ------------------------ |
| id       | SERIAL PRIMARY KEY       |
| name     | VARCHAR(255)             |
| email    | VARCHAR(255) UNIQUE      |
| password | TEXT                     |
| role     | contributor | maintainer |

### Issues Table

| Column      | Type                          |
| ----------- | ----------------------------- |
| id          | SERIAL PRIMARY KEY            |
| title       | VARCHAR(255)                  |
| description | TEXT                          |
| type        | bug | feature_request         |
| status      | open | in_progress | resolved |
| reporter_id | INTEGER (FK → users.id)       |
| created_at  | TIMESTAMP                     |
| updated_at  | TIMESTAMP                     |



## Author
Yusuf Al Naiem
