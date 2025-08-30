# Frontend Deployment Guide

## Netlify Deployment

### Prerequisites
- Node.js 18+
- Git repository connected to Netlify
- Backend deployed and accessible

### Environment Variables
Set these in your Netlify dashboard:

```env
REACT_APP_API_URL=https://campus-event-backend.onrender.com
REACT_APP_SOCKET_URL=https://campus-event-backend.onrender.com
GENERATE_SOURCEMAP=false
CI=false
```

### Build Settings
- **Build Command**: `npm run build`
- **Publish Directory**: `build`
- **Node Version**: 18.x

### Local Production Build

#### Windows (Batch)
```bash
build-production.bat
```

#### PowerShell
```powershell
.\build-production.ps1
```

#### Manual Build
```bash
# Set environment variables
set REACT_APP_API_URL=https://campus-event-backend.onrender.com
set REACT_APP_SOCKET_URL=https://campus-event-backend.onrender.com
set GENERATE_SOURCEMAP=false
set CI=false

# Build
npm run build
```

### Troubleshooting

#### Build Fails
- Check Node.js version (18+ required)
- Verify all dependencies are installed
- Check for syntax errors in code

#### API Connection Issues
- Verify backend URL is correct
- Check CORS settings on backend
- Ensure backend is running and accessible

#### Runtime Errors
- Check browser console for errors
- Verify environment variables are set
- Check network tab for failed requests

### Debug Information
The app includes debug logging:
- API requests and responses
- Socket connection status
- Authentication state changes

### Expected Behavior
- ✅ Login form connects to backend
- ✅ No localhost references
- ✅ All API calls use production URL
- ✅ Real-time features work via Socket.io
