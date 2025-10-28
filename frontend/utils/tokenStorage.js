import Cookies from 'js-cookie';

export const TokenStorage = {
    setToken: (token) =>{
        Cookies.set('auth_token',token, {
            expires: 1,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        })
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