import { type NextRequest, NextResponse } from "next/server"
import { VideoProcessingQueue } from "@/lib/video-utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    const processingQueue = VideoProcessingQueue.getInstance()
    const job = processingQueue.getJob(id)

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const response = {
      id: job.id,
      status: job.status,
      progress: job.progress,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      error: job.error,
      result: job.result
        ? {
            downloadUrl: job.result.downloadUrl,
            metadata: job.result.metadata,
          }
        : undefined,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get("action")

    if (action === "list") {
      const processingQueue = VideoProcessingQueue.getInstance()
      const jobs = processingQueue.getAllJobs()

      return NextResponse.json({
        jobs: jobs.map((job) => ({
          id: job.id,
          url: job.url,
          status: job.status,
          progress: job.progress,
          createdAt: job.createdAt,
          completedAt: job.completedAt,
        })),
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Status update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
