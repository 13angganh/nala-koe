import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

// Root page — redirect ke login
// proxy.ts akan redirect ke /dashboard jika sudah ada session cookie
export default function RootPage() {
  redirect(ROUTES.LOGIN);
}
