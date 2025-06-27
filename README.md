# Recall - Interactive Flashcard Learning Platform

Recall is a modern web application built with Next.js that helps users create, study, and share flashcard sets for effective learning.

## Features

- **Create and Manage Flashcard Sets**
  - Create sets with custom titles and descriptions
  - Add, edit, and delete flashcards
  - Organize sets with labels
  - Track creation and update times

- **Study Modes**
  - Interactive study mode with card flipping
  - Multiple choice and fill-in-the-blank test mode
  - Progress tracking and performance statistics
  - Keyboard shortcuts for efficient navigation

- **Sharing and Collaboration**
  - Share flashcard sets with other users
  - View sets shared with you
  - Manage shared access permissions
  - Real-time updates for shared content

- **User Experience**
  - Clean, modern interface
  - Responsive design for all devices
  - Smooth animations and transitions
  - Loading states and error handling

- **Authentication & Security**
  - Email/password authentication
  - Google OAuth integration
  - Email verification system
  - Secure password hashing

## Tech Stack

- **Frontend**
  - Next.js 14 (App Router)
  - React
  - TypeScript
  - Tailwind CSS
  - Radix UI Components
  - Lucide Icons

- **Backend**
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL Database (Supabase)
  - NextAuth.js for Authentication
  - Nodemailer for Email

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/recall.git
   cd recall
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   # Database
   DATABASE_URL="postgresql://postgres:your-password@db.qfhevbpptypgtibdhtpt.supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:your-password@db.qfhevbpptypgtibdhtpt.supabase.co:5432/postgres"

   # Authentication
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Email Configuration (for email verification)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   SMTP_FROM="noreply@yourdomain.com"
   ```

4. **Set up email for verification**
   
   For Gmail:
   - Enable 2-factor authentication
   - Generate an App Password
   - Use the App Password as `SMTP_PASS`
   
   For other providers:
   - Update `SMTP_HOST` and `SMTP_PORT` accordingly
   - Use your email credentials

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Email Verification

The application includes a complete email verification system:

- Users must verify their email before signing in
- Verification emails are sent automatically upon registration
- Users can resend verification emails if needed
- Verification links expire after 24 hours
- Beautiful, responsive email templates

## Usage

1. **Creating a Set**
   - Click "New Set" to create a flashcard set
   - Add a title and description
   - Add flashcards with terms and definitions
   - Add labels for organization

2. **Studying**
   - Open a set and click "Study"
   - Use spacebar to flip cards
   - Use arrow keys to navigate
   - Track your progress

3. **Testing**
   - Open a set and click "Test"
   - Choose the number of cards to test
   - Answer multiple choice or fill-in-the-blank questions
   - Review your results

4. **Sharing**
   - Open a set and click the share icon
   - Enter the email of the user to share with
   - Manage shared access from the set page

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
