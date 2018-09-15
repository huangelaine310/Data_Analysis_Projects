from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By 
from selenium.webdriver.support.ui import WebDriverWait 
from selenium.webdriver.support import expected_conditions as EC 
from selenium.common.exceptions import TimeoutException

titles = []
browser = webdriver.Firefox(executable_path='/Users/kat/Downloads/geckodriver')

NUM_PAGES = 36

for i in range(1, NUM_PAGES + 1):
	browser.get("http://www.quodb.com/search/ready%20when%20you%20are?p=" + str(i) + 
				"&titles_per_page=20&phrases_per_title=1")

	timeout = 20
	try:
	    WebDriverWait(browser, timeout).until(EC.visibility_of_element_located((By.XPATH, "//tr")))
	except TimeoutException:
	    print("Timed out waiting for page to load")
	    browser.quit()

	elems = browser.find_elements_by_xpath("//small[@class='title']")
	
	for elem in elems:
		if ":" not in elem.text:
			idx_1 = elem.text.find("(")
			idx_2 = elem.text.find(")")
			if (idx_1 != -1) and (idx_2 != -1):
				try:
					year = int(elem.text[idx_1+1:idx_2])
					if year >= 1995 and year <= 2015:
						titles.append(elem.text)
				except: 
					pass

browser.close()

for title in titles:
	print (title)
