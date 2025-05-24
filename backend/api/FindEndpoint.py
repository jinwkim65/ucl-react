from flask_restful import Resource, request
from api.dbconfig import get_db
import re

PAGE_SIZE = 10
PROXIMITY = 50  # max distance between quoted words

class FindEndpoint(Resource):
    def get(self, page):
        # 1) Parse & normalize the search string
        raw = (request.args.get('search') or '').strip()
        # extract quoted phrases and unquoted terms
        tokens = re.findall(r'"([^"]+)"|(\S+)', raw)
        quoted_phrases = [q for q,_ in tokens if q]
        unquoted_terms = [w for _,w in tokens if w]

        # 2) Pull all rows (we’ll filter in Python)
        db = get_db()
        cur = db.execute("SELECT tournament, level, year, text FROM library")
        all_rows = cur.fetchall()
        db.close()

        # 3) Filter in Python
        matches = []
        for r in all_rows:
            txt = r['text'] or ""
            txt_lower = txt.lower()

            # 3a) every unquoted term must appear
            if any(term.lower() not in txt_lower for term in unquoted_terms):
                continue

            # 3b) each quoted phrase’s words must lie within PROXIMITY chars
            ok = True
            for phrase in quoted_phrases:
                words = phrase.split()
                # find all positions of each word
                positions = []
                for w in words:
                    idx = txt_lower.find(w.lower())
                    if idx == -1:
                        ok = False
                        break
                    positions.append(idx)
                if not ok:
                    break
                if max(positions) - min(positions) > PROXIMITY:
                    ok = False
                    break
            if not ok:
                continue

            # passed both filters → build a snippet around the first unquoted term (or phrase)
            # you can reuse your existing snippet logic here...
            idx0 = 0
            if unquoted_terms:
                idx0 = txt_lower.find(unquoted_terms[0].lower())
            elif quoted_phrases:
                # find first word of first phrase
                idx0 = txt_lower.find(quoted_phrases[0].split()[0].lower())
            snippet_start = max(0, idx0 - 50)
            snippet = txt[snippet_start : snippet_start + 100]
            snippet = ' '.join(snippet.split())
            if snippet_start > 0:
                snippet = "… " + snippet
            if snippet_start + 100 < len(txt):
                snippet = snippet + " …"

            matches.append({
                'tournament': r['tournament'],
                'level':      r['level'],
                'year':       r['year'],
                'snippet':    snippet
            })

        # 4) Paginate filtered matches
        page = max(page, 1)
        start = (page - 1) * PAGE_SIZE
        paged = matches[start : start + PAGE_SIZE]

        return paged
