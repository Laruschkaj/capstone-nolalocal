# NolaLocal

A community-driven platform for discovering and sharing events and local guides in New Orleans, Louisiana.

## Overview

NolaLocal connects locals and visitors with curated events and insider recommendations across New Orleans. The platform features a modern, responsive design with dark mode support and emphasizes user-generated content alongside professionally verified guides.

## Features

### Core Functionality

- Event discovery with calendar view and list view
- Local guides for evergreen recommendations
- User authentication with email verification
- Event creation and management
- Category-based filtering
- Like and save functionality
- Real-time weather widget

### User Experience

- Dark mode support
- Responsive design for mobile and desktop
- Drag-and-drop image uploads via Cloudinary
- Interactive calendar with month navigation
- Verified badge system for admin-curated content

### Technical Features

- JWT-based authentication
- Rate limiting for security
- MongoDB database with Mongoose ODM
- SendGrid email integration
- RESTful API architecture

## Tech Stack

### Frontend

- Next.js 15.0.3 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion for animations

### Backend

- Next.js API Routes
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Nodemailer with SendGrid

### External Services

- MongoDB Atlas (Database)
- Cloudinary (Image hosting)
- SendGrid (Email service)
- OpenWeather API (Weather data)
- Vercel (Deployment)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Cloudinary account
- SendGrid account
- OpenWeather API key

### Installation

1. Clone the repository

```bash
git clone https://github.com/Laruschkaj/capstone-nolalocal.git
cd capstone-nolalocal/nolalocalapp
```

2. Install dependencies

```bash
npm install
```

3. Create environment file

```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=your_verified_sender_email
```

5. Run development server

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

nolalocal/
├── src/
│ ├── app/ # Next.js app directory
│ │ ├── api/ # API routes
│ │ ├── events/ # Event pages
│ │ ├── guides/ # Guide pages
│ │ └── ...
│ ├── components/ # React components
│ │ ├── auth/ # Authentication components
│ │ ├── events/ # Event-related components
│ │ ├── layout/ # Layout components
│ │ └── ui/ # UI components
│ ├── contexts/ # React contexts
│ ├── lib/ # Utility functions
│ │ ├── data/ # Data and configurations
│ │ └── helpers/ # Helper functions
│ ├── middleware/ # Custom middleware
│ └── models/ # Mongoose models
├── public/ # Static assets
└── ...

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Events

- `GET /api/events` - Get all events (supports filtering)
- `GET /api/events/[id]` - Get single event
- `POST /api/events` - Create event (authenticated)
- `PUT /api/events/[id]` - Update event (authenticated)
- `DELETE /api/events/[id]` - Delete event (authenticated)
- `POST /api/events/[id]/like` - Like/unlike event (authenticated)

### Categories

- `GET /api/categories` - Get all categories

### User

- `GET /api/users/profile` - Get user profile (authenticated)
- `DELETE /api/users/profile` - Delete account (authenticated)

## Database Schema

### User Model

- username (String, unique)
- email (String, unique)
- password (String, hashed)
- isAdmin (Boolean)
- isVerified (Boolean)
- verifyToken (String)
- verifyTokenExpiry (Date)
- resetPasswordToken (String)
- resetPasswordExpiry (Date)
- createdEvents (Array of Event IDs)
- likedEvents (Array of Event IDs)

### Event Model

- title (String)
- description (String)
- date (Date, optional for guides)
- time (String)
- location (String)
- imageUrl (String)
- category (ObjectId ref Category)
- creator (ObjectId ref User)
- source (String: user/eventbrite/ticketmaster)
- sourceUrl (String)
- status (String: upcoming/past/cancelled)
- eventType (String: event/guide)
- likes (Array of User IDs)
- likesCount (Number)

### Category Model

- name (String)
- slug (String, unique)
- color (String)

## Security Features

- JWT-based authentication with 7-day expiration
- Password hashing with bcryptjs
- Email verification required for account activation
- Rate limiting on authentication endpoints
- Security headers (XSS protection, clickjacking prevention)
- Input validation and sanitization
- CORS configuration

## Deployment

The application is deployed on Vercel with the following configuration:

1. Environment variables configured in Vercel dashboard
2. Automatic deployments from main branch
3. Preview deployments for pull requests
4. Production database on MongoDB Atlas
5. CDN-backed static assets

## Future Enhancements

- Social media integration
- Event recommendations based on user preferences
- Advanced search with filters
- User profiles with bio and social links
- Event comments and ratings
- Push notifications for liked events
- Map view for event locations
- Mobile app (React Native)

## Contributing

This is a capstone project for educational purposes. Contributions, issues, and feature requests are welcome.

## License

This project is licensed under the MIT License.

## Contact

Laruschka Joubert - laruschkajoubert@gmail.com

Project Link: [https://github.com/Laruschkaj/capstone-nolalocal](https://github.com/Laruschkaj/capstone-nolalocal)

## Acknowledgments

- Springboard Software Engineering Bootcamp
- Next.js documentation and community
- MongoDB University
- The New Orleans tech community

- [Live Application](https://nolalocal.vercel.app) - Production deployment
