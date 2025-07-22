import pandas as pd
import sqlite3

ad_sales_df = pd.read_excel(r"../data/ad_sales.xlsx")
total_sales_df = pd.read_excel(r"../data/total_sales.xlsx")
eligibility_df = pd.read_excel(r"../data/eligibility.xlsx")

conn = sqlite3.connect(r"ecommerce.db")

ad_sales_df.to_sql("ad_sales", conn, if_exists="replace", index=False)
total_sales_df.to_sql("total_sales", conn, if_exists="replace", index=False)
eligibility_df.to_sql("eligibility", conn, if_exists="replace", index=False)

print("✅ Database setup complete.")

conn.close()
