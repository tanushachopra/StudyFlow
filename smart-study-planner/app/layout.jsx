import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata = {
  title: 'StudyFlow — AI Study Planner',
  description: 'Plan smarter. Study better. Powered by AI.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0E1420',
              color: '#F0F4FF',
              border: '1px solid #1E2D4A',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#0E1420' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#0E1420' },
            },
          }}
        />
      </body>
    </html>
  )
}
