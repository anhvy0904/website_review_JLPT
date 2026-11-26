import requests
from bs4 import BeautifulSoup
import json
import time
import re
import sys

BASE_URL = "https://jtest.net"
START_URL = "https://jtest.net/tu-vung-n3"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

print("=== BẮT ĐẦU CÀO DỮ LIỆU TANGO N3 TỪ JTEST.NET ===")

# 1. Lấy danh sách link các bài học từ trang chính
res = requests.get(START_URL, headers=headers)
soup = BeautifulSoup(res.text, "html.parser")

lesson_links = []
# Lọc chính xác các link bài học chi tiết dạng: /tu-vung-n3/chapter-X/section-Y
for a in soup.find_all("a", href=True):
    href = a["href"]
    m = re.search(r"/tu-vung-n3/chapter-(\d+)/section-(\d+)", href)
    if m:
        full_url = href if href.startswith("http") else BASE_URL + href
        if full_url not in [l["url"] for l in lesson_links]:
            title = a.get_text(strip=True)
            lesson_links.append({
                "title": title or f"Chapter {m.group(1)} - Section {m.group(2)}",
                "url": full_url,
                "chapterId": int(m.group(1)),
                "sectionId": int(m.group(2))
            })

print(f"-> Tìm thấy {len(lesson_links)} bài học (sections).")

# Hỗ trợ tham số --limit N (ví dụ: python scrape_tango.py --limit 2 để test thử nhanh)
if "--limit" in sys.argv:
    idx = sys.argv.index("--limit")
    if idx + 1 < len(sys.argv):
        limit = int(sys.argv[idx + 1])
        lesson_links = lesson_links[:limit]
        print(f"-> Chế độ cào thử: Giới hạn {limit} bài học đầu tiên.")

# 2. Lặp qua từng bài học để cào từ vựng
all_vocab = []

# Cấu trúc dành riêng để import thẳng vào website JLPT N3 (Chapter -> Unit -> Words)
chapters_dict = {}

for idx, lesson in enumerate(lesson_links, 1):
    print(f"[{idx}/{len(lesson_links)}] Đang cào: {lesson['title']} ({lesson['url']})...")
    try:
        page = requests.get(lesson["url"], headers=headers, timeout=15)
        page_soup = BeautifulSoup(page.text, "html.parser")
        
        table = page_soup.find("table")
        if not table:
            print(f"  [!] Không tìm thấy bảng từ vựng ở: {lesson['url']}")
            continue
            
        rows = table.find_all("tr")[1:]  # Bỏ qua dòng tiêu đề bảng
        
        c_id = lesson["chapterId"]
        u_id = lesson["sectionId"]
        if c_id not in chapters_dict:
            chapters_dict[c_id] = {
                "chapterId": c_id,
                "chapterTitle": f"Chapter {c_id}",
                "units": {}
            }
        if u_id not in chapters_dict[c_id]["units"]:
            chapters_dict[c_id]["units"][u_id] = {
                "unitId": u_id,
                "unitTitle": lesson["title"],
                "words": []
            }

        word_stt = 0
        for tr in rows:
            tds = tr.find_all("td")
            if len(tds) < 2:
                continue
                
            td_vocab, td_ex = tds[0], tds[1]
            
            # 1. Từ vựng (Kanji)
            word_el = td_vocab.find(id=re.compile(r"^word\d+"))
            word_text = word_el.get_text(strip=True) if word_el else ""
            
            # 2. Cách đọc (Hiragana) - Nếu từ vốn là Kana thì không có thẻ furigana riêng
            reading_el = td_vocab.find(id=re.compile(r"^furigana\d+"))
            reading_text = reading_el.get_text(strip=True) if reading_el else word_text
            
            kanji_val = word_text or reading_text
            hiragana_val = reading_text or word_text
            
            # 3. Nghĩa tiếng Việt
            meaning_el = td_vocab.find(id=re.compile(r"^meaning\d+"))
            meaning_text = meaning_el.get_text(strip=True) if meaning_el else "Chưa có nghĩa"
            
            # 4. Câu ví dụ tiếng Nhật và nghĩa
            ex_p = td_ex.find("p", class_="mb-1")
            ex_ja = ""
            ex_hira = ""
            if ex_p:
                # Bản tiếng Nhật (Kanji giữ nguyên, loại bỏ thẻ rt/rp)
                p_kanji = BeautifulSoup(str(ex_p), "html.parser")
                for rt in p_kanji.find_all(["rt", "rp"]):
                    rt.decompose()
                ex_ja = p_kanji.get_text(strip=True)
                
                # Bản Hiragana (thay ruby bằng rt)
                p_hira = BeautifulSoup(str(ex_p), "html.parser")
                for ruby in p_hira.find_all("ruby"):
                    rt_tag = ruby.find("rt")
                    rt_val = rt_tag.get_text(strip=True) if rt_tag else ruby.get_text(strip=True)
                    ruby.replace_with(rt_val)
                ex_hira = p_hira.get_text(strip=True)
                
            ex_mean_el = td_ex.find("span")
            ex_meaning = ex_mean_el.get_text(strip=True) if ex_mean_el else ""

            if not kanji_val:
                continue

            word_stt += 1
            
            # Định dạng danh sách phẳng
            all_vocab.append({
                "lesson": lesson["title"],
                "word": kanji_val,
                "reading": hiragana_val,
                "meaning": meaning_text,
                "example": ex_ja,
                "example_meaning": ex_meaning
            })
            
            # Định dạng chuẩn Tango N3 cho website VuyAnh
            word_id = f"c{c_id}_u{u_id}_{word_stt}"
            chapters_dict[c_id]["units"][u_id]["words"].append({
                "id": word_id,
                "stt": word_stt,
                "kanji": kanji_val,
                "hiragana": hiragana_val,
                "meaning": meaning_text,
                "wordAudio": "",
                "example": {
                    "japanese": ex_ja or kanji_val,
                    "hiragana": ex_hira or hiragana_val,
                    "meaning": ex_meaning or meaning_text,
                    "audio": ""
                }
            })

    except Exception as e:
        print(f"  [X] Lỗi khi cào bài {lesson['title']}: {e}")
        
    # Nghỉ 1 giây giữa các request để tránh bị server chặn
    time.sleep(1)

# 3. Xuất file 1: tango_n3.json (Định dạng phẳng như code ban đầu)
with open("tango_n3.json", "w", encoding="utf-8") as f:
    json.dump(all_vocab, f, ensure_ascii=False, indent=2)

# 4. Xuất file 2: tango_n3_app.json (Định dạng chuẩn import vào website JLPT N3)
app_chapters = []
for c_id in sorted(chapters_dict.keys()):
    c_data = chapters_dict[c_id]
    units_list = []
    for u_id in sorted(c_data["units"].keys()):
        units_list.append(c_data["units"][u_id])
    app_chapters.append({
        "chapterId": c_id,
        "chapterTitle": f"Chapter {c_id}",
        "units": units_list
    })

with open("tango_n3_app.json", "w", encoding="utf-8") as f:
    json.dump(app_chapters, f, ensure_ascii=False, indent=2)

print(f"\n🎉 Hoàn tất! Đã lưu {len(all_vocab)} từ vào:")
print(f"  1. 'tango_n3.json' (Danh sách phẳng)")
print(f"  2. 'tango_n3_app.json' (Cấu trúc Chapter -> Unit -> Words chuẩn website JLPT N3)")
