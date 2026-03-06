import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all posts with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const contentType = searchParams.get('contentType');
    const authorId = searchParams.get('authorId');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }
    if (contentType && contentType !== 'all') {
      where.contentType = contentType;
    }
    if (authorId && authorId !== 'all') {
      where.authorId = authorId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
        { contentText: { contains: search } },
      ];
    }
    if (categoryId && categoryId !== 'all') {
      where.categories = {
        some: { categoryId }
      };
    }

    const [posts, total] = await Promise.all([
      db.blogPost.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, slug: true, photoUrl: true }
          },
          categories: {
            include: {
              category: {
                select: { id: true, name: true, slug: true }
              }
            }
          },
          tags: {
            include: {
              tag: {
                select: { id: true, name: true, slug: true }
              }
            }
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.blogPost.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST - Create new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      slug,
      content,
      contentHtml,
      contentText,
      excerpt,
      featuredImageUrl,
      featuredImageAlt,
      contentType = 'blog',
      status = 'draft',
      visibility = 'public',
      password,
      authorId,
      categoryIds = [],
      tagIds = [],
      seoTitle,
      seoDescription,
      focusKeyword,
      secondaryKeywords,
      canonicalUrl,
      robotsIndex = true,
      robotsFollow = true,
      schemaType = 'BlogPosting',
      ogTitle,
      ogDescription,
      ogImageUrl,
      twitterCard = 'summary_large_image',
      allowComments = true,
      isFeatured = false,
      publishedAt,
      scheduledAt,
    } = body;

    // Validate required fields
    if (!title || !slug || !authorId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, slug, authorId' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPost = await db.blogPost.findUnique({
      where: { slug }
    });

    if (existingPost) {
      return NextResponse.json(
        { success: false, error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }

    // Calculate word count and reading time
    const wordCount = contentText ? contentText.split(/\s+/).length : 0;
    const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

    // Create post
    const post = await db.blogPost.create({
      data: {
        title,
        slug,
        content,
        contentHtml,
        contentText,
        excerpt,
        featuredImageUrl,
        featuredImageAlt,
        contentType,
        status,
        visibility,
        password,
        authorId,
        seoTitle,
        seoDescription,
        focusKeyword,
        secondaryKeywords: secondaryKeywords ? JSON.stringify(secondaryKeywords) : null,
        canonicalUrl,
        robotsIndex,
        robotsFollow,
        schemaType,
        ogTitle,
        ogDescription,
        ogImageUrl,
        twitterCard,
        allowComments,
        isFeatured,
        wordCount,
        readingTimeMin,
        publishedAt: publishedAt ? new Date(publishedAt) : (status === 'published' ? new Date() : null),
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        categories: {
          create: categoryIds.map((categoryId: string) => ({
            categoryId
          }))
        },
        tags: {
          create: tagIds.map((tagId: string) => ({
            tagId
          }))
        },
      },
      include: {
        author: {
          select: { id: true, name: true, slug: true, photoUrl: true }
        },
        categories: {
          include: {
            category: { select: { id: true, name: true, slug: true } }
          }
        },
        tags: {
          include: {
            tag: { select: { id: true, name: true, slug: true } }
          }
        },
      }
    });

    // Create initial revision
    await db.blogRevision.create({
      data: {
        postId: post.id,
        content,
        title,
        revisedBy: authorId,
      }
    });

    // Update author post count
    await db.blogAuthor.update({
      where: { id: authorId },
      data: { postCount: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
