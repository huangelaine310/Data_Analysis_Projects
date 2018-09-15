import csv
import sys
import xlsxwriter

maxInt = sys.maxsize
decrement = True

while decrement:
    # decrease the maxInt value by factor 10 
    # as long as the OverflowError occurs.

    decrement = False
    try:
        csv.field_size_limit(maxInt)
    except OverflowError:
        maxInt = int(maxInt/10)
        decrement = True

movies = []
with open('movies.csv') as csvDataFile:
    csvReader = csv.reader(csvDataFile)
    for row in csvReader:
    	if row[0] != '':
    		s = row[0].split()
    		s = s[0:len(s)-1]
    		for i in range(len(s)):
    			s[i] = s[i].lower()
    		s = ' '.join(s)
    		movies.append(s)

imdb_movies = []
with open('title.basics.tsv') as tsvDataFile:
    tsvReader = csv.reader(tsvDataFile)
    for row in tsvReader:
    	s = ", ".join(row)
    	s = s.split("\t")
    	if len(s) == 9:
    		imdb_movies.append({'title': s[3].lower(), 'code': s[0], 'genres': s[8]})

ratings = []
with open('title.ratings.tsv') as tsvDataFile:
    tsvReader = csv.reader(tsvDataFile)
    for row in tsvReader:
    	s = row[0].split("\t")
    	if len(s) > 1:
    		ratings.append({'code': s[0], 'rating': s[1]})

final = []
# for title in movies:
for i in range(len(movies)):
	genres = 'NO DATA'
	rating = 'NO DATA'
	foundMovie = (next((item for item in imdb_movies if item["title"] == movies[i]), None))
	if foundMovie != None:
		genres = foundMovie['genres']
		foundRating = (next((item2 for item2 in ratings if item2["code"] == foundMovie["code"]), None))
		if foundRating != None:
			rating = foundRating['rating']
	item = {'title': movies[i], 'genres': genres, 'rating': rating}
	final.append(item)
	print (item)


# Create a workbook and add a worksheet.
workbook = xlsxwriter.Workbook('movies_imdb2.xlsx')
worksheet = workbook.add_worksheet()

# Start from the first cell. Rows and columns are zero indexed.
row = 0
col = 0

# Iterate over the data and write it out row by row.
for item in (final):
    worksheet.write(row, col, item['title'])
    worksheet.write(row, col + 1, item['genres'])
    worksheet.write(row, col + 2, item['rating'])
    row += 1

workbook.close()


























