import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Allowed mime types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 250 * 1024 * 1024; // 250MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const uploadType = formData.get('type') as string | null; // 'thumbnail' | 'video'

    if (!file) {
      return NextResponse.json({ error: 'No file provided for upload' }, { status: 400 });
    }

    const mimeType = file.type.toLowerCase();
    const size = file.size;
    const originalName = file.name;
    const extension = path.extname(originalName).toLowerCase() || (uploadType === 'video' ? '.mp4' : '.jpg');

    // Validation
    if (uploadType === 'thumbnail') {
      if (!ALLOWED_IMAGE_TYPES.includes(mimeType) && !['.jpg', '.jpeg', '.png', '.webp'].includes(extension)) {
        return NextResponse.json(
          { error: `Invalid image type (${mimeType || extension}). Please upload a JPEG, PNG, or WebP image.` },
          { status: 400 }
        );
      }
      if (size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: `Image size exceeds the 10MB limit (uploaded: ${(size / (1024 * 1024)).toFixed(1)}MB).` },
          { status: 400 }
        );
      }
    } else if (uploadType === 'video') {
      if (!ALLOWED_VIDEO_TYPES.includes(mimeType) && !['.mp4', '.webm', '.mov', '.mkv'].includes(extension)) {
        return NextResponse.json(
          { error: `Invalid video format (${mimeType || extension}). Please upload MP4, WebM, or MOV.` },
          { status: 400 }
        );
      }
      if (size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          { error: `Video size exceeds the 250MB limit (uploaded: ${(size / (1024 * 1024)).toFixed(1)}MB).` },
          { status: 400 }
        );
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueFilename = `${uploadType || 'media'}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${extension}`;

    // Cloud storage check: Supabase Storage
    const hasSupabase = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    );

    if (hasSupabase) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const bucketName = 'course-media';
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(uniqueFilename, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(uniqueFilename);

          return NextResponse.json({
            url: publicUrlData.publicUrl,
            filename: uniqueFilename,
            size,
            storage: 'supabase',
          });
        }
        console.warn('Supabase storage upload failed, saving locally:', uploadError?.message);
      } catch (e) {
        console.warn('Supabase storage client failed, falling back to local storage:', e);
      }
    }

    // Local file storage in public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, uniqueFilename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({
      url: publicUrl,
      filename: uniqueFilename,
      size,
      storage: 'local',
    });
  } catch (error: any) {
    console.error('File upload route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process file upload. Please check connection and try again.' },
      { status: 500 }
    );
  }
}
