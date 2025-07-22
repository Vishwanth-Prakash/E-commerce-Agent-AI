
import os
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def translate_question_to_sql(question: str) -> str:
    prompt = f"""
You are a helpful assistant that converts natural language questions into SQL queries.

Use the following database schema:
Table: ad_sales(date,item_id,ad_sales,impressions,ad_spend,clicks,units_sold)
Table: total_sales(date,item_id,total_sales,total_units_ordered)
Table: eligibility(eligibility_datetime_utc, item_id, eligibility, message)

Convert this question to SQL:
"{question}"
Only return the SQL query. Do not explain anything.
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
