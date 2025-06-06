import requests
from bs4 import BeautifulSoup
import json
import time
import os
import re

# 六十甲子對應表
GANZHI = [
    "甲子", "乙丑", "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", "壬申", "癸酉",
    "甲戌", "乙亥", "丙子", "丁丑", "戊寅", "己卯", "庚辰", "辛巳", "壬午", "癸未",
    "甲申", "乙酉", "丙戌", "丁亥", "戊子", "己丑", "庚寅", "辛卯", "壬辰", "癸巳",
    "甲午", "乙未", "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑", "壬寅", "癸卯",
    "甲辰", "乙巳", "丙午", "丁未", "戊申", "己酉", "庚戌", "辛亥", "壬子", "癸丑",
    "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "己未", "庚申", "辛酉", "壬戌", "癸亥"
]

BASE_URL = "https://www.8327777.org.tw/divine{}.asp"
results = []

# 確保 modules/ 目錄存在
os.makedirs('modules', exist_ok=True)

for i in range(1, 61):
    url = BASE_URL.format(i)
    print(f"🔎 正在處理第 {i} 頁: {url}")

    try:
        response = requests.get(url)
        html_content = response.content.decode('utf-8', errors='replace')
        soup = BeautifulSoup(html_content, 'html.parser')

        # 直接用對應表取得 name（庚戌）
        name = GANZHI[i - 1]

        # 擷取詩內容（四句詩） → font-size:20px
        poem_span = soup.find('span', style=lambda v: v and 'font-size:20px' in v)
        if poem_span:
            content_poem = poem_span.get_text(separator='\n').strip()
            # 正規化換行 → 統一成 \n
            content_poem = re.sub(r'\r\n|\r', '\n', content_poem)
        else:
            content_poem = "（未擷取到詩文）"

        # 擷取解說段 → font-size:16px 且內容開頭是【解　說】
        explain_span = soup.find_all('span', style=lambda v: v and 'font-size:16px' in v)
        content_explain = "（未擷取到解說）"

        for span in explain_span:
            text = span.get_text(separator='\n').strip()
            if text.startswith('【解　說】'):
                content_explain = re.sub(r'\r\n|\r', '\n', text)
                break

        # 存結果
        results.append({
            "id": i,
            "name": name,
            "poem": content_poem,
            "explain": content_explain
        })

        # 爬蟲友善，sleep 一下
        time.sleep(0.5)

    except Exception as e:
        print(f"❌ 第 {i} 頁失敗: {e}")

# 最後寫入正式 thiuchhiam.json
print(f"共擷取到 {len(results)} 筆，準備寫入 thiuchhiam.json...")
with open('modules/thiuchhiam.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"✅ 完成！結果已存入 modules/thiuchhiam.json，共 {len(results)} 筆")
