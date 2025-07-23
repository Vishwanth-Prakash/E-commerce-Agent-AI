import os
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def translate_question_to_sql(question: str) -> str:
    prompt = f"""
You are an expert data analyst assistant that converts natural language questions into SQL queries for data visualization.

Database schema:
- ad_sales(date, item_id, ad_sales, impressions, ad_spend, clicks, units_sold)
- total_sales(date, item_id, total_sales, total_units_ordered)
- eligibility(eligibility_datetime_utc, item_id, eligibility, message)

Instructions:
- first identify this can be suitable for visualization. if yes visualize=True, else visualize=False.
- Generate **clean SQL** suitable for plotting charts.
- Ensure the query returns 2-3 columns only for X and Y axis plotting.
- Prefer columns like date, item_id, total_sales, ad_sales, ad_spend, clicks.
- Group and order results appropriately for trend analysis.
- Do NOT include explanations.
- Return only the raw SQL query.

Natural Language Question:
"{question}"
    """

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    body = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ]
    }

    response = requests.post(url, headers=headers, json=body)
    data = response.json()

    try:
        sql = data["candidates"][0]["content"]["parts"][0]["text"]
        return sql.strip("```sql").strip("```").strip()
    except Exception as e:
        return f"-- Error extracting SQL: {e}"
