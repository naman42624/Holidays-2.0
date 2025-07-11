// Test if user routes can be loaded
import { userRoutes } from './src/routes/user.routes';

console.log('User routes loaded successfully:', typeof userRoutes);
console.log('Route stack:', userRoutes.stack?.length || 0, 'routes');
