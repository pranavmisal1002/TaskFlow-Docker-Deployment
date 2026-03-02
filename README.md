# 🚀 TASKFLOW — Complete Docker Network Setup on AWS EC2

A comprehensive guide to deploying a 3-tier MERN stack application using Docker networking on AWS EC2.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Phase 1: EC2 Preparation](#phase-1--ec2-preparation)
- [Phase 2: Install Docker](#phase-2--install-docker)
- [Phase 3: Clone Project](#phase-3--clone-project)
- [Phase 4: Clean Old Containers](#phase-6--clean-old-containers)
- [Phase 5: Create Docker Network](#phase-7--create-docker-network)
- [Phase 6: Run MongoDB](#phase-8--run-mongodb-with-volume)
- [Phase 7: Build Backend](#phase-9--build-backend-image)
- [Phase 8: Run Backend](#phase-10--run-backend-container)
- [Phase 9: Build Frontend](#phase-11--build-frontend-image)
- [Phase 10: Run Frontend](#phase-12--run-frontend-container)
- [Phase 11: Verify Deployment](#phase-13--verify-containers)
- [Phase 12: Access Application](#phase-14--access-application)

---

## 🎯 Overview

**TaskFlow** is a 3-tier MERN stack task management application deployed using Docker custom networking. This guide demonstrates:

- Docker container networking
- Multi-container application architecture
- MongoDB with persistent volumes
- Nginx reverse proxy configuration
- Production-ready deployment on AWS EC2

---

## 🏗️ Architecture

```
User Browser
      ↓
Frontend Container (Nginx - Port 3000)
      ↓ (Docker Network: taskflow-net)
Backend Container (Node.js - Port 5000)
      ↓ (Docker Network: taskflow-net)
MongoDB Container (Port 27017)
      ↓
Persistent Volume (mongo-data)
```

**Technology Stack:**

| Component | Technology |
|-----------|-----------|
| **Frontend** | React + Nginx |
| **Backend** | Node.js + Express |
| **Database** | MongoDB 6.0 |
| **Networking** | Docker Custom Network |
| **Storage** | Docker Volumes |
| **Platform** | AWS EC2 (Ubuntu 22.04) |

---

## ✅ Prerequisites

- AWS Account
- Basic knowledge of Docker and Linux
- SSH client installed
- Basic understanding of MERN stack

---

## 🟢 PHASE 1 — EC2 Preparation

### 1️⃣ Launch EC2 Instance

**Instance Configuration:**

| Setting | Value |
|---------|-------|
| AMI | Ubuntu 22.04 LTS |
| Instance Type | t2.medium (recommended) |
| Storage | 20 GB |

### 🔐 Security Group Inbound Rules

Configure the following inbound rules:

| Type | Port | Source | Purpose |
|------|------|--------|---------|
| SSH | 22 | Your IP | SSH access |
| Custom TCP | 3000 | 0.0.0.0/0 | Frontend access |
| Custom TCP | 5000 | 0.0.0.0/0 | Backend API access |

**Save the security group.**

---

### 2️⃣ Connect to EC2

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

**Replace:**
- `your-key.pem` with your SSH key file
- `<EC2_PUBLIC_IP>` with your instance's public IP

---

## 🟢 PHASE 2 — Install Docker

### Install Docker

```bash
sudo apt update -y
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
```

### Verify Docker Installation

```bash
docker --version
```

**Expected output:**
```
Docker version 24.0.x, build xxxxx
```

---

## 🟢 PHASE 3 — Clone Project

### Clone Repository

```bash
git clone https://github.com/pranavmisal1002/TaskFlow-Docker-Deployment.git
cd Application-Code
```

### Verify Project Structure

```bash
ls -la
```

**Required structure:**

```
Application-Code/
  ├── backend/
  │   ├── server.js
  │   ├── package.json
  │   └── Dockerfile
  └── frontend/
      ├── src/
      ├── nginx.conf
      ├── package.json
      └── Dockerfile
```

---

## 🟢 PHASE 4 — Clean Old Containers

### Remove Existing Containers and Network

```bash
docker rm -f frontend backend mongo
docker network rm taskflow-net
docker system prune -f
```

**This ensures:**
- No port conflicts
- Clean network setup
- No stale containers

---

## 🟢 PHASE 5 — Create Docker Network

### Create Custom Network

```bash
docker network create taskflow-net
```

### Verify Network Creation

```bash
docker network ls
```

**Expected output:**

```
NETWORK ID     NAME           DRIVER    SCOPE
abc123def456   taskflow-net   bridge    local
```

**Why Custom Network?**

- Containers can communicate using container names
- Built-in DNS resolution
- Better isolation from other containers
- More control over networking

---

## 🟢 PHASE 6 — Run MongoDB (With Volume)

### Start MongoDB Container

```bash
docker run -d --name mongo --network taskflow-net -v mongo-data:/data/db mongo:6.0
```

**Flags explained:**

| Flag | Purpose |
|------|---------|
| `-d` | Run in detached mode (background) |
| `--name mongo` | Container name |
| `--network taskflow-net` | Attach to custom network |
| `-v mongo-data:/data/db` | Persistent volume for data |
| `mongo:6.0` | MongoDB version 6.0 image |

### Check MongoDB Status

```bash
docker ps
```

**MongoDB must show as `Up`.**

### Verify MongoDB Logs

```bash
docker logs mongo
```

Look for: `Waiting for connections on port 27017`

---

## 🟢 PHASE 7 — Build Backend Image

### Navigate to Backend Directory

```bash
cd Application-Code/backend
```

### Build Docker Image

```bash
docker build -t taskflow-backend .
```

**Wait for build to complete successfully.**

### Verify Image

```bash
docker images | grep taskflow-backend
```

---

## 🟢 PHASE 8 — Run Backend Container

### Start Backend Container

```bash
docker run -d \
  --name backend \
  --network taskflow-net \
  -p 5000:5000 \
  -e MONGO_URI=mongodb://mongo:27017/taskdb \
  taskflow-backend
```

**Flags explained:**

| Flag | Purpose |
|------|---------|
| `-d` | Run in detached mode |
| `--name backend` | Container name |
| `--network taskflow-net` | Attach to custom network |
| `-p 5000:5000` | Port mapping (host:container) |
| `-e MONGO_URI=...` | Environment variable |

**Notice:**

- Use `mongo` as hostname (Docker network DNS)
- Docker network resolves container names automatically
- No need for `--link` (deprecated)

---

### ✅ Test Backend

**From inside EC2:**

```bash
curl http://localhost:5000/health
```

**Expected response:**

```json
{"status":"OK"}
```

**Check backend logs:**

```bash
docker logs backend
```

Look for:
- `Server running on 5000`
- `MongoDB connected successfully`

---

## 🟢 PHASE 9 — Build Frontend Image

### Navigate to Frontend Directory

```bash
cd ../frontend
```

### Build Docker Image

```bash
docker build -t taskflow-frontend .
```

**Wait for React build to complete.**

**This may take 3-5 minutes as it:**
- Installs npm dependencies
- Builds React production bundle
- Configures Nginx

### Verify Image

```bash
docker images | grep taskflow-frontend
```

---

## 🟢 PHASE 10 — Run Frontend Container

### Start Frontend Container

```bash
docker run -d --name frontend --network taskflow-net -p 3000:80 taskflow-frontend
```

**Flags explained:**

| Flag | Purpose |
|------|---------|
| `-d` | Run in detached mode |
| `--name frontend` | Container name |
| `--network taskflow-net` | Attach to custom network |
| `-p 3000:80` | Map EC2 port 3000 to container port 80 |



---

## 🟢 PHASE 11 — Verify Containers

### Check All Running Containers

```bash
docker ps
```

**You must see all three containers running:**

```
CONTAINER ID   IMAGE                STATUS    PORTS                    NAMES
abc123...      taskflow-frontend    Up        0.0.0.0:3000->80/tcp     frontend
def456...      taskflow-backend     Up        0.0.0.0:5000->5000/tcp   backend
ghi789...      mongo:6.0            Up        27017/tcp                mongo
```

### Check Container Health

```bash
# Frontend logs
docker logs frontend

# Backend logs
docker logs backend

# MongoDB logs
docker logs mongo
```

### Verify Network Connectivity

```bash
docker network inspect taskflow-net
```

**All three containers should be listed under "Containers".**

---

## 🟢 PHASE 12 — Access Application

### Frontend

**Open in browser:**

```
http://<EC2_PUBLIC_IP>:3000
```

### Backend API

**Test backend health endpoint:**

```
http://<EC2_PUBLIC_IP>:5000/health
```

**Expected response:**

```json
{"status":"OK"}
```

### Test Full Application

1. Open frontend in browser
2. Create a new task
3. View task list
4. Update a task
5. Delete a task

**All operations should work without errors.**

---

## 🟢 PHASE 13 — Internal Network Test (Optional)

### Test Container-to-Container Communication

**Enter frontend container:**

```bash
docker exec -it frontend sh
```

**Inside container, test backend connectivity:**

```bash
wget -qO- http://backend:5000/health
```

**Expected output:**

```json
{"status":"OK"}
```

**This confirms Docker networking works perfectly.**

**Exit container:**

```bash
exit
```

---

## 🎓 Key Concepts

### Docker Custom Networks

**Benefits:**

- Automatic DNS resolution using container names
- Better isolation from other containers
- No need for deprecated `--link` flag
- Containers can discover each other automatically

**Example:**

```bash
# Frontend can reach backend using:
http://backend:5000

# Backend can reach MongoDB using:
mongodb://mongo:27017
```

### Container Communication Flow

```
1. User → http://EC2_IP:3000 → Frontend Container
2. Frontend → http://backend:5000/api → Backend Container
3. Backend → mongodb://mongo:27017 → MongoDB Container
```

### Persistent Volumes

**Why use volumes?**

- Data persists even if container is removed
- Can share data between containers
- Better performance than bind mounts
- Easy backup and migration

**Example:**

```bash
docker run -v mongo-data:/data/db mongo:6.0
```

Data in `/data/db` is stored in `mongo-data` volume.

---


## 📝 Notes

- This setup uses a custom Docker network for container communication
- MongoDB data persists in a Docker volume
- All containers can communicate using container names
- No deprecated `--link` flag is used
- Production deployment should include additional security measures

---

**Happy Deploying!** 🚀
