# TechDiary

A modern blogging platform designed specifically for the tech community. Built for developers, by developers.

![TechDiary](public/og.png)

## 🌟 Overview

TechDiary is a feature-rich blogging platform that empowers developers and tech enthusiasts to share knowledge, document their journey, and build meaningful connections within the tech community. With support for multiple languages, intuitive writing tools, and powerful engagement features, TechDiary creates the perfect environment for technical content creation and discovery.

## ✨ Key Features

### 📝 Content Creation
- **Rich Markdown Editor** with live preview and auto-save
- **Drag-and-drop Image Upload** with cropping capabilities  
- **Series Support** for organizing related articles
- **Draft Management** with autosave every 30 seconds
- **SEO Optimization** with meta tags and structured data

### 🌍 Multi-language Support
- **Bengali and English** interface support
- **Localized Content** with proper date and number formatting
- **Easy Language Switching** with persistent preferences

### 🔍 Powerful Search
- **Full-text Search** powered by MeilSearch
- **Advanced Filtering** by tags, authors, and dates
- **Real-time Search Suggestions** and auto-complete
- **Fast Response Times** (<500ms average)

### 💬 Rich Engagement
- **Emoji Reactions** (Love, Fire, Wow, Haha, Cry, Unicorn)
- **Threaded Comments** with nested discussions
- **Bookmarking System** for saving articles
- **Following System** to track favorite authors

### 🔐 Secure Authentication
- **GitHub OAuth** integration for developers
- **Secure Session Management** with automatic renewal
- **Profile Customization** with bio, location, education, and social links

### 🎨 Modern UI/UX
- **Dark/Light Theme** support
- **Responsive Design** for all devices
- **Accessibility Compliant** (WCAG 2.1 AA)
- **Progressive Web App** capabilities

## 🛠 Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - Component library

