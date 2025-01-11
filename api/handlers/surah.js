const { data: quran } = require('../../data/quran.json');
const quranTajweed = require('../../data/quran-tajweed.json');
const quranLatin = require('../../data/equran-id.json');

function mapTajweedToVerses(surahData, surahTajweedData) {
  if (!surahData || !surahTajweedData || !surahTajweedData.data || !surahTajweedData.data.ayahs) {
    return surahData;
  }

  return {
    ...surahData,
    verses: surahData.verses.map((verse, index) => ({
      ...verse,
      text: {
        ...verse.text,
        arabTajweed: surahTajweedData.data.ayahs[index]?.text || verse.text.arab
      }
    }))
  };
}

function mapTajweedToVerse(verse, surahTajweedData) {
  if (!verse ||!surahTajweedData ||!surahTajweedData.data ||!surahTajweedData.data.ayahs) {
    return verse;
  }

  return {
   ...verse,
    text: {
     ...verse.text,
      arabTajweed: surahTajweedData.data.ayahs[verse.number.inSurah - 1]?.text || verse.text.arab
    }
  };
}

function mapLatinToVerses(surahData, surahLatinData) {
  if (!surahData || !surahLatinData ||!surahLatinData.data ||!surahLatinData.data.ayat) {
    return surahData;
  }

  return {
    ...surahData,
    verses: surahData.verses.map((verse, index) => ({
      ...verse,
      text: {
        transliteration: {
          ...verse.text.transliteration,
          id: surahLatinData.data.ayat[index].teksLatin
        }
      },
      audio: {
        ...verse.audio,
        options: surahLatinData.data.ayat[index].audio
      }
    }))
  };
}

function mapLatinToVerse(verse, surahLatinData) {
  if (!verse ||!surahLatinData ||!surahLatinData.data ||!surahLatinData.data.ayat) {
    return verse;
  }

  return {
   ...verse,
    text: {
     ...verse.text,
      transliteration: {
        ...verse.text.transliteration,
        id: surahLatinData.data.ayat[verse.number.inSurah - 1].teksLatin
      }
    },
    audio: {
      ...verse.audio,
      options: surahLatinData.data.ayat[verse.number.inSurah - 1].audio
    }
  };
}

class SurahHandler {
  static getAllSurah(req, res) {
    const data = quran.map(item => {
      const surah = { ...item };
      delete surah.verses;
      delete surah.preBismillah;
      return surah;
    });
    return res.status(200).send({
      code: 200,
      status: 'OK.',
      message: 'Success fetching all surah.',
      data
    });
  }

  static getSurah(req, res) {
    const { surah } = req.params;
    const data = quran[surah - 1];
    const dataTajweed = quranTajweed[surah - 1];
    const dataLatin = quranLatin[surah - 1];
    if (data) {
      let mappedData = mapTajweedToVerses(data, dataTajweed);
      mappedData = mapLatinToVerses(mappedData, dataLatin);
      return res.status(200).send({
        code: 200,
        status: 'OK.',
        message: 'Success fetching surah.',
        data: mappedData
      });
    }
    return res.status(404).send({
      code: 404,
      status: 'Not Found.',
      message: `Surah "${surah}" is not found.`,
      data: {}
    });
  }

  static getAyahFromSurah(req, res) {
    const { surah, ayah } = req.params;
    const checkSurah = quran[surah - 1];
    if (!checkSurah) {
      return res.status(404).send({
        code: 404,
        status: 'Not Found.',
        message: `Surah "${surah}" is not found.`,
        data: {}
      });
    }
    const checkAyah = checkSurah.verses[ayah - 1];
    if (!checkAyah) {
      return res.status(404).send({
        code: 404,
        status: 'Not Found.',
        message: `Ayah "${ayah}" in surah "${surah}" is not found.`,
        data: {}
      });
    }



    const dataSurah = { ...checkSurah };
    delete dataSurah.verses;
    let data = { ...checkAyah, surah: dataSurah };
    const dataTajweed = quranTajweed[surah - 1];
    const dataLatin = quranLatin[surah - 1];
    data = mapTajweedToVerse(data, dataTajweed);
    data = mapLatinToVerse(data, dataLatin);
    return res.status(200).send({
      code: 200,
      status: 'OK.',
      message: 'Success fetching ayah',
      data
    });
  }
}

module.exports = SurahHandler;
