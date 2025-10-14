export interface ValidationResult {
  isValid: boolean
  platform?: string
  error?: string
  suggestions?: string[]
}

export class PlatformValidator {
  private static readonly PLATFORM_PATTERNS = {
    tiktok: {
      patterns: [
        /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
        /^https?:\/\/vm\.tiktok\.com\/[\w]+/,
        /^https?:\/\/m\.tiktok\.com\/v\/\d+/,
      ],
      name: "TikTok",
      examples: ["https://www.tiktok.com/@username/video/1234567890", "https://vm.tiktok.com/ZMxxxxxxxx/"],
    },
    instagram: {
      patterns: [
        /^https?:\/\/(www\.)?instagram\.com\/p\/[\w-]+/,
        /^https?:\/\/(www\.)?instagram\.com\/reel\/[\w-]+/,
        /^https?:\/\/(www\.)?instagram\.com\/tv\/[\w-]+/,
        /^https?:\/\/(www\.)?instagram\.com\/stories\/[\w.-]+\/\d+/,
      ],
      name: "Instagram",
      examples: ["https://www.instagram.com/p/ABC123/", "https://www.instagram.com/reel/XYZ789/"],
    },
    youtube: {
      patterns: [
        /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
        /^https?:\/\/youtu\.be\/[\w-]+/,
        /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
        /^https?:\/\/m\.youtube\.com\/watch\?v=[\w-]+/,
      ],
      name: "YouTube",
      examples: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://youtu.be/dQw4w9WgXcQ"],
    },
    linkedin: {
      patterns: [
        /^https?:\/\/(www\.)?linkedin\.com\/posts\/[\w-]+_activity-\d+/,
        /^https?:\/\/(www\.)?linkedin\.com\/videos\/[\w-]+\/[\w-]+/,
        /^https?:\/\/(www\.)?linkedin\.com\/feed\/update\/urn:li:activity:\d+/,
      ],
      name: "LinkedIn",
      examples: [
        "https://www.linkedin.com/posts/username_activity-123456789/",
        "https://www.linkedin.com/videos/username/video-id/",
      ],
    },
  }

  static validateUrl(url: string): ValidationResult {
    if (!url || typeof url !== "string") {
      return {
        isValid: false,
        error: "URL is required",
        suggestions: ["Please enter a valid video URL"],
      }
    }

    // Basic URL format validation
    try {
      new URL(url)
    } catch {
      return {
        isValid: false,
        error: "Invalid URL format",
        suggestions: ["Make sure the URL starts with http:// or https://", "Check for typos in the URL"],
      }
    }

    // Check against platform patterns
    for (const [platform, config] of Object.entries(this.PLATFORM_PATTERNS)) {
      const isMatch = config.patterns.some((pattern) => pattern.test(url))
      if (isMatch) {
        return {
          isValid: true,
          platform: config.name,
        }
      }
    }

    // If no platform matches, provide helpful suggestions
    const hostname = new URL(url).hostname.toLowerCase()
    const suggestions: string[] = []

    if (hostname.includes("tiktok")) {
      suggestions.push("For TikTok: Use direct video links like https://www.tiktok.com/@user/video/123")
    } else if (hostname.includes("instagram")) {
      suggestions.push("For Instagram: Use post, reel, or IGTV links like https://www.instagram.com/p/ABC123/")
    } else if (hostname.includes("youtube")) {
      suggestions.push("For YouTube: Use video links like https://www.youtube.com/watch?v=VIDEO_ID")
    } else if (hostname.includes("linkedin")) {
      suggestions.push("For LinkedIn: Use post or video links from your feed")
    } else {
      suggestions.push("Currently supported: TikTok, Instagram, YouTube, and LinkedIn")
      suggestions.push("Make sure you're using a direct link to the video content")
    }

    return {
      isValid: false,
      error: `Platform not supported or invalid URL format for ${hostname}`,
      suggestions,
    }
  }

  static getPlatformExamples(platform?: string): string[] {
    if (platform) {
      const platformKey = platform.toLowerCase()
      const config = this.PLATFORM_PATTERNS[platformKey as keyof typeof this.PLATFORM_PATTERNS]
      return config?.examples || []
    }

    // Return examples for all platforms
    return Object.values(this.PLATFORM_PATTERNS).flatMap((config) => config.examples)
  }

  static getSupportedPlatforms(): Array<{ name: string; examples: string[] }> {
    return Object.values(this.PLATFORM_PATTERNS).map((config) => ({
      name: config.name,
      examples: config.examples,
    }))
  }
}
