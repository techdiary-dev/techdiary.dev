import { NextRequest, NextResponse } from "next/server";
import { deleteExpiredArticles } from "@/backend/services/article-cleanup-service";

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Cloudflare Cron (optional security measure)
    const cronSecret = request.headers.get("x-cron-secret");
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Execute the cleanup
    const result = await deleteExpiredArticles();
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} expired articles`,
      deletedArticles: result.deletedArticles,
    });
  } catch (error) {
    console.error("Error in cleanup-articles cron job:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

// Also support GET for manual testing
export async function GET() {
  try {
    const result = await deleteExpiredArticles();
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} expired articles`,
      deletedArticles: result.deletedArticles,
    });
  } catch (error) {
    console.error("Error in cleanup-articles manual execution:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}