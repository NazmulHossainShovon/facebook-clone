// Voice mapping for AWS Polly voices by language and gender
export const VOICE_MAPPING: Record<
  string,
  { male: string[]; female: string[] }
> = {
  en: {
    // English
    male: [
      "Brian",
      "Matthew",
      "Joey",
      "Justin",
      "Kevin",
      "Russell",
      "Stephen",
      "Geraint",
    ],
    female: [
      "Joanna",
      "Kendra",
      "Kimberly",
      "Salli",
      "Amy",
      "Emma",
      "Olivia",
      "Aria",
      "Ivy",
    ],
  },
  es: {
    // Spanish
    male: ["Miguel", "Enrique", "Andres"],
    female: ["Penelope", "Lucia", "Lupe", "Conchita"],
  },
  fr: {
    // French
    male: ["Mathieu", "Remi"],
    female: ["Celine", "Chantal", "Lea"],
  },
  de: {
    // German
    male: ["Hans", "Daniel"],
    female: ["Marlene", "Vicki"],
  },
  it: {
    // Italian
    male: ["Giorgio", "Adriano"],
    female: ["Carla", "Bianca"],
  },
  pt: {
    // Portuguese
    male: ["Cristiano", "Ricardo", "Thiago"],
    female: ["Vitoria", "Camila", "Ines"],
  },
  ja: {
    // Japanese
    male: ["Takumi"],
    female: ["Mizuki", "Tomoko", "Kazuha"],
  },
  ko: {
    // Korean
    male: [],
    female: ["Seoyeon", "Jihye"],
  },
  zh: {
    // Chinese
    male: [],
    female: ["Zhiyu"],
  },
  ar: {
    // Arabic
    male: ["Zayd"],
    female: ["Zeina", "Hala"],
  },
  hi: {
    // Hindi
    male: [],
    female: ["Aditi", "Kajal"],
  },
  tr: {
    // Turkish
    male: [],
    female: ["Filiz", "Burcu"],
  },
  ru: {
    // Russian
    male: ["Maxim"],
    female: ["Tatyana"],
  },
  pl: {
    // Polish
    male: ["Jacek", "Jan"],
    female: ["Ewa", "Maja"],
  },
  nl: {
    // Dutch
    male: ["Ruben"],
    female: ["Lotte"],
  },
  sv: {
    // Swedish
    male: [],
    female: ["Astrid"],
  },
  no: {
    // Norwegian
    male: ["Mads"],
    female: ["Liv"],
  },
  da: {
    // Danish
    male: [],
    female: ["Naja", "Sofie"],
  },
  fi: {
    // Finnish
    male: [],
    female: ["Suvi"],
  },
  is: {
    // Icelandic
    male: ["Karl"],
    female: ["Dora"],
  },
  cy: {
    // Welsh
    male: ["Geraint"],
    female: ["Gwyneth"],
  },
  cs: {
    // Czech
    male: [],
    female: ["Jitka"],
  },
  ro: {
    // Romanian
    male: [],
    female: ["Carmen"],
  },
};

/**
 * Get the best voice ID for a given language and gender
 * @param languageCode - ISO language code (e.g., 'en', 'es')
 * @param gender - 'male' or 'female'
 * @returns AWS Polly Voice ID
 */
export const getVoiceId = (
  languageCode: string,
  gender: "male" | "female"
): string => {
  const voiceOptions = VOICE_MAPPING[languageCode];

  if (!voiceOptions) {
    // Fallback to English if language not supported
    return gender === "male" ? "Matthew" : "Joanna";
  }

  const voices = voiceOptions[gender];

  if (!voices || voices.length === 0) {
    // If no voices for the requested gender, try the opposite gender
    const fallbackVoices = voiceOptions[gender === "male" ? "female" : "male"];
    if (fallbackVoices && fallbackVoices.length > 0) {
      return fallbackVoices[0];
    }
    // Ultimate fallback to English
    return gender === "male" ? "Matthew" : "Joanna";
  }

  // Return the first (usually best) voice for the language and gender
  return voices[0];
};
