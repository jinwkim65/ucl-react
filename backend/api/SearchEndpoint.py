from flask_restful import Resource, request
from api.dbconfig import get_db

class SearchEndpoint(Resource):
    def get(self, page):
        try:
            # 1) get the parameters from the request
            tournament = request.args.get('tournament') + '%' or '%'
            level = request.args.get('level') + '%' or '%'
            year = request.args.get('year') + '%' or '%'
            offset = (page - 1) * 10  # calculate the offset for pagination
            print(tournament, level, year, offset)  

            # 2) validate inputs (optional, but strongly recommended!)
            if not (tournament and level and year):
                return {'error': 'tournament, level and year are all required'}, 400

            # 3) run a parameterized query
            db = get_db()
            cur = db.execute(
                """
                SELECT *
                 FROM library
                 WHERE tournament LIKE ?
                   AND level LIKE ?
                   AND year LIKE ?
                ORDER BY year DESC, tournament ASC, level ASC
                LIMIT 10 OFFSET ?;
                """,
                (tournament, level, year, offset)  # use parameterized query to prevent SQL injection
            )
            rows = cur.fetchall()
            db.close()

            # 4) convert sqlite3.Rows into plain dicts
            results = [dict(r) for r in rows]
            return results

        except Exception as e:
            print(f"Error occurred: {e}")
            return {'error': 'An error occurred while processing the request'}, 500
        
        finally:
            # Ensure the database connection is closed
            if 'db' in locals():
                db.close()