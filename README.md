# Realtime Chat System
This project implements a real-time chat system using microservice architecture.
The system uses:
- Supabase for authentication and database storage.
- Next.js for the frontend interface.
- Express.js for backend services.
- Socket.IO for real-time WebSocket communication.

## Architecture Overview
> #### Auth Service
> - Manages user authentication using Supabase's Magic Link functionality.
> - Redirects users after successful authentication.
> 
> #### Chat Service
> - Stores and retrieves chat messages from the database.
> - Handles sending and fetching chat messages between users.
> 
> #### WebSocket Service
> - Maintains WebSocket connections using Socket.IO.
> - Sends real-time messages to connected users.
> 
> #### Database (Supabase)
> - Acts as the primary storage for user data, authentication, and chat messages.
>
> 

