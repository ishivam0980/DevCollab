// NextAuth TypeScript type extensions
import 'next-auth';
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      provider: string;
    };
  }
  interface User {
    id: string;
    provider: string;
  }
}
