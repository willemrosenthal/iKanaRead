export type PhoneticResult = string[];

export interface IConverter {
  convert(word: string, phonetic: string): string;
}

export interface IHandler {
  handle(phonetic: string): string;
}

export interface ICreator {
  create(ph: string): string;
}

export type TranscriptionResult = {
  original: string;
  katakana: string[] | ["E_DIC"] | ["E_KEY"];
};
