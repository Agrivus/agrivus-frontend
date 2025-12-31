# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

# Agrivus Frontend

Modern React + TypeScript frontend for the Agrivus digital agricultural marketplace.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

App will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

**Vercel (Recommended):**

```bash
npm install -g vercel
vercel --prod
```

See [DEPLOYMENT.md](../DEPLOYMENT.md) for complete guide.

## 🎨 Tech Stack

- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite (Rolldown)
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **State Management:** React Context API
- **API Client:** Axios
- **Real-time:** Socket.IO Client

## 📁 Project Structure

```
src/
├── components/
│   ├── common/      # Reusable UI components
│   ├── marketplace/ # Marketplace-specific components
│   └── chat/        # Chat components
├── contexts/        # React contexts
├── pages/           # Page components
├── services/        # API services
├── types/           # TypeScript types
└── utils/           # Helper functions
```

## 🔧 Environment Variables

Create `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

For production (Vercel dashboard):

```bash
VITE_API_BASE_URL=https://your-backend-url.up.railway.app
```

## 🎨 Key Features

- **Marketplace:** Browse and create product listings
- **Auctions:** Live bidding system
- **Orders:** Track orders and transport
- **Wallet:** Manage funds with escrow
- **Chat:** Real-time messaging
- **Notifications:** Live updates via WebSocket
- **Export Gateway:** International trade tools
- **Admin Dashboard:** Platform management

## 🧪 Development

```bash
# Lint code
npm run lint

# Type check
npm run build
```

## 📦 Build Output

Production build outputs to `/dist`:

- Optimized JS bundles
- Minified CSS
- Static assets

## 🚢 Deployment Platforms

- **Vercel** (Recommended) - Auto-deploys from GitHub
- **Netlify** - Alternative, similar setup
- **Railway** - Can host static sites
- **Any static host** - Just upload `/dist` folder

## 🎯 Performance

- Code splitting for faster loads
- Lazy loading of routes
- Optimized images
- Tailwind CSS purging for smaller CSS bundles

## 📄 License

Proprietary - Agrivus (Pvt) Ltd

## 👥 Development Team

- Takura Mudzimbasekwa - Lead Developer
- Takudzwa Mbereko - Full Stack Developer
- Tinerombo Mudzimbasekwa - QA & Documentation
