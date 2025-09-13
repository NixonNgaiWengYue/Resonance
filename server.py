from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/categorized")
def categorized_comments():
    category = request.args.get("category")  # optional category filter
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 100))
    offset = (page - 1) * limit

    conn = sqlite3.connect("public/categories.db")
    cursor = conn.cursor()

    if category:
        cursor.execute("""
            SELECT textOriginal, predicted_category, confidence, publishedAt
            FROM categories
            WHERE predicted_category = ?
            LIMIT ? OFFSET ?
        """, (category, limit, offset))
    else:
        cursor.execute("""
            SELECT textOriginal, predicted_category, confidence, publishedAt
            FROM categories
            WHERE predicted_category IS NOT NULL
            LIMIT ? OFFSET ?
        """, (limit, offset))

    rows = cursor.fetchall()
    conn.close()

    data = {}
    for text, category, confidence, published in rows:
        entry = {
            "textOriginal": text,
            "predictedCategory": category,
            "confidence": confidence,
            "publishedAt": published,
        }
        data.setdefault(category, []).append(entry)

    return jsonify(data)

@app.route("/categories_list")
def categories_list():
    conn = sqlite3.connect("public/categories.db")
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT predicted_category FROM categories WHERE predicted_category IS NOT NULL")
    rows = [r[0] for r in cursor.fetchall()]
    conn.close()
    return jsonify(rows)


@app.route("/comments")
def get_comments():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 100))
    offset = (page - 1) * limit

    conn = sqlite3.connect("public/sentiment_data.db")
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT textOriginal, publishedAt, sentiment_score, sentiment, QualityCategory
        FROM comments
        LIMIT ? OFFSET ?
        """,
        (limit, offset),
    )
    rows = cursor.fetchall()
    conn.close()

    data = [
        {
            "textOriginal": r[0],
            "publishedAt": r[1],
            "sentiment_score": r[2],
            "sentiment": r[3],
            "QualityCategory": r[4],
        }
        for r in rows
    ]

    return jsonify(data)

@app.route("/quality")
def quality_summary():
    year = request.args.get("year")  # optional filter

    conn = sqlite3.connect("public/sentiment_data.db")
    cursor = conn.cursor()

    if year:
        query = """
            SELECT QualityCategory, COUNT(*) 
            FROM comments 
            WHERE substr(publishedAt, 1, 4) = ? 
            GROUP BY QualityCategory
        """
        cursor.execute(query, (year,))
    else:
        query = """
            SELECT QualityCategory, COUNT(*) 
            FROM comments 
            GROUP BY QualityCategory
        """
        cursor.execute(query)

    rows = cursor.fetchall()
    conn.close()

    # ✅ Replace None with "Unknown"
    data = { (row[0] if row[0] is not None else "Unknown") : row[1] for row in rows }

    return jsonify(data)

@app.route("/sentiment_yearly")
def sentiment_yearly():
    conn = sqlite3.connect("public/sentiment_data.db")
    cursor = conn.cursor()
    query = """
        SELECT substr(publishedAt, 1, 4) as year, sentiment, COUNT(*)
        FROM comments
        GROUP BY year, sentiment
        ORDER BY year
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()

    data = {}
    for year, sentiment, count in rows:
        if year not in data:
            data[year] = {}
        data[year][sentiment] = count
    return jsonify(data)

@app.route("/sentiment")
def sentiment_summary():
    year = request.args.get("year")  # optional filter

    conn = sqlite3.connect("public/sentiment_data.db")
    cursor = conn.cursor()

    if year:
        query = """
            SELECT sentiment, COUNT(*) 
            FROM comments 
            WHERE substr(publishedAt, 1, 4) = ? 
            GROUP BY sentiment
        """
        cursor.execute(query, (year,))
    else:
        query = """
            SELECT sentiment, COUNT(*) 
            FROM comments 
            GROUP BY sentiment
        """
        cursor.execute(query)

    rows = cursor.fetchall()
    conn.close()

    data = {row[0]: row[1] for row in rows}
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
