# Tweet-MApp
An app that retrieves tweets about SARAi's 9 crops using the Twitter API and MapQuest API

How to Run:

	1. configure the local mysql database
		-on the Tweet-MApp folder, there is a file named "tweets.sql"
		-open terminal in Tweet-MApp/ and open mysql in command line
		-input command:
			source tweets.sql;

	2. populate database with initial data
		-on the Tweet-MApp folder, there is a file named "initial_data.sql"
		-open terminal in Tweet-MApp/ and input command:
			mysql -u root -p tweets < initial_data.sql

	3. server
		-open terminal in Tweet-MApp/server
		-input command:
			npm i package.json
		-after installation of node modules, open "index.js" file
		-in line 36 of the file, set password to mysql root password
		-input command:
			node index.js
		-server should now be running

	4. front-end
		-open another terminal in Tweet-MApp/react-app
		-input command:
			npm i package.json
		-after installation of node modules, input command:
			npm start
		-application should now be running on browser

	5. webpages
		-user webpage can be accessed via:
			localhost:3000/
		-administrator webpage can be accessed via:
			localhost:3000/admin
		-administrator page password is "password"