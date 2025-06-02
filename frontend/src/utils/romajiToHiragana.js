const romajiMap = {
  // Basic hiragana
  'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
  'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
  'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
  'sa': 'さ', 'shi': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
  'za': 'ざ', 'zi': 'じ', 'ji': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
  'ta': 'た', 'chi': 'ち', 'tsu': 'つ', 'te': 'て', 'to': 'と',
  'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
  'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
  'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'he': 'へ', 'ho': 'ほ',
  'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
  'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',
  'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
  'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
  'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
  'wa': 'わ', 'wo': 'を',
  'n': 'ん',

  // Combinations with small ya, yu, yo - BOTH spellings
  'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
  'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',
  'sha': 'しゃ', 'sya': 'しゃ',  // Both spellings
  'shu': 'しゅ', 'syu': 'しゅ',  // Both spellings  
  'sho': 'しょ', 'syo': 'しょ',  // Both spellings
  'ja': 'じゃ', 'jya': 'じゃ',   // Both spellings
  'ju': 'じゅ', 'jyu': 'じゅ',   // Both spellings
  'jo': 'じょ', 'jyo': 'じょ',   // Both spellings
  'cha': 'ちゃ', 'tya': 'ちゃ',  // Both spellings
  'chu': 'ちゅ', 'tyu': 'ちゅ',  // Both spellings
  'cho': 'ちょ', 'tyo': 'ちょ',  // Both spellings
  'dya': 'ぢゃ', 'dyu': 'ぢゅ', 'dyo': 'ぢょ',
  'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
  'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
  'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
  'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',
  'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
  'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
};

export const romajiToHiragana = (input) => {
  if (!input) return '';

  let result = '';
  let i = 0;
  const text = input.toLowerCase();

  while (i < text.length) {
    let found = false;

    // Check for double consonants first
    if (i < text.length - 1) {
      const currentChar = text[i];
      const nextChar = text[i + 1];
      
      if (currentChar === nextChar && 'stkpbdgzjfvhlmnrwy'.includes(currentChar) && currentChar !== 'n') {
        result += 'っ';
        i++;
        continue;
      }
    }

    // Try matches from longest to shortest
    for (let len = 3; len >= 1; len--) {
      if (i + len <= text.length) {
        const substr = text.slice(i, i + len);
        if (romajiMap[substr]) {
          result += romajiMap[substr];
          i += len;
          found = true;
          break;
        }
      }
    }

    if (!found) {
      result += text[i];
      i++;
    }
  }

  return result;
};