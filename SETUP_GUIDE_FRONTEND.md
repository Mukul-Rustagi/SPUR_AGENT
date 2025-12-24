# Frontend Setup Guide

This guide provides detailed instructions for setting up and running the frontend of the Spur AI Live Chat Agent.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18 or higher
  - Check your version: `node --version`
  - Download: [https://nodejs.org/](https://nodejs.org/)
- **npm**: Version 9 or higher (comes with Node.js)
  - Check your version: `npm --version`
- **Backend Running**: The backend server should be running on `http://localhost:3001`
  - See [SETUP_GUIDE_BACKEND.md](./SETUP_GUIDE_BACKEND.md) for backend setup

## 🚀 Step-by-Step Setup

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `react` - React library
- `react-dom` - React DOM renderer
- `vite` - Build tool and dev server
- `typescript` - TypeScript compiler
- `tailwindcss` - CSS framework
- `@vitejs/plugin-react` - Vite React plugin
- Development dependencies

**Expected Output:**
```
added 200+ packages
```

### Step 3: Verify Configuration

The frontend is pre-configured to connect to the backend. Check `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

This configuration:
- Runs the frontend on port 3000
- Proxies all `/api` requests to `http://localhost:3001` (backend)
- Enables CORS for development

**Note**: If your backend runs on a different port, update the `target` in `vite.config.ts`.

### Step 4: Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 5: Open in Browser

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the chat interface with:
- A chat window
- Input field at the bottom
- Example questions (if configured)
- Send button

### Step 6: Test the Connection

1. Make sure the backend is running (see backend setup guide)
2. Try sending a message or clicking an example question
3. You should see:
   - Your message appear in the chat
   - A typing indicator while the AI responds
   - The AI's response appear

## 🔧 Configuration Options

### Changing the Backend URL

If your backend runs on a different URL (e.g., production), you have two options:

#### Option 1: Update Vite Config (Development)

Edit `frontend/vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3002', // Change port here
        changeOrigin: true,
      },
    },
  },
});
```

#### Option 2: Use Environment Variables (Production)

Create `frontend/.env`:

```env
VITE_API_URL=http://your-backend-url.com
```

Then update your API calls to use `import.meta.env.VITE_API_URL`.

**Note**: Vite requires the `VITE_` prefix for environment variables to be exposed to the client.

### Changing the Port

Edit `frontend/vite.config.ts`:

```typescript
server: {
  port: 3000, // Change to your desired port
  // ...
}
```

Or use command line:
```bash
npm run dev -- --port 3002
```

## 🎨 Customization

### Styling

The frontend uses Tailwind CSS. To customize styles:

1. Edit `frontend/src/index.css` for global styles
2. Edit component files (e.g., `ChatWidget.tsx`) for component-specific styles
3. Tailwind config: `frontend/tailwind.config.js`

### Chat Widget

The main chat component is in `frontend/src/components/ChatWidget.tsx`. You can customize:
- Message appearance
- Colors and themes
- Layout
- Example questions

## 🧪 Testing the Frontend

### Manual Testing Checklist

- [ ] Page loads without errors
- [ ] Chat interface is visible
- [ ] Can type in input field
- [ ] Send button is clickable
- [ ] Sending a message shows it in chat
- [ ] AI response appears after sending
- [ ] Typing indicator shows while waiting
- [ ] Error messages display if backend is down
- [ ] Conversation history loads on page refresh
- [ ] Example questions work (if present)
- [ ] Responsive design works on mobile

### Testing with Backend

1. **Start Backend** (in a separate terminal):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Flow**:
   - Open http://localhost:3000
   - Send a message: "What's your return policy?"
   - Verify AI response appears
   - Refresh page
   - Verify conversation history loads

## 🐛 Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: "Failed to fetch" or network errors

**Possible Causes:**
1. Backend is not running
2. Backend is on a different port
3. CORS issues

**Solution:**
1. Verify backend is running:
   ```bash
   curl http://localhost:3001/api/health
   ```
2. Check `vite.config.ts` proxy configuration
3. Check browser console for detailed error messages
4. Verify backend CORS is enabled

### Issue: Port 3000 already in use

**Solution:**
1. Change port in `vite.config.ts`:
   ```typescript
   server: {
     port: 3002, // Use different port
   }
   ```
2. Or stop the process using port 3000:
   ```bash
   # On Windows
   netstat -ano | findstr :3000
   
   # On macOS/Linux
   lsof -i :3000
   ```

### Issue: TypeScript errors

**Solution:**
```bash
# Check for type errors
npx tsc --noEmit

# If errors persist, try rebuilding
rm -rf node_modules
npm install
```

### Issue: Tailwind styles not working

**Solution:**
1. Verify Tailwind is configured in `tailwind.config.js`
2. Check that `index.css` imports Tailwind:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
3. Restart the dev server

### Issue: Hot reload not working

**Solution:**
1. Restart the dev server
2. Clear browser cache
3. Check for file system watcher limits (especially on Windows)

### Issue: Build errors

**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules/.vite
npm run build
```

## 📦 Production Build

To build for production:

```bash
npm run build
```

This will:
- Compile TypeScript
- Bundle and minify code
- Optimize assets
- Output to `dist` directory

**Expected Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
```

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

This serves the `dist` directory on a local server (usually port 4173).

### Deploying to Production

#### Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Configure environment variables if needed

#### Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

#### Other Static Hosting

1. Build the project: `npm run build`
2. Upload the `dist` directory to your hosting service
3. Configure the server to serve `index.html` for all routes (SPA routing)

**Important**: Update the API URL in production to point to your deployed backend, not `localhost`.

## 🔍 Development Tips

### Hot Module Replacement (HMR)

Vite provides fast HMR. Changes to React components will update instantly without full page reload.

### Browser DevTools

Use browser DevTools to:
- Inspect network requests (Network tab)
- Debug React components (React DevTools extension)
- Check console for errors
- Test responsive design (Device toolbar)

### TypeScript

The project uses TypeScript for type safety. Use your IDE's TypeScript features:
- Auto-completion
- Type checking
- Refactoring tools

### Code Formatting

Consider using Prettier for consistent code formatting:

```bash
npm install -D prettier
```

## 📚 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ChatWidget.tsx    # Main chat component
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── public/                    # Static assets
├── index.html                 # HTML template
├── package.json               # Dependencies
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── tsconfig.node.json         # TypeScript config for Node
```

## 🎯 Next Steps

Once the frontend is running:
1. Test the chat functionality
2. Customize the UI if needed
3. Deploy to production when ready
4. Connect to production backend

## 🆘 Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure backend is running and accessible
4. Check browser console for errors
5. Verify network requests in DevTools

---

**Frontend is now ready!** 🎉

