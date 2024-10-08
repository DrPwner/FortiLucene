# FortiLucene Query Builder

![FortiLucene Preview (1)](https://github.com/user-attachments/assets/f5c72901-6372-4e20-b96d-d2ebfbb22f9f)

bad GIF quality ^, try zooming in a bit.
## 🚀 About

FortiLucene Query Builder is a powerful web application designed to simplify the process of constructing complex Lucene queries for FortiEDR. It provides an intuitive interface for users to build and visualize, making Threat Hunting and Log Analysis more efficient and accessible.

## ✨ Features

- **Interactive Query Building**: Easily select the queries depending on your case.
- **Category-based Query Selection**: Organized query options based on information categories
- **Query Validation**: Ensures syntactically correct queries
- **Copy to Clipboard**: Easy export of finished queries
- **Import Feature**: Bulk import values for query construction
- **Help Menu**: Built-in guide for query syntax and examples
- **Save Queries**: Ability to save built Queries in a dedicated Table in the backend.
- **Import & Export**: Easily Export your Saved Queries and for back up, or share it with a friend (this is where the Import option takes place :) )

## 🏁 Getting Started

### Prerequisites

- Python 3.X
- Flask
- SQLite3

### Installation

1. Clone the repository:
   - git clone https://github.com/DrPwner/FortiLucene.git

2. Navigate to the project directory:
   - cd FortiLucene

3. Run the application:
   - python app.py

4. Open your browser and go to `http://localhost:5000`


## 🖥 Usage

1. Select a query category from the dropdown menu.
2. Choose a specific query from the selected category.
3. Enter the value for your query.
4. Add additional query parts as needed.
5. Click "Build Query" to generate your Lucene query.
6. Use the "Copy Query" button to copy the generated query to your clipboard.
7. Save your Query for Future Reference.
8. Click "Help Menu" For further insights on FortiEDR Lucene Syntax (Examples, Usage, Syntax).
9. Click "Edit FortiLucene Database" To either export or import your saved queries, or renaming the family friendly name of any corresponding Built-in Query of your choice.

https://github.com/user-attachments/assets/b16aa71d-4c75-4b70-b343-4929f5899a62



## 📥 Import Feature

The import feature allows you to bulk import values for your queries. Here's how to use it:

1. Prepare a text file with your values, one per line.
2. In the query builder, click on the " ⋮ " next to the value input field.
3. Select "Import" from the dropdown.
4. Choose an operator for combining the imported values.
5. Select your prepared text file. (Make sure values inside text file are Bellow each other... seperated by new line)

Example import file content for IP addresses:


https://github.com/user-attachments/assets/146183ee-24f9-49a8-a126-f0bc48677fb4




After import, your query might look like:
```
NOT RemoteIP:(143.109.206.41 OR 192.98.127.57 OR 203.172.54.84 OR 58.183.240.171 OR 111.42.78.233 OR 150.123.98.207 OR 176.98.23.45 OR 207.66.142.89 OR 89.204.111.254 OR 62.185.30.14 OR 185.173.98.140 OR 94.199.7.120 OR 52.232.64.91 OR 139.87.123.220 OR 165.77.53.9 OR 
 200.88.29.182 OR 91.32.174.105 OR 215.120.65.240 OR 68.74.12.197 OR 159.189.77.32)
```

Note that the import feature is not strictly for IP's, it can be useful for anything. For example, creating a query to look for a handful of MTIRE TTP's.
## Future Improvements

1. Interaction with FortiLucene Database, have the ability to rename an existing family friendly FortiEDR Lucene Query. (Done)
2. UI Improvements (Partially Done)
3. Backend Optimization, and more ! (Partially Done)
4. Any new ideas? let me know.
