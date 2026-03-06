import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get single author
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const author = await db.blogAuthor.findUnique({
      where: { id },
      include: {
        posts: {
          where: { status: 'published' },
          take: 10,
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            publishedAt: true,
            viewCount: true,
          }
        }
      }
    });

    if (!author) {
      return NextResponse.json(
        { success: false, error: 'Author not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      author
    });
  } catch (error) {
    console.error('Error fetching author:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch author' },
      { status: 500 }
    );
  }
}

// PUT - Update author
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      slug,
      title,
      bio,
      photoUrl,
      email,
      linkedinUrl,
      twitterHandle,
      expertise,
      credentials,
      yearsExperience,
      role,
      isActive,
    } = body;

    // Check if author exists
    const existingAuthor = await db.blogAuthor.findUnique({
      where: { id }
    });

    if (!existingAuthor) {
      return NextResponse.json(
        { success: false, error: 'Author not found' },
        { status: 404 }
      );
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existingAuthor.slug) {
      const slugExists = await db.blogAuthor.findUnique({
        where: { slug }
      });
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'An author with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const author = await db.blogAuthor.update({
      where: { id },
      data: {
        name,
        slug,
        title,
        bio,
        photoUrl,
        email,
        linkedinUrl,
        twitterHandle,
        expertise: expertise ? JSON.stringify(expertise) : null,
        credentials: credentials ? JSON.stringify(credentials) : null,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
        role,
        isActive,
      }
    });

    return NextResponse.json({
      success: true,
      author
    });
  } catch (error) {
    console.error('Error updating author:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update author' },
      { status: 500 }
    );
  }
}

// DELETE - Delete author
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if author has posts
    const postCount = await db.blogPost.count({
      where: { authorId: id }
    });

    if (postCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete author with posts. Reassign posts first.' },
        { status: 400 }
      );
    }

    await db.blogAuthor.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Author deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting author:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete author' },
      { status: 500 }
    );
  }
}
