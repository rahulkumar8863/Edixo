import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get single post by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await db.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, slug: true, photoUrl: true, title: true, bio: true }
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
        revisions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      contentType,
      status,
      visibility,
      password,
      authorId,
      categoryIds,
      tagIds,
      seoTitle,
      seoDescription,
      focusKeyword,
      secondaryKeywords,
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
      publishedAt,
      scheduledAt,
    } = body;

    // Check if post exists
    const existingPost = await db.blogPost.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existingPost.slug) {
      const slugExists = await db.blogPost.findUnique({
        where: { slug }
      });
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'A post with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Calculate word count and reading time
    const wordCount = contentText ? contentText.split(/\s+/).length : existingPost.wordCount;
    const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (content !== undefined) updateData.content = content;
    if (contentHtml !== undefined) updateData.contentHtml = contentHtml;
    if (contentText !== undefined) updateData.contentText = contentText;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (featuredImageUrl !== undefined) updateData.featuredImageUrl = featuredImageUrl;
    if (featuredImageAlt !== undefined) updateData.featuredImageAlt = featuredImageAlt;
    if (contentType !== undefined) updateData.contentType = contentType;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'published' && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (visibility !== undefined) updateData.visibility = visibility;
    if (password !== undefined) updateData.password = password;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (focusKeyword !== undefined) updateData.focusKeyword = focusKeyword;
    if (secondaryKeywords !== undefined) updateData.secondaryKeywords = JSON.stringify(secondaryKeywords);
    if (canonicalUrl !== undefined) updateData.canonicalUrl = canonicalUrl;
    if (robotsIndex !== undefined) updateData.robotsIndex = robotsIndex;
    if (robotsFollow !== undefined) updateData.robotsFollow = robotsFollow;
    if (schemaType !== undefined) updateData.schemaType = schemaType;
    if (ogTitle !== undefined) updateData.ogTitle = ogTitle;
    if (ogDescription !== undefined) updateData.ogDescription = ogDescription;
    if (ogImageUrl !== undefined) updateData.ogImageUrl = ogImageUrl;
    if (twitterCard !== undefined) updateData.twitterCard = twitterCard;
    if (allowComments !== undefined) updateData.allowComments = allowComments;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (wordCount) updateData.wordCount = wordCount;
    if (readingTimeMin) updateData.readingTimeMin = readingTimeMin;
    if (publishedAt !== undefined) updateData.publishedAt = publishedAt ? new Date(publishedAt) : null;
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;

    // Update post
    const post = await db.blogPost.update({
      where: { id },
      data: updateData,
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

    // Create revision if content changed
    if (content !== undefined) {
      await db.blogRevision.create({
        data: {
          postId: id,
          content,
          title: title || existingPost.title,
          revisedBy: authorId,
        }
      });
    }

    // Update categories if provided
    if (categoryIds) {
      await db.blogPostCategory.deleteMany({
        where: { postId: id }
      });
      await db.blogPostCategory.createMany({
        data: categoryIds.map((categoryId: string) => ({
          postId: id,
          categoryId
        }))
      });
    }

    // Update tags if provided
    if (tagIds) {
      await db.blogPostTag.deleteMany({
        where: { postId: id }
      });
      await db.blogPostTag.createMany({
        data: tagIds.map((tagId: string) => ({
          postId: id,
          tagId
        }))
      });
    }

    return NextResponse.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if post exists
    const post = await db.blogPost.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Delete post (cascade will handle related records)
    await db.blogPost.delete({
      where: { id }
    });

    // Update author post count
    if (post.author) {
      await db.blogAuthor.update({
        where: { id: post.authorId },
        data: { postCount: { decrement: 1 } }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
