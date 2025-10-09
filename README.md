# Magic Note - Note-Taking Application

A modern, MacBook Notes-like note-taking application built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Secure email/password authentication with Supabase
- 📁 **Folder Management**: Create, organize, and manage folders (flat structure)
- 📝 **Notes**: Rich markdown editor with live preview
- 📋 **Copy Functionality**: 
  - Copy entire note content
  - Copy selected text
  - Copy individual lines (hover-based buttons)
- 💾 **Auto-save**: Automatic saving with debounced updates
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS and Shadcn/UI
- 🔒 **Security**: Row-level security policies for data isolation
- 📱 **Responsive**: Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn/UI
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Editor**: React Markdown with GitHub Flavored Markdown
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kodirov8788/magic-note.git
   cd magic-note
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the database migration:
     ```sql
     -- Copy and run the SQL from supabase/migrations/001_initial_schema.sql
     ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
magic-note/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/                # Shadcn/UI components
│   │   ├── auth/              # Authentication components
│   │   ├── folders/           # Folder management
│   │   ├── notes/             # Note components
│   │   └── layout/            # Layout components
│   ├── lib/                   # Utility libraries
│   │   └── supabase/          # Supabase client configuration
│   └── types/                  # TypeScript type definitions
├── supabase/                   # Database migrations
├── .cursor/                    # Cursor IDE configuration
└── current-tasks/              # Development task tracking
```

## Database Schema

### Tables

**folders**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `name` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**notes**
- `id` (uuid, primary key)
- `folder_id` (uuid, nullable foreign key)
- `user_id` (uuid, foreign key)
- `title` (text)
- `content` (text, markdown)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Security

- Row-Level Security (RLS) enabled on all tables
- Users can only access their own folders and notes
- Authentication required for all operations

## Usage

### Authentication
1. Sign up with email and password
2. Log in to access your notes
3. Session persists across browser sessions

### Managing Folders
1. Click "New Folder" in the sidebar
2. Enter folder name and create
3. Click on folders to view their notes
4. Folders are displayed in chronological order

### Creating Notes
1. Select a folder from the sidebar
2. Click "New Note" or "Create Note"
3. Enter title and content (markdown supported)
4. Notes auto-save as you type

### Copy Functionality
- **Copy All**: Click the "Copy All" button to copy entire note
- **Copy Selected**: Select text and click "Copy Selected"
- **Copy Line**: Hover over a line to see copy button on the left

### Markdown Support
The editor supports GitHub Flavored Markdown:
- **Bold** and *italic* text
- `Code blocks` and `inline code`
- # Headers
- - Lists
- [Links](https://example.com)
- And more!

## Development

### Type Checking
```bash
npm run type-check
# or
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

### Building
```bash
npm run build
```

### Database Types
Generate TypeScript types from Supabase:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Shadcn/UI](https://ui.shadcn.com/) - UI components
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering

## Support

If you encounter any issues or have questions, please:
1. Check the [Issues](https://github.com/kodirov8788/magic-note/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

---

Built with ❤️ using modern web technologies.