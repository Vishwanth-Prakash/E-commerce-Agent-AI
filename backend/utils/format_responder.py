def format_answer(columns, data):
    return [dict(zip(columns, row)) for row in data]