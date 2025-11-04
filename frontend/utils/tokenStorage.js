
import Cookies from 'js-cookie';

export const TokenStorage = {
         setToken: (token) => {
        try {
            console.log('💾 Setting token in Docker environment');
            console.log('Current host:', window.location.hostname);
            console.log('Current protocol:', window.location.protocol);
            
            // ✅ More permissive cookie settings for Docker
            Cookies.set('auth_token', token, {
                expires: 1,
                path: '/',
                sameSite: 'lax',  // ✅ Changed from 'strict'
                secure: false,     // ✅ Force false for HTTP (Docker)
                // Don't set domain - let browser handle it
            });
            
            console.log('Cookie set, verifying...');
            const check = Cookies.get('auth_token');
            
            if (check === token) {
                console.log('✅ Token saved successfully');
                return true;
            } else {
                console.error('❌ Token NOT saved');
                console.error('All cookies:', document.cookie);
                return false;
            }
        } catch (error) {
            console.error('❌ Error:', error);
            return false;
        }
    },
      getToken: () => {
    return Cookies.get('auth_token');
  },
    removeToken: () => {
    Cookies.remove('auth_token', { path: '/' });
  },
    hasToken: () => {
    return !!Cookies.get('auth_token');
  }
}
