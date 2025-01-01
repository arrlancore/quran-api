const { data: quran } = require('../../data/quran.json');
const quranTajweed = require('../../data/quran-tajweed.json');

function mapTajweedToVerses(surahData, surahTajweedData) {
  console.log('mapping tajweed to verses..');
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
    if (data) {
      const mappedData = mapTajweedToVerses(data, dataTajweed);
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
    const data = { ...checkAyah, surah: dataSurah };
    return res.status(200).send({
      code: 200,
      status: 'OK.',
      message: 'Success fetching ayah',
      data
    });
  }
}

module.exports = SurahHandler;
