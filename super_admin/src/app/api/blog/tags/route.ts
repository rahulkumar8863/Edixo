import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    const tags = await db.blogTag.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    // Transform to include postCount from _count
    const transformedTags = tags.map(tag => ({
      ...tag,
      postCount: tag._count.posts,
      _count: undefined
    }));

    return NextResponse.json({
      success: true,
      tags: transformedTags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

// POST - Create new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, slug, description } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, slug' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingTag = await db.blogTag.findUnique({
      where: { slug }
    });

    if (existingTag) {
      return NextResponse.json(
        { success: false, error: 'A tag with this slug already exists' },
        { status: 400 }
      );
    }

    const tag = await db.blogTag.create({
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
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}

// DELETE - Cleanup unused tags
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cleanup = searchParams.get('cleanup');

    if (cleanup === 'true') {
      // Delete tags with postCount = 0
      const unusedTags = await db.blogTag.findMany({
        where: {
          posts: { none: {} }
        }
      });

      if (unusedTags.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No unused tags found',
          deletedCount: 0
        });
      }

      await db.blogTag.deleteMany({
        where: {
          id: { in: unusedTags.map(t => t.id) }
        }
      });

      return NextResponse.json({
        success: true,
        message: `${unusedTags.length} unused tags deleted`,
        deletedCount: unusedTags.length
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid operation' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error cleaning up tags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup tags' },
      { status: 500 }
    );
  }
}
