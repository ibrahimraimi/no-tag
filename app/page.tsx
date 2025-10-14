import { Header } from "@/components/header";
import { PlatformInfo } from "@/components/platform-info";
import { VideoDownloader } from "@/components/video-downloader";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              NoTag Downloader
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
              Download videos without watermarks
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports TikTok, Instagram, YouTube, and LinkedIn
            </p>
          </div>
          <VideoDownloader />

          <div className="mt-16">
            <PlatformInfo />
          </div>
        </div>
      </main>
    </div>
  );
}
