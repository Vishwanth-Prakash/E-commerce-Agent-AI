from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import pandas as pd
import plotly.express as px
from llm.query_translator import translate_question_to_sql

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("✅ Backend started successfully")

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
            return {
                "question": question,
                "answer": "No data found for your query.",
                "sql_query": sql_query,
                "visualize": False
            }

        if len(columns) == 2 and all(isinstance(row[1], (int, float)) for row in rows):
            x_data = [row[0] for row in rows]
            y_data = [row[1] for row in rows]
            return {
                "question": question,
                "answer": "Here is the visual representation.",
                "sql_query": sql_query,
                "visualize": True,
                "graphType": "bar",
                "graphData": {
                    "x": x_data,
                    "y": y_data,
                    "xLabel": columns[0],
                    "yLabel": columns[1],
                    "title": question.capitalize()
                }
            }

        answer_lines = []
        for row in result:
            line = ', '.join(f"{key}: {value}" for key, value in row.items())
            answer_lines.append(line)
        answer = "\n".join(answer_lines)

        return {
            "question": question,
            "answer": answer,
            "sql_query": sql_query,
            "visualize": False
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error processing question: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
    

    finally:
        if 'conn' in locals():
            conn.close()
