export interface Word {
  j_pron_spell: string;
  j_pron_only: string;
  type: string;
  word: string;
}

export interface VocabularyData {
  words: Word[];
  is_romaji: number;
  has_spelling: number;
}

const requestTranslate = async (text: string[]): Promise<VocabularyData> => {
  //https://www.sljfaq.org/cgi/e2k.cgi?o=json&word=tarts,apples,pies&lang=en
  const response = await fetch(
    `https://www.sljfaq.org/cgi/e2k.cgi?o=json&word=${text
      .filter(Boolean)
      .join(",")}&lang=en`,
    {
      method: "GET",
    }
  );
  const data = await response.json();
  return data;
};

export default requestTranslate;
