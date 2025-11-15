# DJ NASSA Website

## Overview

DJ NASSA is a static website for an electronic music DJ and producer. The platform allows the DJ to share music content, videos, and connect with fans. The site features a multi-page layout with sections for playlists, videos, about information, and contact details. Users can upload and manage music tracks and videos through Firebase-powered forms. The site is built with vanilla HTML, CSS, and JavaScript, using Firebase as the backend for storage and data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: Vanilla JavaScript with ES6 modules, HTML5, CSS3

The application uses a traditional multi-page architecture (MPA) rather than a single-page application. Each section of the website (Home, About, Playlist, Videos, Contact) is a separate HTML file with shared navigation and styling.

**Rationale**: This approach was chosen for simplicity and SEO benefits. Each page can be indexed separately, and the site doesn't require a build process or complex routing logic.

**Key Design Patterns**:
- **Module-based JavaScript**: Each feature area (playlist, videos) has its own JavaScript module that imports Firebase SDK functions
- **Shared navigation component**: All pages include the same navbar HTML structure with hamburger menu for mobile responsiveness
- **Progressive enhancement**: Core content is accessible via HTML, with JavaScript adding interactive features

**Styling Approach**:
- Single `style.css` file with CSS custom properties (variables) for theming
- Neon/cyberpunk aesthetic with gradient effects and dark backgrounds
- Responsive design using flexbox and grid layouts
- Mobile-first approach with hamburger menu navigation

### Backend Architecture

**Hybrid Static/Dynamic Serving**: The application uses a Python HTTP server (`server.py`) that serves static files but injects Firebase configuration from environment variables into JavaScript files at runtime.

**Why this approach**:
- Keeps sensitive Firebase credentials out of source control
- Allows the same codebase to work in different environments without code changes
- Maintains the simplicity of static file serving while adding configuration flexibility

**Server Implementation**:
- Custom `SimpleHTTPRequestHandler` extension that intercepts requests for `.js` files
- Injects environment variables as global `window` properties before serving JavaScript
- Sets appropriate cache headers to prevent stale configuration

**Alternative considered**: Client-side environment variable loading was considered but rejected because browsers can't access server environment variables directly without an API endpoint.

**Content Management**:
- Firebase Firestore stores metadata for songs and videos (title, artist, genre, timestamps)
- Firebase Storage stores actual media files (audio, video, cover images, thumbnails)
- No traditional backend server or API layer - all data operations happen client-side via Firebase SDK

### Data Storage Solutions

**Firebase Firestore (NoSQL Database)**:
- Collections: `songs`, `videos`
- Document structure includes title, artist/description, category/genre, file URLs, timestamps
- Real-time synchronization capabilities (though not currently utilized)

**Firebase Storage (Object Storage)**:
- Organized by content type: `songs/`, `videos/`, `covers/`, `thumbnails/`
- Stores binary media files with download URLs
- Handles large file uploads with progress tracking

**Why Firebase**:
- Eliminates need for custom backend infrastructure
- Built-in authentication and security rules (can be added later)
- Automatic scaling and CDN distribution
- Simple JavaScript SDK integration

**Trade-offs**:
- Vendor lock-in to Google Cloud Platform
- Limited complex query capabilities compared to relational databases
- Client-side data access requires careful security rules (currently permissive)

### Authentication and Authorization

**Current State**: No authentication is implemented. Upload forms are publicly accessible.

**Security Considerations**:
- Firebase credentials are exposed client-side (acceptable for public read operations)
- Write operations (uploads, deletes) should be restricted via Firebase Security Rules
- Admin authentication should be added before production deployment

**Recommended Future Implementation**:
- Firebase Authentication for admin users
- Protected upload routes requiring authentication
- Firestore security rules restricting writes to authenticated admins only

### External Dependencies

**Firebase Services**:
- **Firebase App** (v10.7.1): Core initialization
- **Firebase Analytics**: Page view tracking and user behavior monitoring
- **Firebase Firestore**: NoSQL database for content metadata
- **Firebase Storage**: File storage for media content

**CDN Resources**:
- **Font Awesome 6.4.0**: Icon library for UI elements
- Loaded from `cdnjs.cloudflare.com`

**Third-party Libraries**: None beyond Firebase SDKs. The project intentionally avoids frontend frameworks to maintain simplicity.

**Browser APIs Used**:
- File API for handling uploads
- Fetch API (implicit via Firebase SDK)
- DOM manipulation APIs

**Environment Variables** (injected via server.py):
- `FIREBASE_API_KEY`: Firebase project API key
- `FIREBASE_AUTH_DOMAIN`: Authentication domain
- `FIREBASE_PROJECT_ID`: Project identifier
- `FIREBASE_STORAGE_BUCKET`: Storage bucket URL
- `FIREBASE_MESSAGING_SENDER_ID`: Cloud messaging ID
- `FIREBASE_APP_ID`: App identifier

**Deployment Considerations**:
- Requires Python 3.x runtime for server.py
- Environment variables must be configured in hosting environment
- Static files can be served from any web server, but dynamic configuration injection requires the Python server or alternative implementation