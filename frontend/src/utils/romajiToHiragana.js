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
  'wa': 'わ', 'wi': 'ゐ', 'we': 'ゑ', 'wo': 'を',
  'n': 'ん',
  
  // Combinations with small ya, yu, yo
  'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
  'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',
  'sha': 'しゃ', 'shu': 'しゅ', 'sho': 'しょ',
  'ja': 'じゃ', 'ju': 'じゅ', 'jo': 'じょ',
  'cha': 'ちゃ', 'chu': 'ちゅ', 'cho': 'ちょ',
  'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
  'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
  'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
  'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',
  'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
  'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
  
  // Double consonants
  'kka': 'っか', 'kki': 'っき', 'kku': 'っく', 'kke': 'っけ', 'kko': 'っこ',
  'ssa': 'っさ', 'sshi': 'っし', 'ssu': 'っす', 'sse': 'っせ', 'sso': 'っそ',
  'tta': 'った', 'tchi': 'っち', 'ttsu': 'っつ', 'tte': 'って', 'tto': 'っと',
  'ppa': 'っぱ', 'ppi': 'っぴ', 'ppu': 'っぷ', 'ppe': 'っぺ', 'ppo': 'っぽ',
};

export const romajiToHiragana = (input) => {
  if (!input) return '';
  
  let result = '';
  let i = 0;
  const text = input.toLowerCase();
  
  while (i < text.length) {
    let found = false;
    
    // Try longest matches first (3 chars, then 2, then 1)
    for (let len = Math.min(4, text.length - i); len > 0; len--) {
      const substr = text.slice(i, i + len);
      if (romajiMap[substr]) {
        result += romajiMap[substr];
        i += len;
        found = true;
        break;
      }
    }
    
    // If no match found, keep the original character
    if (!found) {
      result += text[i];
      i++;
    }
  }
  
  return result;
};