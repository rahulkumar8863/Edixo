import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get single tag
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tag = await db.blogTag.findUnique({
      where: { id },
      include: {
        posts: {
          where: { post: { status: 'published' } },
          take: 10,
          select: {
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
                publishedAt: true,
              }
            }
          }
        }
      }
    });

    if (!tag) {
      return NextResponse.json(
        { success: false, error: 'Tag not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tag
    });
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tag' },
      { status: 500 }
    );
  }
}

// PUT - Update tag
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, slug, description } = body;

    // Check if tag exists
    const existingTag = await db.blogTag.findUnique({
      where: { id }
    });

    if (!existingTag) {
      return NextResponse.json(
        { success: false, error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existingTag.slug) {
      const slugExists = await db.blogTag.findUnique({
        where: { slug }
      });
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'A tag with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const tag = await db.blogTag.update({
      where: { id },
      data: {
        name,
        slug,
        description,
      }
    });

    return NextResponse.json({
      success: true,
      tag
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

// DELETE - Delete tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete tag (cascade will handle post relationships)
    await db.blogPostTag.deleteMany({
      where: { tagId: id }
    });

    await db.blogTag.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
