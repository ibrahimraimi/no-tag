# NoTag Downloader 🎥

A modern web application for downloading videos from popular social media platforms without watermarks.

## ✨ Features

- **Multi-Platform Support**: Download from TikTok, Instagram, YouTube, and LinkedIn
- **Watermark-Free Downloads**: Clean videos without platform watermarks
- **Multiple Formats**: Support for MP4, WebM, and audio-only downloads
- **Quality Options**: Choose from 720p, 1080p, and 4K when available
- **Batch Processing**: Queue multiple downloads simultaneously
- **Download History**: Track and manage your download history
- **Real-time Progress**: Live progress tracking with detailed status updates
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Project Structure

```sh
notag-downloader/
├── app/
│ ├── api/
│ │ └── download/
│ │ ├── route.ts # Main download endpoint
│ │ ├── file/route.ts # File serving endpoint
│ │ └── status/route.ts # Download status tracking
│ ├── globals.css # Global styles
│ ├── layout.tsx # Root layout
│ └── page.tsx # Main page
├── components/
│ ├── ui/ # shadcn/ui components
│ ├── footer.tsx # Footer component
│ ├── header.tsx # Header component
│ ├── platform-info.tsx # Platform information
│ └── video-downloader.tsx # Main downloader interface
├── lib/
│ ├── platform-validators.ts # URL validation utilities
│ ├── utils.ts # General utilities
│ └── video-utils.ts # Video processing utilities
└── public/ # Static assets
```

## 💻 Usage Examples

### Basic Video Download

```typescript
// Example API call to download a video
const downloadVideo = async (url: string, settings: DownloadSettings) => {
  const response = await fetch("/api/download", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, settings }),
  });

  const data = await response.json();
  return data;
};
```

### Using the Video Downloader Component

```tsx
import { VideoDownloader } from "@/components/video-downloader";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <VideoDownloader />
    </div>
  );
}
```

### Platform-Specific URL Validation

```typescript
import { validateUrl, detectPlatform } from "@/lib/platform-validators";

// Validate a URL
const isValid = validateUrl("https://www.tiktok.com/@user/video/123");
console.log(isValid); // true

// Detect platform
const platform = detectPlatform("https://www.instagram.com/p/ABC123/");
console.log(platform); // 'instagram'
```

## 🔧 API Documentation

### POST /api/download

Download a video from a supported platform.

**Request Body:**

```json
{
  "url": "https://www.tiktok.com/@user/video/123456789",
  "settings": {
    "quality": "1080p",
    "format": "mp4",
    "audioOnly": false
  }
}
```

**Response:**

```json
{
  "success": true,
  "jobId": "download_abc123",
  "videoInfo": {
    "title": "Amazing TikTok Video",
    "duration": 30,
    "thumbnail": "https://example.com/thumb.jpg",
    "platform": "tiktok"
  }
}
```

### GET /api/download/status

Check the status of a download job.

**Query Parameters:**

- `jobId`: The job ID returned from the download endpoint

**Response:**

```json
{
  "jobId": "download_abc123",
  "status": "processing",
  "progress": 75,
  "stage": "downloading",
  "downloadUrl": null
}
```

## 🎨 Customization

### Adding New Platforms

1. **Update platform configurations** in `lib/video-utils.ts`:

```typescript
export const PLATFORM_CONFIGS = {
  // ... existing platforms
  newplatform: {
    name: "New Platform",
    domains: ["newplatform.com"],
    urlPattern: /^https?:\/\/(www\.)?newplatform\.com\/.+/,
    features: ["hd", "audio"],
    limitations: ["No 4K support"],
    maxDuration: 600,
    formats: ["mp4", "webm"],
  },
};
```

2. **Add validation logic** in `lib/platform-validators.ts`:

```typescript
export const validateNewPlatformUrl = (url: string): boolean => {
  return /^https?:\/\/(www\.)?newplatform\.com\/.+/.test(url);
};
```

### Customizing the UI Theme

Modify the color scheme in `app/globals.css`:

```css
@layer base {
  :root {
    --primary: 210 100% 50%; /* Blue */
    --primary-foreground: 0 0% 100%; /* White */
    --secondary: 210 40% 96%; /* Light blue */
    /* ... other color variables */
  }
}
```

## 🔒 Environment Variables

Create a `.env.local` file for local development:

```env
# Optional: Custom yt-dlp path
YTDLP_PATH=/usr/local/bin/yt-dlp

# Optional: Download directory
DOWNLOAD_DIR=./downloads

# Optional: Maximum file size (in MB)
MAX_FILE_SIZE=500

# Optional: Rate limiting
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60000
```

## 🧪 Testing

Run the test suite:

```bash
npm test

# or

yarn test
```

Test specific components:

```bash
npm test -- --testPathPattern=video-downloader
```

## 📱 Mobile Support

The application is fully responsive and includes:

- Touch-friendly interface
- Optimized layouts for mobile screens
- Progressive Web App (PWA) capabilities
- Offline download history access

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in the Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy your app

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t notag-downloader .
docker run -p 3000:3000 notag-downloader
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write tests for new features
- Update documentation for API changes
- Follow the existing code style

## 📄 Legal Considerations

- **Respect Terms of Service**: Always comply with platform terms of service
- **Copyright Compliance**: Only download content you have rights to use
- **Personal Use**: This tool is intended for personal, non-commercial use
- **Rate Limiting**: Implement appropriate rate limiting to avoid overwhelming servers

## 🐛 Troubleshooting

### Common Issues

**"Invalid URL" Error:**

```typescript
// Ensure URL includes protocol
const url = "https://www.tiktok.com/@user/video/123"; // ✅ Correct
const url = "www.tiktok.com/@user/video/123"; // ❌ Missing protocol
```

**Download Fails:**

- Check if the video is public
- Verify the URL is correct
- Ensure yt-dlp is installed and updated

**Slow Downloads:**

- Check your internet connection
- Try a different quality setting
- Verify server resources

## 📊 Performance

- **Average download time**: 10-30 seconds for HD videos
- **Supported file sizes**: Up to 500MB per video
- **Concurrent downloads**: Up to 5 simultaneous downloads
- **Platform response time**: < 2 seconds for video info retrieval

## 🔮 Roadmap

- [ ] Browser extension support
- [ ] Playlist download functionality
- [ ] Advanced video editing features
- [ ] Cloud storage integration
- [ ] Mobile app development
- [ ] API rate limiting dashboard
- [ ] User authentication system
- [ ] Premium features

**⚠️ Disclaimer**: This tool is for educational and personal use only. Users are responsible for complying with applicable laws and platform terms of service.
