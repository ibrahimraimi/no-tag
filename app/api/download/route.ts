import { type NextRequest, NextResponse } from "next/server"
import { VideoProcessingQueue } from "@/lib/video-utils"

interface DownloadSettings {
  quality: "best" | "high" | "medium" | "low"
  format: "mp4" | "webm" | "avi"
  removeWatermark: boolean
  extractAudio: boolean
}

interface PlatformConfig {
  name: string
  domains: string[]
  supportedQualities: string[]
  hasWatermark: boolean
  audioExtraction: boolean
}

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  tiktok: {
    name: "TikTok",
    domains: ["tiktok.com", "vm.tiktok.com"],
    supportedQualities: ["720p", "480p"],
    hasWatermark: true,
    audioExtraction: true,
  },
  instagram: {
    name: "Instagram",
    domains: ["instagram.com"],
    supportedQualities: ["1080p", "720p", "480p"],
    hasWatermark: false,
    audioExtraction: true,
  },
  youtube: {
    name: "YouTube",
    domains: ["youtube.com", "youtu.be", "m.youtube.com"],
    supportedQualities: ["2160p", "1440p", "1080p", "720p", "480p", "360p"],
    hasWatermark: false,
    audioExtraction: true,
  },
  linkedin: {
    name: "LinkedIn",
    domains: ["linkedin.com"],
    supportedQualities: ["1080p", "720p"],
    hasWatermark: false,
    audioExtraction: false,
  },
}

function detectPlatform(url: string): { platform: PlatformConfig | null; key: string | null } {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()

    for (const [key, config] of Object.entries(PLATFORM_CONFIGS)) {
      if (config.domains.some((domain) => hostname.includes(domain))) {
        return { platform: config, key }
      }
    }
    return { platform: null, key: null }
  } catch {
    return { platform: null, key: null }
  }
}

function validatePlatformUrl(url: string, platformKey: string): { isValid: boolean; error?: string } {
  const urlObj = new URL(url)

  switch (platformKey) {
    case "tiktok":
      if (!url.includes("/video/") && !url.includes("vm.tiktok.com")) {
        return { isValid: false, error: "Invalid TikTok video URL. Please use a direct video link." }
      }
      break
    case "instagram":
      if (!url.includes("/p/") && !url.includes("/reel/") && !url.includes("/tv/")) {
        return { isValid: false, error: "Invalid Instagram URL. Please use a post, reel, or IGTV link." }
      }
      break
    case "youtube":
      if (!url.includes("watch?v=") && !url.includes("youtu.be/") && !url.includes("/shorts/")) {
        return { isValid: false, error: "Invalid YouTube URL. Please use a video or shorts link." }
      }
      break
    case "linkedin":
      if (!url.includes("/posts/") && !url.includes("/videos/")) {
        return { isValid: false, error: "Invalid LinkedIn URL. Please use a post or video link." }
      }
      break
  }

  return { isValid: true }
}

function getOptimalQuality(requestedQuality: string, availableQualities: string[]): string {
  const qualityMap: Record<string, number> = {
    "2160p": 2160,
    "1440p": 1440,
    "1080p": 1080,
    "720p": 720,
    "480p": 480,
    "360p": 360,
  }

  const requestedHeight = qualityMap[requestedQuality] || 1080

  // Find the closest available quality
  let bestMatch = availableQualities[0]
  let bestDiff = Math.abs(qualityMap[bestMatch] - requestedHeight)

  for (const quality of availableQualities) {
    const diff = Math.abs(qualityMap[quality] - requestedHeight)
    if (diff < bestDiff) {
      bestMatch = quality
      bestDiff = diff
    }
  }

  return bestMatch
}

