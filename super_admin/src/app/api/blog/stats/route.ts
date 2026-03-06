import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Blog dashboard stats
export async function GET(request: NextRequest) {
  try {
    // Get counts
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      scheduledPosts,
      totalAuthors,
      totalCategories,
      totalTags,
      totalComments,
      pendingComments,
      totalViews,
      totalMedia,
    ] = await Promise.all([
      db.blogPost.count(),
      db.blogPost.count({ where: { status: 'published' } }),
      db.blogPost.count({ where: { status: 'draft' } }),
      db.blogPost.count({ where: { status: 'scheduled' } }),
      db.blogAuthor.count({ where: { isActive: true } }),
      db.blogCategory.count(),
      db.blogTag.count(),
      db.blogComment.count(),
      db.blogComment.count({ where: { status: 'pending' } }),
      db.blogPost.aggregate({
        _sum: { viewCount: true }
      }),
      db.media.count(),
    ]);

    // Get recent posts
    const recentPosts = await db.blogPost.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, photoUrl: true }
        }
      }
    });

    // Get top posts by views
    const topPosts = await db.blogPost.findMany({
      where: { status: 'published' },
      take: 5,
      orderBy: { viewCount: 'desc' },
      include: {
        author: {
          select: { id: true, name: true }
        }
      }
    });

    // Get posts by content type
    const postsByType = await db.blogPost.groupBy({
      by: ['contentType'],
      _count: true,
    });

    // Get posts by status
    const postsByStatus = await db.blogPost.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get recent comments
    const recentComments = await db.blogComment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          select: { id: true, title: true, slug: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        scheduledPosts,
        totalAuthors,
        totalCategories,
        totalTags,
        totalComments,
        pendingComments,
        totalViews: totalViews._sum.viewCount || 0,
        totalMedia,
      },
      recentPosts,
      topPosts,
      postsByType,
      postsByStatus,
      recentComments,
    });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog stats' },
      { status: 500 }
    );
  }
}
