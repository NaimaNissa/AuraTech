export default function Footer() {
  return (
    <footer className="text-white py-8 mt-auto" style={{ backgroundColor: 'rgb(121, 130, 1)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>AuraTech</h3>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Your trusted source for premium technology products
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center md:items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Follow us:</span>
              <a
                href="https://www.instagram.com/auratech_5/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                aria-label="Follow us on Instagram"
              >
                <svg
                  className="h-5 w-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://au.pinterest.com/auratechs30/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl overflow-hidden"
                aria-label="Follow us on Pinterest"
                style={{ backgroundColor: 'transparent' }}
              >
                <img 
                  src="/pinterest.webp" 
                  alt="Pinterest" 
                  className="h-10 w-10 object-contain"
                  style={{
                    transform: 'scale(1.8)'
                  }}
                />
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a
                href="mailto:auratechs30@gmail.com"
                className="text-sm text-white hover:underline"
                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
              >
                auratechs30@gmail.com
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 text-center" style={{ borderTop: '1px solid rgba(250, 226, 68, 0.2)' }}>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            © {new Date().getFullYear()} AuraTech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

