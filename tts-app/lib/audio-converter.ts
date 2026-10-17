import { Mp3Encoder } from '@breezystack/lamejs';

/**
 * Converts a LINEAR16 PCM WAV buffer to an MP3 buffer.
 */
export function convertWavToMp3(wavBuffer: Buffer): Buffer {
  // Parse basic RIFF WAV format
  const riff = wavBuffer.subarray(0, 4).toString('ascii');
  if (riff !== 'RIFF') {
    throw new Error('Invalid WAV: missing RIFF header');
  }

  const channels = wavBuffer.readInt16LE(22);
  const sampleRate = wavBuffer.readInt32LE(24);
  const bitsPerSample = wavBuffer.readInt16LE(34);

  if (bitsPerSample !== 16) {
    throw new Error(`Unsupported bit depth: ${bitsPerSample}-bit. Expected 16-bit PCM.`);
  }

  // Locate the 'data' chunk
  let dataOffset = 12;
  while (dataOffset < wavBuffer.length) {
    const chunkId = wavBuffer.toString('ascii', dataOffset, dataOffset + 4);
    const chunkSize = wavBuffer.readInt32LE(dataOffset + 4);
    if (chunkId === 'data') {
      dataOffset += 8;
      break;
    }
    dataOffset += 8 + chunkSize;
  }

  const pcmData = wavBuffer.subarray(dataOffset);
  const totalSamples = pcmData.byteLength / 2;
  const samples = new Int16Array(pcmData.buffer, pcmData.byteOffset, totalSamples);

  const encoder = new Mp3Encoder(channels, sampleRate, 128);
  const mp3Chunks: Buffer[] = [];
  const sampleBlockSize = 1152;

  if (channels === 1) {
    // Mono audio
    for (let i = 0; i < samples.length; i += sampleBlockSize) {
      const sampleChunk = samples.subarray(i, i + sampleBlockSize);
      const mp3buf = encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
        mp3Chunks.push(Buffer.from(mp3buf));
      }
    }
  } else if (channels === 2) {
    // Interleaved stereo audio
    const numFrames = samples.length / 2;
    const left = new Int16Array(numFrames);
    const right = new Int16Array(numFrames);
    for (let i = 0, j = 0; i < samples.length; i += 2, j++) {
      left[j] = samples[i];
      right[j] = samples[i + 1];
    }
    for (let i = 0; i < numFrames; i += sampleBlockSize) {
      const leftChunk = left.subarray(i, i + sampleBlockSize);
      const rightChunk = right.subarray(i, i + sampleBlockSize);
      const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        mp3Chunks.push(Buffer.from(mp3buf));
      }
    }
  } else {
    throw new Error(`Unsupported number of audio channels: ${channels}`);
  }

  const endBuf = encoder.flush();
  if (endBuf.length > 0) {
    mp3Chunks.push(Buffer.from(endBuf));
  }

  return Buffer.concat(mp3Chunks);
}
