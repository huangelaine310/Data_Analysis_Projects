from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import csv
import xlsxwriter

movies = []

with open('movies.csv') as csvDataFile:
    csvReader = csv.reader(csvDataFile)
    for row in csvReader:
    	if row[0] != '':
    		s = row[0].split()
    		s = s[0:len(s)-1]
    		for i in range(len(s)):
    			s[i] = s[i].replace("-", '')
    			s[i] = s[i].replace("/", '')
    			s[i] = s[i].replace("'", '')
    			s[i] = s[i].replace("_", '')
    			s[i] = s[i].replace("!", '')
    			s[i] = s[i].replace(".", '')
    			s[i] = s[i].replace("?", '')
    			s[i] = s[i].lower()
    		s = '-'.join(s)
    		movies.append(s)
# print (movies)

browser = webdriver.Firefox(executable_path='/Users/kat/Downloads/geckodriver')
ratings = []

for i in range(1500,len(movies)):
	browser.get("http://www.metacritic.com/movie/" + movies[i])
	timeout = 5
	try:
	    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//tr")))
	except TimeoutException:
	    print("Timed out waiting for page to load")

	try:
		elem = browser.find_element_by_xpath("//div[@class='metascore_w user larger movie mixed']")
		rating = elem.text
	except:
		try:
			elem = browser.find_element_by_xpath("//div[@class='metascore_w user larger movie positive']")
			rating = elem.text
		except:
			try:
				elem = browser.find_element_by_xpath("//div[@class='metascore_w user larger movie negative']")
				rating = elem.text
			except:
				rating = 'NO RATING'

	try:
		elem = browser.find_element_by_xpath("//div[@class='genres']")
		genres = elem.text[elem.text.index(':')+2:]
	except:
		genres = 'NO GENRES'

	ratings.append({'title': movies[i].replace('-', ' '), 'genres': genres, 'rating': rating})

browser.close()

for item in ratings:
	print (item)


# Create a workbook and add a worksheet.
workbook = xlsxwriter.Workbook('movies_full_5.xlsx')
worksheet = workbook.add_worksheet()

# Start from the first cell. Rows and columns are zero indexed.
row = 0
col = 0

# Iterate over the data and write it out row by row.
for item in (ratings):
    worksheet.write(row, col, item['title'])
    worksheet.write(row, col + 1, item['genres'])
    worksheet.write(row, col + 2, item['rating'])
    row += 1

workbook.close()
