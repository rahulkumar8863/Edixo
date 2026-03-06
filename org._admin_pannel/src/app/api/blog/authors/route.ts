import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all authors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const role = searchParams.get('role');

    const where: any = {};

    if (isActive !== null && isActive !== 'all') {
      where.isActive = isActive === 'true';
    }
    if (role && role !== 'all') {
      where.role = role;
    }

    const authors = await db.blogAuthor.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        title: true,
        photoUrl: true,
        bio: true,
        email: true,
        linkedinUrl: true,
        twitterHandle: true,
        expertise: true,
        credentials: true,
        yearsExperience: true,
        role: true,
        isActive: true,
        postCount: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      authors
    });
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch authors' },
      { status: 500 }
    );
  }
}

// POST - Create new author
export async function POST(request: NextRequest) {
  try {
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
      role = 'author',
    } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, slug' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingAuthor = await db.blogAuthor.findUnique({
      where: { slug }
    });

    if (existingAuthor) {
      return NextResponse.json(
        { success: false, error: 'An author with this slug already exists' },
        { status: 400 }
      );
    }

    const author = await db.blogAuthor.create({
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
        yearsExperience,
        role,
      }
    });

    return NextResponse.json({
      success: true,
      author
    });
  } catch (error) {
    console.error('Error creating author:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create author' },
      { status: 500 }
    );
  }
}
