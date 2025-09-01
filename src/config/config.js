// Application Configuration
const config = {
  // API Configuration
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'https://campus-event-backend.onrender.com',
    timeout: 30000, // Increased timeout for slow responses
    endpoints: {
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        logout: '/api/auth/logout',
        me: '/api/auth/me',
        forgotPassword: '/api/auth/forgot-password',
        resetPassword: '/api/auth/reset-password',
        updateProfile: '/api/auth/update-profile',
        updatePassword: '/api/auth/update-password'
      },
      events: {
        list: '/events',
        create: '/events',
        update: '/events',
        delete: '/events',
        register: '/registrations',
        categories: '/categories'
      },
      users: {
        list: '/users',
        profile: '/users/profile',
        upload: '/users/upload'
      },
      notifications: {
        list: '/notifications',
        send: '/notifications/send'
      }
    }
  },

  // Socket Configuration
  socket: {
    url: process.env.REACT_APP_SOCKET_URL || 'https://campus-event-backend.onrender.com',
    options: {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    }
  },

  // App Configuration
  app: {
    name: 'Campus Events',
    version: '1.0.1',
    environment: process.env.NODE_ENV || 'development',
    debug: process.env.NODE_ENV === 'development'
  },

  // Feature Flags
  features: {
    realTimeNotifications: true,
    imageProcessing: true,
    emailNotifications: true,
    analytics: true
  },

  // Validation Rules
  validation: {
    password: {
      minLength: 6,
      requireUppercase: false,
      requireNumbers: false,
      requireSpecialChars: false
    },
    email: {
      requireVerification: false
    }
  }
};

// Ensure config is immutable
Object.freeze(config);

export default config;
