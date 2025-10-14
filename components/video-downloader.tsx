"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  History,
  Settings,
  Trash2,
  RefreshCw,
  Copy,
} from "lucide-react";
import { Buffer } from "buffer";

interface DownloadResult {
  success: boolean;
  message: string;
  downloadUrl?: string;
  videoInfo?: {
    title: string;
    platform: string;
    duration: string;
    quality: string;
    thumbnail?: string;
    fileSize?: string;
  };
}

interface DownloadHistoryItem {
  id: string;
  url: string;
  title: string;
  platform: string;
  status: "completed" | "failed" | "processing";
  timestamp: Date;
  downloadUrl?: string;
}

interface DownloadSettings {
  quality: "best" | "high" | "medium" | "low";
  format: "mp4" | "webm" | "avi";
  removeWatermark: boolean;
  extractAudio: boolean;
}

interface JobStatus {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: {
    stage: string;
    progress: number;
    message: string;
    estimatedTimeRemaining?: number;
  };
  result?: {
    downloadUrl: string;
    metadata: {
      title: string;
      duration: number;
      thumbnail: string;
      uploader: string;
    };
  };
  error?: string;
}

export function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [settings, setSettings] = useState<DownloadSettings>({
    quality: "best",
    format: "mp4",
    removeWatermark: true,
    extractAudio: false,
  });
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem("download-history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("download-history", JSON.stringify(history));
  }, [history]);

  const supportedPlatforms = [
    { name: "TikTok", color: "bg-pink-500", domains: ["tiktok.com"] },
    { name: "Instagram", color: "bg-purple-500", domains: ["instagram.com"] },
    {
      name: "YouTube",
      color: "bg-red-500",
      domains: ["youtube.com", "youtu.be"],
    },
    { name: "LinkedIn", color: "bg-blue-600", domains: ["linkedin.com"] },
  ];

  const validateUrl = (
    url: string
  ): { isValid: boolean; platform?: string; error?: string } => {
    try {
      const urlObj = new URL(url);
      const platform = supportedPlatforms.find((p) =>
        p.domains.some((domain) => urlObj.hostname.includes(domain))
      );

      if (!platform) {
        return {
          isValid: false,
          error:
            "Platform not supported. Please use TikTok, Instagram, YouTube, or LinkedIn URLs.",
        };
      }

      return { isValid: true, platform: platform.name };
    } catch {
      return { isValid: false, error: "Invalid URL format" };
    }
  };

  const pollJobStatus = async (jobId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/download/status?id=${jobId}`);
      const jobStatus: JobStatus = await response.json();

      console.log("[v0] Job status:", jobStatus);

      setProgress(jobStatus.progress.progress);
      setProgressMessage(jobStatus.progress.message);

      if (jobStatus.status === "completed") {
        const downloadUrl =
          jobStatus.result?.downloadUrl ||
          `/api/download/file?id=${Buffer.from(jobId).toString(
            "base64url"
          )}&format=${settings.format}`;

        setResult({
          success: true,
          message: "Video downloaded successfully!",
          downloadUrl: downloadUrl,
          videoInfo: {
            title: jobStatus.result?.metadata?.title || "Downloaded Video",
            platform: "Video Platform",
            duration: jobStatus.result?.metadata?.duration
              ? `${Math.floor(jobStatus.result.metadata.duration / 60)}:${(
                  jobStatus.result.metadata.duration % 60
                )
                  .toString()
                  .padStart(2, "0")}`
              : "Unknown",
            quality: settings.quality,
            thumbnail: jobStatus.result?.metadata?.thumbnail,
            fileSize: "Unknown",
          },
        });

        // Update history
        setHistory((prev) =>
          prev.map((item) =>
            item.id === currentJobId
              ? {
                  ...item,
                  title:
                    jobStatus.result?.metadata?.title || "Downloaded Video",
                  status: "completed",
                  downloadUrl: downloadUrl,
                }
              : item
          )
        );

        setTimeout(() => {
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = `${jobStatus.result?.metadata?.title || "video"}.${
            settings.format
          }`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 1000);

        setIsLoading(false);
        setCurrentJobId(null);
        setTimeout(() => {
          setProgress(0);
          setProgressMessage("");
        }, 3000);
      } else if (jobStatus.status === "failed") {
        // Job failed
        setResult({
          success: false,
          message:
            jobStatus.error || "Video processing failed. Please try again.",
        });

        setHistory((prev) =>
          prev.map((item) =>
            item.id === currentJobId
              ? { ...item, status: "failed" as const }
              : item
          )
        );

        setIsLoading(false);
        setCurrentJobId(null);
        setTimeout(() => {
          setProgress(0);
          setProgressMessage("");
        }, 2000);
      } else if (
        jobStatus.status === "processing" ||
        jobStatus.status === "queued"
      ) {
        setTimeout(() => pollJobStatus(jobId), 500);
      }
    } catch (error) {
      console.error("[v0] Polling error:", error);
      setResult({
        success: false,
        message: "Failed to check processing status. Please try again.",
      });
      setIsLoading(false);
      setCurrentJobId(null);
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) return;

    const validation = validateUrl(url.trim());
    if (!validation.isValid) {
      setResult({ success: false, message: validation.error || "Invalid URL" });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setProgress(0);
    setProgressMessage("Starting download...");

    const historyItem: DownloadHistoryItem = {
      id: Date.now().toString(),
      url: url.trim(),
      title: "Processing...",
      platform: validation.platform || "Unknown",
      status: "processing",
      timestamp: new Date(),
    };
    setHistory((prev) => [historyItem, ...prev]);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          settings,
        }),
      });

      const data = await response.json();

      if (data.success && data.jobId) {
        // Start polling for job status
        setCurrentJobId(data.jobId);
        setProgressMessage("Video added to processing queue");
        pollJobStatus(data.jobId);
      } else {
        // Handle immediate error
        setResult({
          success: false,
          message: data.message || "Failed to start video processing",
        });

        setHistory((prev) =>
          prev.map((item) =>
            item.id === historyItem.id
              ? { ...item, status: "failed" as const }
              : item
          )
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error("[v0] Download error:", error);
      setResult({
        success: false,
        message: "Failed to process video. Please try again.",
      });

      setHistory((prev) =>
        prev.map((item) =>
          item.id === historyItem.id
            ? { ...item, status: "failed" as const }
            : item
        )
      );
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const retryDownload = (historyUrl: string) => {
    setUrl(historyUrl);
    setResult(null);
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="download" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="download">Download</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="download" className="space-y-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Download Video
              </CardTitle>
              <CardDescription className="text-center">
                Paste a video URL from any supported platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="url"
                  placeholder="https://www.tiktok.com/@user/video/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleDownload}
                  disabled={!url.trim() || isLoading}
                  className="sm:w-auto w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {progressMessage || "Processing..."}
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </>
                  )}
                </Button>
              </div>

              {isLoading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{progressMessage || "Processing video..."}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {result && (
                <Alert
                  className={
                    result.success
                      ? "border-green-200 bg-green-50 dark:bg-green-900/20"
                      : "border-red-200 bg-red-50 dark:bg-red-900/20"
                  }
                >
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription
                    className={
                      result.success
                        ? "text-green-800 dark:text-green-200"
                        : "text-red-800 dark:text-red-200"
                    }
                  >
                    {result.message}
                  </AlertDescription>
                </Alert>
              )}

              {result?.success && result.videoInfo && (
                <Card className="bg-gray-50 dark:bg-gray-700">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        {result.videoInfo.thumbnail && (
                          <img
                            src={
                              result.videoInfo.thumbnail || "/placeholder.svg"
                            }
                            alt="Video thumbnail"
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 space-y-2">
                          <h3 className="font-semibold text-lg">
                            {result.videoInfo.title}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">
                              {result.videoInfo.platform}
                            </Badge>
                            <Badge variant="outline">
                              {result.videoInfo.duration}
                            </Badge>
                            <Badge variant="outline">
                              {result.videoInfo.quality}
                            </Badge>
                            {result.videoInfo.fileSize && (
                              <Badge variant="outline">
                                {result.videoInfo.fileSize}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {result.downloadUrl && (
                        <div className="flex gap-2">
                          <Button asChild className="flex-1">
                            <a href={result.downloadUrl} download>
                              <Download className="mr-2 h-4 w-4" />
                              Download Video
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(result.downloadUrl!)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Supported Platforms</CardTitle>
              <CardDescription>
                We support video downloads from these platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportedPlatforms.map((platform) => (
                  <div
                    key={platform.name}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full ${platform.color}`}
                      />
                      <span className="font-medium">{platform.name}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {platform.domains.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Download History
                  </CardTitle>
                  <CardDescription>Your recent downloads</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={clearHistory}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No downloads yet. Start by downloading a video!
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{item.title}</h4>
                          <Badge
                            variant={
                              item.status === "completed"
                                ? "default"
                                : item.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{item.platform}</span>
                          <span>{item.timestamp.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === "failed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => retryDownload(item.url)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Retry
                          </Button>
                        )}
                        {item.downloadUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={item.downloadUrl} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Download Settings
              </CardTitle>
              <CardDescription>
                Customize your download preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="quality">Video Quality</Label>
                  <Select
                    value={settings.quality}
                    onValueChange={(value: any) =>
                      setSettings((prev) => ({ ...prev, quality: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="best">Best Available</SelectItem>
                      <SelectItem value="high">High (1080p)</SelectItem>
                      <SelectItem value="medium">Medium (720p)</SelectItem>
                      <SelectItem value="low">Low (480p)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Video Format</Label>
                  <Select
                    value={settings.format}
                    onValueChange={(value: any) =>
                      setSettings((prev) => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp4">MP4</SelectItem>
                      <SelectItem value="webm">WebM</SelectItem>
                      <SelectItem value="avi">AVI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="watermark">Remove Watermarks</Label>
                    <p className="text-sm text-gray-500">
                      Attempt to remove platform watermarks when possible
                    </p>
                  </div>
                  <Switch
                    id="watermark"
                    checked={settings.removeWatermark}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        removeWatermark: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="audio">Extract Audio Only</Label>
                    <p className="text-sm text-gray-500">
                      Download audio track only (MP3 format)
                    </p>
                  </div>
                  <Switch
                    id="audio"
                    checked={settings.extractAudio}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        extractAudio: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
