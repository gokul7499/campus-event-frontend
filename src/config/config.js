// Application Configuration
const config = {
  // API Configuration
  api: {
    baseURL:'https://campus-event-h9ks.onrender.com/api',
    timeout: 30000, // Increased timeout for slow responses
    retryAttempts: 3, // Number of retry attempts for failed requests
    endpoints: {
      auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        me: '/auth/me',
        forgotPassword: '/auth/forgot-password',
        resetPassword: '/auth/reset-password',
        updateProfile: '/auth/update-profile',
        updatePassword: '/auth/update-password'
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
