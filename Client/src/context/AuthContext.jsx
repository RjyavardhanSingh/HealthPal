import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Clean initialization that properly checks localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state');
        // Default - not authenticated
        let isAuth = false;
        let user = null;
        let token = null;

        // Check localStorage for existing auth
        const storedToken = localStorage.getItem('authToken');
        const storedUserStr = localStorage.getItem('currentUser');

        if (storedToken && storedUserStr) {
          try {
            // Validate token format
            if (!storedToken || 
                storedToken === 'undefined' || 
                storedToken === 'null' ||
                storedToken.length < 20) { // Simple validation for token length
              console.warn('Invalid token format found in storage');
              clearAuthState();
              return;
            }

            user = JSON.parse(storedUserStr);

            // Validate minimal user data
            if (!user || !user._id || !user.role) {
              console.warn('Invalid user data found in storage');
              clearAuthState();
              return;
            }

            token = storedToken;
            isAuth = true;
            
            // Set token for API requests
            api.setAuthToken(token);
            console.log('Auth initialized with role:', user?.role);
            
            // Optional: You could add an API call to verify token validity
            try {
              await api.auth.verifyToken();
            } catch (verifyError) {
              console.warn('Token verification failed, clearing auth state');
              clearAuthState();
              return;
            }
          } catch (e) {
            console.error('Failed to parse stored user:', e);
            clearAuthState();
            return;
          }
        } else {
          console.log('No auth data found in storage');
          clearAuthState();
        }

        // Update state based on what we found
        setCurrentUser(user);
        setUserToken(token);
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthState = () => {
    console.log('Clearing auth state');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setUserToken(null);
    setIsAuthenticated(false);
    api.clearAuthToken();
  };

  const login = async (token, userData) => {
    try {
      console.log('Processing login with user data:', userData);
      
      // Ensure role is explicitly preserved
      const processedUserData = {
        ...userData,
        role: userData.role
      };
      
      // Update localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(processedUserData));
      
      // Update state
      setUserToken(token);
      setCurrentUser(processedUserData);
      setIsAuthenticated(true);
      api.setAuthToken(token);
      
      return processedUserData;
    } catch (error) {
      console.error('Login processing error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      clearAuthState();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    clearAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};