# test_translate.py
from llm.query_translator import translate_question_to_sql

question = "What is my total sales?"
sql = translate_question_to_sql(question)
print("Generated SQL:")
print(sql)
