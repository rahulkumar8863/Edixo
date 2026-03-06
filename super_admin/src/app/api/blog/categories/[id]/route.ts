import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await db.blogCategory.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
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

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT - Update category
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
      description,
      parentId,
      imageUrl,
      seoTitle,
      seoDesc,
      sortOrder,
    } = body;

    // Check if category exists
    const existingCategory = await db.blogCategory.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await db.blogCategory.findUnique({
        where: { slug }
      });
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'A category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Prevent setting parent to self
    if (parentId === id) {
      return NextResponse.json(
        { success: false, error: 'Category cannot be its own parent' },
        { status: 400 }
      );
    }

    const category = await db.blogCategory.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        parentId: parentId || null,
        imageUrl,
        seoTitle,
        seoDesc,
        sortOrder,
      },
      include: {
        parent: true,
      }
    });

    return NextResponse.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category has posts
    const postCount = await db.blogPostCategory.count({
      where: { categoryId: id }
    });

    if (postCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with posts. Reassign posts first.' },
        { status: 400 }
      );
    }

    // Check if category has children
    const childrenCount = await db.blogCategory.count({
      where: { parentId: id }
    });

    if (childrenCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with child categories.' },
        { status: 400 }
      );
    }

    await db.blogCategory.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
