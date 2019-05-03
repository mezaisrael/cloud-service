### URB Service API

Endpoints <br>

GET

`/` - Root endpoint, returns `[activeJobs:{[...activejobs]},completedJobs{[...completedJobs]}]`, basically a combination of the below two calls.

`/activejobs` - returns an array of json entries of just the active jobs.

`/completedjobs` - returns an array of json entries of just the completed jobs.

`/jobs/{domain}` - `domain = [west, north, east]`, returns an array of current jobs running on the particular entries.

POST

`/request` - Endpoint to post the request from the user from the resource request dashboard.

FILES

`active-jobs.json` - Holds the list of current actively running jobs.

`completed-jobs.json` - Holds the list of completed jobs.

`mock-*` - Sample mock data files for dev/testing.

