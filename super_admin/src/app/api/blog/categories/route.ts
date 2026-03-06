import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to build category tree
function buildCategoryTree(categories: any[], parentId: string | null = null): any[] {
  return categories
    .filter(cat => cat.parentId === parentId)
    .map(cat => ({
      ...cat,
      children: buildCategoryTree(categories, cat.id)
    }));
}

// GET - List all categories (tree format)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'tree';

    const categories = await db.blogCategory.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        parent: {
          select: { id: true, name: true, slug: true }
        },
        _count: {
          select: { posts: true }
        }
      }
    });

    // Transform to include postCount from _count
    const transformedCategories = categories.map(cat => ({
      ...cat,
      postCount: cat._count.posts,
      _count: undefined
    }));

    if (format === 'flat') {
      return NextResponse.json({
        success: true,
        categories: transformedCategories
      });
    }

    // Return as tree
    const tree = buildCategoryTree(transformedCategories);

    return NextResponse.json({
      success: true,
      categories: tree,
      flatCategories: transformedCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      slug,
      description,
      parentId,
      imageUrl,
      seoTitle,
      seoDesc,
      sortOrder = 0,
    } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, slug' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await db.blogCategory.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    // Validate parent exists if provided
    if (parentId) {
      const parent = await db.blogCategory.findUnique({
        where: { id: parentId }
      });
      if (!parent) {
        return NextResponse.json(
          { success: false, error: 'Parent category not found' },
          { status: 400 }
        );
      }
    }

    const category = await db.blogCategory.create({
      data: {
        name,
        slug,
        description,
        parentId,
        imageUrl,
        seoTitle,
        seoDesc,
        sortOrder,
      },
      include: {
        parent: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
