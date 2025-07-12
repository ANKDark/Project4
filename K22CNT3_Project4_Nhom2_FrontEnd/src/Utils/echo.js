import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const token = localStorage.getItem('admin_token');

window.Echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY || '2305b3f530d6c94ce815',
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1',
  forceTLS: true,
  encrypted: true,
  authEndpoint: 'http://127.0.0.1:8000/admin/broadcasting/auth',
  auth: {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/json',
    },
  },
  enabledTransports: ['ws', 'wss'],
});
