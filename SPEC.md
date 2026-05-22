# AI Interview Platform - Specification Document

## 1. Project Overview

**Project Name**: AI Interview Platform
**Project Type**: Full-stack Web Application (MERN Stack)
**Core Functionality**: A platform for creating interview question sets, conducting practice interviews, and managing user responses with role-based access control
**Target Users**: Job seekers, interviewers, HR administrators, and candidates

---

## 2. Technical Architecture

### Stack
- **Frontend**: React 18 with Vite
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local file system (via Multer)
- **Containerization**: Docker & Docker Compose

### Environment Configurations
| Environment | Purpose | Port (Frontend/Backend) |
|-------------|---------|-------------------------|
| development | Local development | 3000/5000 |
| production | Live production | 80/5000 |

### Role-Based Access
| Role | Permissions |
|------|-------------|
| admin | Full access: manage users, question sets, view all answers, dashboard |
| interviewer | Create question sets, view submitted answers |
| candidate | Take interviews, upload resume, view own answers |

---

## 3. UI/UX Specification

### Color Palette
```css
--primary: #0f172a          /* Deep navy - main background */
--primary-light: #1e293b    /* Card backgrounds */
--accent: #f97316           /* Vibrant orange - CTAs, highlights */
--accent-hover: #ea580c     /* Orange hover state */
--success: #22c55e          /* Green - success states */
--warning: #eab308          /* Yellow - warnings */
--error: #ef4444            /* Red - errors */
--text-primary: #f8fafc     /* White text */
--text-secondary: #94a3b8    /* Muted text */
--border: #334155            /* Border color */
--surface: #1e293b          /* Surface color */
```

### Typography
- **Primary Font**: "Outfit" (Google Fonts) - Modern, geometric sans-serif
- **Secondary Font**: "JetBrains Mono" - For code/technical elements
- **Heading Sizes**: H1: 2.5rem, H2: 2rem, H3: 1.5rem, H4: 1.25rem
- **Body**: 1rem (16px), Small: 0.875rem

### Layout Structure

#### Global Layout
- **Sidebar**: 260px fixed left sidebar (collapsible on mobile)
- **Main Content**: Fluid width with max-width 1400px
- **Responsive Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

#### Pages
1. **Login/Register** - Centered card with form
2. **Dashboard** - Stats cards + recent activity
3. **Question Sets** - Grid of question set cards
4. **Interview View** - Question display + answer input
5. **Answers/Submissions** - Table with filters
6. **Admin Panel** - User management table
7. **Resume Upload** - Drag-drop zone + preview

### Components

#### Cards
- Rounded corners (12px)
- Subtle shadow: `0 4px 20px rgba(0,0,0,0.3)`
- Hover: lift effect with increased shadow
- Border: 1px solid var(--border)

#### Buttons
- **Primary**: Orange background, white text, 8px radius
- **Secondary**: Transparent with border
- **States**: hover (brightness 1.1), active (scale 0.98), disabled (opacity 0.5)

