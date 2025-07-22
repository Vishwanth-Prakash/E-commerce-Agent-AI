
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
import sqlite3
import pandas as pd
import plotly.express as px
from llm.query_translator import translate_question_to_sql

app = FastAPI()

@app.post("/ask")
async def ask_question(request: Request):
    body = await request.json()
    question = body.get("question")

    try:
        sql_query = translate_question_to_sql(question)

        conn = sqlite3.connect("database/ecommerce.db")
        cursor = conn.cursor()
        cursor.execute(sql_query)
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        result = [dict(zip(columns, row)) for row in rows]

        if not result:
            return {"question": question, "answer": "No data found for your query."}

        if len(columns) == 2 and all(isinstance(row[1], (int, float)) for row in rows):
            df = pd.DataFrame(result)

            fig = px.bar(df, x=columns[0], y=columns[1], title=question.capitalize())
            html_plot = fig.to_html(full_html=False)

            return HTMLResponse(content=html_plot, media_type="text/html")

        answer_lines = []
        for row in result:
            line = ', '.join(f"{key}: {value}" for key, value in row.items())
            answer_lines.append(line)
        answer = "\n".join(answer_lines)

        return {
            "question": question,
            "answer": answer
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})
    
    finally:
        if 'conn' in locals():
            conn.close()
