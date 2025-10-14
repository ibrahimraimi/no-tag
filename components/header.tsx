import { Download } from "lucide-react"

export function Header() {
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Download className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">NoTag Downloader</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#supported"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Supported Platforms
            </a>
            <a
              href="#about"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              About
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