#### Form Inputs
- Dark background (#0f172a)
- Border: 1px solid #334155
- Focus: Orange border glow
- Error: Red border + message below
- Padding: 12px 16px

#### Navigation
- Sidebar items with icons
- Active state: orange left border + background tint
- Hover: subtle background change

### Animations
- Page transitions: Fade in (200ms ease)
- Card hover: Transform translateY(-4px) (150ms)
- Button press: Scale 0.98 (100ms)
- Loading spinner: Rotating circle animation
- Toast notifications: Slide in from top-right

---

## 4. Functionality Specification

### Authentication Module
- **Register**: Email, password, name, role selection (for testing: admin/interviewer/candidate)
- **Login**: Email + password → JWT token
- **Logout**: Clear token from localStorage
- **Protected Routes**: Check JWT validity on each request
- **Password**: Minimum 6 characters

### User Management
- View all users (admin only)
- Update user role (admin only)
- Delete user (admin only)
- User profile with uploaded resumes

### Interviews Module
- **Create**: Title, description, category, questions array (admin only)
- **Question Types**: Technical, Behavioral, System Design, Mixed
- **Edit**: Update interview details (admin only)
- **Delete**: Remove interview (admin only)
- **List**: Paginated grid view

### Questions Module
- **Create**: Add questions to an interview
- **AI Generation**: Generate questions using OpenAI based on role/skills
- **Types**: Multiple choice, coding, open ended, behavioral, technical

### Interview Module
- **Start Interview**: Select an interview set
- **Answer Questions**: Sequential question display
- **Save Progress**: Auto-save answers
- **Submit**: Finalize and save answers
- **Timer**: Optional countdown per question

### Answers/Submissions Module
- **View Answers**: List of submitted interviews
- **Filter**: By user, interview, date
- **Detail View**: Full answer review
- **Export**: Download as JSON (admin/interviewer)

### Upload Module
- **Resume Upload**: Drag-drop or file picker (PDF, DOC, DOCX, 5MB limit)
- **Profile Picture**: Upload and update profile image
- **Storage**: Local file system (via Multer)

### Admin Dashboard
- **Stats**: Total users, interviews, submissions, questions
- **User Management**: View all users, update roles, update status (active/inactive)
- **Activity**: Monitor latest submissions and activities

---

## 5. API Endpoints

### Auth Routes
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### User Routes
```
GET    /api/users (admin)
GET    /api/users/:id
PATCH  /api/users/:id (admin - update role)
DELETE /api/users/:id (admin)
```

### Interview Routes
```
GET    /api/interviews
POST   /api/interviews (admin)
GET    /api/interviews/:id
PUT    /api/interviews/:id (admin)
DELETE /api/interviews/:id (admin)
```

### Question Routes
```
GET    /api/questions
POST   /api/questions (admin)
POST   /api/questions/generate (AI)
POST   /api/questions/generate-ai (admin AI)
GET    /api/questions/:id
PUT    /api/questions/:id (admin)
DELETE /api/questions/:id (admin)
```

### Answer Routes
```
GET    /api/answers
POST   /api/answers
GET    /api/answers/:id
GET    /api/answers/user/:userId (own answers)
```

### Upload Routes
```
POST   /api/upload/resume (Upload resume)
POST   /api/upload/profile-picture (Upload profile pic)
```

### Admin Routes
```
GET    /api/admin/dashboard (Stats)
GET    /api/admin/users (All users)
PUT    /api/admin/users/:id/status (Update status)
PUT    /api/admin/users/:id/role (Update role)
GET    /api/admin/answers (All answers)
```

---

## 6. Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (unique)",
  "password": "String (hashed)",
  "role": "String (admin/interviewer/candidate)",
  "resume": "String (file path)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Interviews Collection
```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "type": "String (technical/behavioral/system_design/mixed)",
  "difficulty": "String (easy/medium/hard)",
  "category": "String",
  "createdBy": "ObjectId (ref: Users)",
  "questions": ["ObjectId (ref: Questions)"],
  "maxDuration": "Number (minutes)",
  "isPublic": "Boolean",
  "isActive": "Boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Questions Collection
```json
{
  "_id": "ObjectId",
  "text": "String",
  "type": "String (multiple_choice/coding/open_ended/behavioral/technical)",
  "difficulty": "String (easy/medium/hard)",
  "category": "String",
  "options": [{ "text": "String", "isCorrect": "Boolean" }],
  "expectedAnswer": "String",
  "aiGenerated": "Boolean",
  "createdBy": "ObjectId (ref: Users)",
  "interview": "ObjectId (ref: Interviews)",
  "timeLimit": "Number (minutes)",
  "tags": ["String"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Answers Collection
```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User)",
  "question": "ObjectId (ref: Question)",
  "interview": "ObjectId (ref: Interview)",
  "answer": "String",
  "code": "String",
  "language": "String",
  "score": "Number (0-100)",
  "feedback": "String",
  "aiFeedback": "String",
  "timeTaken": "Number (seconds)",
  "attempts": "Number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 7. Docker Configuration

### Services
1. **mongodb**: MongoDB database (mongo:6.0)
2. **backend**: Node.js Express API
3. **frontend**: React application

### Docker Files
- **Backend**: `Dockerfile` (Production), `Dockerfile.dev` (Development)
- **Frontend**: `Dockerfile` (Production), `Dockerfile.dev` (Development)

### Docker Compose Files
- `docker-compose.dev.yml` - Development environment with hot-reloading
- `docker-compose.prod.yml` - Production environment with optimized builds

---

## 8. CI/CD Pipeline (GitHub Actions)

### Workflows
1. **CI Pipeline**: Test & Build on every push
2. **CD Pipeline**: Deploy to staging on merge to main
3. **Production**: Manual trigger for production deploy

### Pipeline Stages
1. **Lint**: ESLint for code quality
2. **Test**: Run unit tests
3. **Build**: Build Docker images
4. **Deploy**: Push to registry + deploy

---

## 9. Acceptance Criteria

### Authentication
- [ ] User can register with email/password
- [ ] User can login and receive JWT
- [ ] Protected routes redirect to login
- [ ] Logout clears session

### Interviews & Questions
- [ ] Admin can create interviews with multiple questions
- [ ] Admin can generate questions using AI
- [ ] Interviews display in a grid/list
- [ ] Admin can edit/delete interviews
- [ ] Candidates can view available interviews

### Interview
- [ ] User can start an interview
- [ ] Questions display one at a time
- [ ] Answers are saved
- [ ] User can submit interview

### Admin
- [ ] Dashboard shows statistics
- [ ] Admin can manage users
- [ ] Admin can view all submissions

### Resume
- [ ] User can upload PDF/DOC
- [ ] File size validation works
- [ ] Uploaded file is accessible

### Docker
- [ ] All services start with docker-compose up
- [ ] Environment variables load correctly
- [ ] Data persists in named volumes

---

## 10. Project Structure

```
ai-interview-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── package.json
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .env.example
└── SPEC.md
```