import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/jobs/:path*',
    '/documents/:path*',
    '/api/jobs/:path*'
  ],
}