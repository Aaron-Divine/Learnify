import { NextRequest, NextResponse } from 'next/server';
import { getCourses, createCourse } from '@/lib/db';
import { CURRENCY_MAP } from '@/lib/currencies';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const currency = searchParams.get('currency') || undefined;

    const courses = await getCourses(search, currency);
    return NextResponse.json({ courses });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, summary, thumbnail_url, video_url, currency_code, price, wallet_address } = body;

    // Strict validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Course title is required' }, { status: 400 });
    }
    if (!summary || typeof summary !== 'string' || !summary.trim()) {
      return NextResponse.json({ error: 'Course summary/description is required' }, { status: 400 });
    }
    if (!thumbnail_url || typeof thumbnail_url !== 'string' || !thumbnail_url.trim()) {
      return NextResponse.json({ error: 'Thumbnail showcase image is required' }, { status: 400 });
    }
    if (!video_url || typeof video_url !== 'string' || !video_url.trim()) {
      return NextResponse.json({ error: 'Course video upload is required' }, { status: 400 });
    }
    if (!currency_code || typeof currency_code !== 'string') {
      return NextResponse.json({ error: 'Currency is required' }, { status: 400 });
    }
    if (!CURRENCY_MAP[currency_code.toUpperCase()]) {
      return NextResponse.json({ error: `Unsupported currency code: ${currency_code}` }, { status: 400 });
    }
    if (!wallet_address || typeof wallet_address !== 'string' || !wallet_address.trim()) {
      return NextResponse.json(
        { error: 'Interledger wallet address is required in the format: $ilp.interledger-test.dev/(name)' },
        { status: 400 }
      );
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json({ error: 'Price must be a valid positive number' }, { status: 400 });
    }

    const newCourse = await createCourse({
      title: title.trim(),
      summary: summary.trim(),
      thumbnail_url: thumbnail_url.trim(),
      video_url: video_url.trim(),
      currency_code: currency_code.toUpperCase(),
      price: numPrice,
      wallet_address: wallet_address.trim(),
    });

    return NextResponse.json({ course: newCourse }, { status: 201 });
  } catch (err: any) {
    console.error('Course creation error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create course' }, { status: 500 });
  }
}