### Backend & Database
- **[SQLKit](https://github.com/sqlkit-dev/sqlkit)** - Very light sql query builder, we are using most of the sql query using this.
- **[Drizzle ORM](https://orm.drizzle.team/)** - Awesome sql tool but we are only using for migration
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Backend API

### Search & Storage
- **[MeilSearch](https://www.meilisearch.com/)** - Fast, typo-tolerant search
- **[Cloudinary](https://cloudinary.com/)** - Image optimization and storage
- **[Cloudflare R2](https://www.cloudflare.com/en-gb/developer-platform/products/r2/)** - Alternative file storage

### State Management
- **[Jotai](https://jotai.org/)** - Atomic state management
- **[TanStack Query](https://tanstack.com/query)** - Server state management
- **[React Hook Form](https://react-hook-form.com/)** - Form handling
- **[Zod](https://zod.dev/)** - Schema validation

### Development Tools
- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** or **Bun 1.0+**
- **PostgreSQL 14+**
- **MeilSearch instance**
- **Cloudinary account**
- **GitHub OAuth App**

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/techdiary"

# Authentication
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
GITHUB_CALLBACK_URL="http://localhost:3000/api/auth/github/callback"

# File Storage
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

# Search
MEILISEARCH_ADMIN_API_KEY="your_meilisearch_admin_key"
NEXT_PUBLIC_MEILISEARCH_API_HOST="http://localhost:7700"
NEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY="your_meilisearch_search_key"
```

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/techdiary-dev/techdiary.dev.git
   cd techdiary.dev
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up the database**
   ```bash
   # Generate database schema
   bun run db:generate
   
   # Apply migrations
   bun run db:push
   ```

4. **Start the development server**
   ```bash
   bun run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Available Scripts

```bash
# Development
bun run dev              # Start development server
bun run build            # Build for production
bun run start            # Start production server
bun run lint             # Run ESLint

# Database
bun run db:generate      # Generate migrations from schema changes
bun run db:push          # Push schema changes to database
bun run db:studio        # Open Drizzle Studio (database GUI)

# Backend
bun run play             # Run backend playground script
```

## 🏗 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (home)/            # Homepage routes
│   │   ├── (dashboard-editor)/ # Protected dashboard routes
│   │   ├── [username]/        # User profile pages
│   │   └── api/               # API routes
│   ├── backend/               # Backend logic and services
│   │   ├── models/            # Domain models and types
│   │   ├── persistence/       # Database schemas and repositories
│   │   └── services/          # Business logic and actions
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── Editor/           # Article editor components
│   │   ├── Navbar/           # Navigation components
│   │   └── render-props/     # Render prop components
│   ├── hooks/                # Custom React hooks
│   ├── i18n/                 # Internationalization
│   ├── lib/                  # Utility libraries
│   ├── store/                # Global state management
│   └── styles/               # Global styles and CSS
├── docs/                     # Documentation
│   ├── components/           # Component documentation
│   ├── hooks/               # Hooks documentation
│   └── PRD.md              # Product Requirements Document
├── public/                   # Static assets
└── migrations/              # Database migrations
```

## 🎯 Core Features Deep Dive

### Article Editor
- **Markdown Support**: Full markdown syntax with extensions
- **Live Preview**: Real-time preview with markdoc parser
- **Auto-save**: Saves drafts automatically every 30 seconds
- **Media Upload**: Drag-and-drop with image cropping
- **Publishing Controls**: Draft/publish with scheduling

### Search System
- **MeilSearch Integration**: Lightning-fast full-text search
- **Typo Tolerance**: Finds results even with spelling mistakes
- **Faceted Search**: Filter by tags, authors, dates
- **Search Analytics**: Track popular searches and content gaps

### User Experience
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Performance**: <3 second page loads, optimized images
- **PWA Ready**: App-like experience on mobile devices

### Community Features
- **User Profiles**: Rich profiles with bio, skills, social links
- **Following System**: Follow favorite authors and topics
- **Engagement Tools**: Reactions, comments, bookmarks
- **Content Discovery**: Personalized recommendations

## 🌐 Internationalization

TechDiary supports multiple languages with full localization:

- **Interface Translation**: All UI elements translated
- **Content Localization**: Date, number, and currency formatting
- **RTL Support**: Right-to-left text support
- **Language Detection**: Automatic language detection and switching

Currently supported languages:
- 🇺🇸 English
- 🇧🇩 Bengali (বাংলা)

## 🔧 Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Enforced code quality rules
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Structured commit messages

### Component Architecture
- **Atomic Design**: Reusable component architecture
- **Render Props**: Logic separation with render props pattern
- **Custom Hooks**: Reusable stateful logic
- **Type Safety**: Comprehensive TypeScript coverage


## 📖 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Component Documentation](docs/components/README.md)** - Custom components guide
- **[Hooks Documentation](docs/hooks/README.md)** - Custom hooks reference
- **[PRD](docs/PRD.md)** - Product Requirements Document
- **[API Documentation](docs/api/README.md)** - Backend API reference

## 🚢 Deployment

### Production Requirements
- **Node.js 18+** runtime environment
- **PostgreSQL 14+** database
- **MeilSearch** search service
- **Cloudinary** for image storage
- **GitHub OAuth** application

### Recommended Hosting
- **Vercel** - Frontend and API hosting
- **Railway/Supabase** - PostgreSQL database
- **Meilisearch Cloud** - Search service
- **Cloudinary** - Image CDN

### Environment Setup
1. Set up production environment variables
2. Configure database with SSL
3. Set up MeilSearch with proper indexes
4. Configure Cloudinary transformations
5. Set up GitHub OAuth for production domain

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow our code style and conventions
4. **Write tests**: Ensure your changes are tested
5. **Submit a pull request**: With a clear description of changes

### Development Setup
1. Follow the Quick Start guide
2. Read the component and hooks documentation
3. Check existing issues or create new ones
4. Join our Discord community for discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **shadcn** - For the beautiful UI component library
- **MeilSearch** - For the powerful search engine
- **Open Source Community** - For the incredible tools and libraries

## 📞 Support & Community

- **Website**: [techdiary.dev](https://techdiary.dev)
- **Discord**: [Join our community](https://go.techdiary.dev/discord)
- **GitHub Issues**: [Report bugs or request features](https://github.com/techdiary-dev/techdiary.dev/issues)
- **Email**: hello@techdiary.dev

---

<div align="center">

**Built with ❤️ by the TechDiary Team**

[⭐ Star this repo](https://github.com/techdiary-dev/techdiary.dev) • [🐛 Report Bug](https://github.com/techdiary-dev/techdiary.dev/issues) • [✨ Request Feature](https://github.com/techdiary-dev/techdiary.dev/issues)

</div>