async function simulateVideoProcessing(
  url: string,
  platform: PlatformConfig,
  platformKey: string,
  settings: DownloadSettings,
): Promise<any> {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 2000))

  // Generate mock video info based on platform
  const mockTitles = {
    tiktok: ["Amazing Dance Challenge", "Funny Pet Video", "Cooking Tutorial", "Life Hack Tips"],
    instagram: ["Beautiful Sunset", "Workout Routine", "Art Process", "Travel Vlog"],
    youtube: ["How to Code", "Music Video", "Gaming Stream", "Educational Content"],
    linkedin: ["Professional Tips", "Industry Insights", "Career Advice", "Business Update"],
  }

  const titles = mockTitles[platformKey as keyof typeof mockTitles] || ["Video Content"]
  const randomTitle = titles[Math.floor(Math.random() * titles.length)]

  // Determine quality based on settings and platform support
  let finalQuality: string
  switch (settings.quality) {
    case "best":
      finalQuality = platform.supportedQualities[0]
      break
    case "high":
      finalQuality = getOptimalQuality("1080p", platform.supportedQualities)
      break
    case "medium":
      finalQuality = getOptimalQuality("720p", platform.supportedQualities)
      break
    case "low":
      finalQuality = getOptimalQuality("480p", platform.supportedQualities)
      break
    default:
      finalQuality = platform.supportedQualities[0]
  }

  // Calculate mock file size based on quality and duration
  const duration = Math.floor(Math.random() * 300) + 30 // 30-330 seconds
  const qualityMultiplier = finalQuality.includes("1080") ? 1.5 : finalQuality.includes("720") ? 1.0 : 0.6
  const fileSize = Math.round(duration * qualityMultiplier * 2) // Rough MB calculation

  return {
    title: randomTitle,
    platform: platform.name,
    duration: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")}`,
    quality: finalQuality,
    fileSize: `${fileSize}MB`,
    thumbnail: `/placeholder.svg?height=120&width=160&query=${encodeURIComponent(randomTitle)}`,
    format: settings.extractAudio ? "mp3" : settings.format,
    watermarkRemoved: settings.removeWatermark && platform.hasWatermark,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, settings } = body

    if (!url) {
      return NextResponse.json({ success: false, message: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    let urlObj: URL
    try {
      urlObj = new URL(url)
    } catch {
      return NextResponse.json({ success: false, message: "Invalid URL format" }, { status: 400 })
    }

    // Detect platform
    const { platform, key: platformKey } = detectPlatform(url)
    if (!platform || !platformKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Platform not supported. Please use TikTok, Instagram, YouTube, or LinkedIn URLs.",
        },
        { status: 400 },
      )
    }

    // Validate platform-specific URL format
    const platformValidation = validatePlatformUrl(url, platformKey)
    if (!platformValidation.isValid) {
      return NextResponse.json({ success: false, message: platformValidation.error }, { status: 400 })
    }

    // Check if audio extraction is supported
    if (settings?.extractAudio && !platform.audioExtraction) {
      return NextResponse.json(
        {
          success: false,
          message: `Audio extraction is not supported for ${platform.name} videos.`,
        },
        { status: 400 },
      )
    }

    // Add job to processing queue
    const processingQueue = VideoProcessingQueue.getInstance()
    const jobId = await processingQueue.addJob(url, {
      quality: settings?.quality || "best",
      format: settings?.extractAudio ? "mp3" : settings?.format || "mp4",
      audioOnly: settings?.extractAudio || false,
      removeWatermark: settings?.removeWatermark || false,
    })

    return NextResponse.json({
      success: true,
      message: "Video added to processing queue",
      jobId,
      statusUrl: `/api/download/status?id=${jobId}`,
    })
  } catch (error) {
    console.error("Download API error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again later." },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: "NoTag Downloader API",
    version: "1.0.0",
    supportedPlatforms: Object.values(PLATFORM_CONFIGS).map((config) => ({
      name: config.name,
      domains: config.domains,
      features: {
        watermarkRemoval: config.hasWatermark,
        audioExtraction: config.audioExtraction,
        supportedQualities: config.supportedQualities,
      },
    })),
    endpoints: {
      download: "POST /api/download",
      file: "GET /api/download/file",
      status: "GET /api/download/status",
    },
  })
}
