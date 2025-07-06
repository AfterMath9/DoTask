# DoTask

A modern task management application built with React, TypeScript, and Supabase. DoTask provides a comprehensive solution for managing tasks, events, team collaboration, and analytics with a beautiful, responsive interface.

## Features

- 📋 **Task Management** - Create, edit, and organize tasks with a Kanban board interface
- 📅 **Calendar Integration** - Schedule and manage events alongside your tasks
- 👥 **Team Collaboration** - Invite team members and collaborate on projects
- 📊 **Analytics Dashboard** - Track productivity and project progress
- 🤖 **AI Assistant** - Get intelligent suggestions and help with task management
- 🎨 **Modern UI** - Clean, responsive design with dark/light theme support
- 🔐 **Secure Authentication** - User authentication and profile management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for backend services)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AfterMath9/DoTask.git
cd DoTask
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Add your Supabase credentials to the `.env.local` file.

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

## Tech Stack

This project is built with modern web technologies:

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (Database, Authentication, Real-time)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Application pages
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
├── integrations/       # External service integrations
├── lib/                # Utility functions
└── main.tsx           # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
