import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Info } from "lucide-react";

interface PlatformFeature {
  name: string;
  supported: boolean;
  description: string;
}

interface PlatformDetails {
  name: string;
  domains: string[];
  features: PlatformFeature[];
  urlExamples: string[];
  limitations: string[];
}

const PLATFORM_DETAILS: Record<string, PlatformDetails> = {
  tiktok: {
    name: "TikTok",
    domains: ["tiktok.com", "vm.tiktok.com"],
    features: [
      {
        name: "Watermark Removal",
        supported: true,
        description: "Remove TikTok watermarks automatically",
      },
      {
        name: "Audio Extraction",
        supported: true,
        description: "Extract audio as MP3",
      },
      {
        name: "HD Quality",
        supported: false,
        description: "Limited to 720p maximum",
      },
      {
        name: "Batch Download",
        supported: true,
        description: "Download multiple videos",
      },
    ],
    urlExamples: [
      "https://www.tiktok.com/@username/video/1234567890",
      "https://vm.tiktok.com/ZMxxxxxxxx/",
    ],
    limitations: [
      "Maximum quality: 720p",
      "Private videos not supported",
      "Age-restricted content may be blocked",
    ],
  },
  instagram: {
    name: "Instagram",
    domains: ["instagram.com"],
    features: [
      {
        name: "Watermark Removal",
        supported: false,
        description: "No watermarks on Instagram videos",
      },
      {
        name: "Audio Extraction",
        supported: true,
        description: "Extract audio as MP3",
      },
      {
        name: "HD Quality",
        supported: true,
        description: "Up to 1080p quality",
      },
      {
        name: "Stories Support",
        supported: true,
        description: "Download Instagram Stories",
      },
    ],
    urlExamples: [
      "https://www.instagram.com/p/ABC123/",
      "https://www.instagram.com/reel/XYZ789/",
      "https://www.instagram.com/tv/DEF456/",
    ],
    limitations: [
      "Private accounts not supported",
      "Stories expire after 24 hours",
      "Login may be required for some content",
    ],
  },
  youtube: {
    name: "YouTube",
    domains: ["youtube.com", "youtu.be", "m.youtube.com"],
    features: [
      {
        name: "Watermark Removal",
        supported: false,
        description: "No watermarks on YouTube videos",
      },
      {
        name: "Audio Extraction",
        supported: true,
        description: "Extract audio as MP3",
      },
      {
        name: "4K Quality",
        supported: true,
        description: "Up to 2160p quality",
      },
      {
        name: "Playlist Support",
        supported: true,
        description: "Download entire playlists",
      },
    ],
    urlExamples: [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ",
      "https://www.youtube.com/shorts/abc123",
    ],
    limitations: [
      "Age-restricted videos may require verification",
      "Some videos may be geo-blocked",
      "Live streams not supported",
    ],
  },
  linkedin: {
    name: "LinkedIn",
    domains: ["linkedin.com"],
    features: [
      {
        name: "Watermark Removal",
        supported: false,
        description: "No watermarks on LinkedIn videos",
      },
      {
        name: "Audio Extraction",
        supported: false,
        description: "Audio extraction not available",
      },
      {
        name: "HD Quality",
        supported: true,
        description: "Up to 1080p quality",
      },
      {
        name: "Professional Content",
        supported: true,
        description: "Business and educational videos",
      },
    ],
    urlExamples: [
      "https://www.linkedin.com/posts/username_activity-123456789/",
      "https://www.linkedin.com/videos/username/video-id/",
    ],
    limitations: [
      "Login required for most content",
      "Limited to professional content",
      "Audio extraction not supported",
    ],
  },
};

export function PlatformInfo() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Platform Support
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Detailed information about supported platforms and their features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(PLATFORM_DETAILS).map(([key, platform]) => (
          <Card
            key={key}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-xl">{platform.name}</CardTitle>
                  <CardDescription>
                    {platform.domains.map((domain) => domain).join(", ")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <div className="space-y-2">
                  {platform.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {feature.supported ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">
                        {feature.name}
                      </span>
                      <Badge
                        variant={feature.supported ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {feature.supported ? "Supported" : "Not Available"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">URL Examples</h4>
                <div className="space-y-1">
                  {platform.urlExamples.map((example, index) => (
                    <code
                      key={index}
                      className="block text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded break-all"
                    >
                      {example}
                    </code>
                  ))}
                </div>
              </div>

              {platform.limitations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    Limitations
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {platform.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-yellow-500 mt-1">•</span>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
