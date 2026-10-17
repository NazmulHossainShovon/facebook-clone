import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAccessToken } from '@/lib/auth';
import { convertWavToMp3 } from '@/lib/audio-converter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Default request body matching the user's specification
    const text = body.input?.text ?? "Movies, oh my gosh, I just just absolutely love them. They're like time machines taking you to different worlds and landscapes, and um, and I just can't get enough of it.";
    const prompt = body.input?.prompt ?? "Read aloud in a warm, welcoming tone.";
    const audioEncoding = body.audioConfig?.audioEncoding ?? "LINEAR16";
    const pitch = body.audioConfig?.pitch ?? 0;
    const speakingRate = body.audioConfig?.speakingRate ?? 1;
    const languageCode = body.voice?.languageCode ?? "bn-bd";
    const modelName = body.voice?.modelName ?? "gemini-3.1-flash-tts-preview";
    const voiceName = body.voice?.name ?? "Zubenelgenubi";

    const googlePayload = {
      audioConfig: {
        audioEncoding,
        pitch,
        speakingRate,
      },
      input: {
        prompt,
        text,
      },
      voice: {
        languageCode,
        modelName,
        name: voiceName,
      },
    };

    const token = await getGoogleAccessToken();
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    };
    if (projectId) {
      headers['x-goog-user-project'] = projectId;
    }

    const googleResponse = await fetch('https://texttospeech.googleapis.com/v1beta1/text:synthesize', {
      method: 'POST',
      headers,
      body: JSON.stringify(googlePayload),
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      return NextResponse.json(
        {
          error: data.error || {
            code: googleResponse.status,
            message: 'Failed to synthesize speech with Google Cloud TTS',
          },
          requestPayload: googlePayload,
        },
        { status: googleResponse.status }
      );
    }

    if (!data.audioContent) {
      return NextResponse.json(
        { error: { message: 'Google TTS returned no audio content', data } },
        { status: 500 }
      );
    }

    const rawBuffer = Buffer.from(data.audioContent, 'base64');
    let mp3Base64: string;

    if (audioEncoding === 'LINEAR16') {
      try {
        const mp3Buffer = convertWavToMp3(rawBuffer);
        mp3Base64 = mp3Buffer.toString('base64');
      } catch (conversionErr) {
        console.error('WAV to MP3 conversion error:', conversionErr);
        // Fallback: If conversion failed, provide original audio content
        mp3Base64 = data.audioContent;
      }
    } else {
      // If already MP3
      mp3Base64 = data.audioContent;
    }

    return NextResponse.json({
      success: true,
      audioContent: data.audioContent,
      mp3Content: mp3Base64,
      audioEncoding,
      requestPayload: googlePayload,
      stats: {
        rawSize: rawBuffer.length,
        mp3Size: Buffer.from(mp3Base64, 'base64').length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    console.error('Error in /api/synthesize:', error);
    return NextResponse.json(
      { error: { message } },
      { status: 500 }
    );
  }
}
