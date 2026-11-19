import { NextRequest, NextResponse } from 'next/server';
import { getCourseById, updateCourse, deleteCourse } from '@/lib/db';
import { CURRENCY_MAP } from '@/lib/currencies';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await getCourseById(params.id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    return NextResponse.json({ course });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch course' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { title, summary, thumbnail_url, video_url, currency_code, price, wallet_address } = body;

    const updates: any = {};
    if (title !== undefined) {
      if (!title.trim()) return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
      updates.title = title.trim();
    }
    if (summary !== undefined) {
      if (!summary.trim()) return NextResponse.json({ error: 'Summary cannot be empty' }, { status: 400 });
      updates.summary = summary.trim();
    }
    if (thumbnail_url !== undefined) {
      if (!thumbnail_url.trim()) return NextResponse.json({ error: 'Thumbnail cannot be empty' }, { status: 400 });
      updates.thumbnail_url = thumbnail_url.trim();
    }
    if (video_url !== undefined) {
      if (!video_url.trim()) return NextResponse.json({ error: 'Video URL cannot be empty' }, { status: 400 });
      updates.video_url = video_url.trim();
    }
    if (currency_code !== undefined) {
      if (!CURRENCY_MAP[currency_code.toUpperCase()]) {
        return NextResponse.json({ error: 'Invalid currency code' }, { status: 400 });
      }
      updates.currency_code = currency_code.toUpperCase();
    }
    if (wallet_address !== undefined) {
      if (!wallet_address.trim()) {
        return NextResponse.json({ error: 'Wallet address cannot be empty' }, { status: 400 });
      }
      updates.wallet_address = wallet_address.trim();
    }
    if (price !== undefined) {
      const num = Number(price);
      if (isNaN(num) || num <= 0) {
        return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
      }
      updates.price = num;
    }

    const updated = await updateCourse(params.id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Course not found to update' }, { status: 404 });
    }

    return NextResponse.json({ course: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteCourse(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Course not found or could not be deleted' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Course deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete course' }, { status: 500 });
  }
}
