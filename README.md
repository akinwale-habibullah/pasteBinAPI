# PasteBin Clone

## Vision

A very big legal company with about 50,000 employees globally that is very serious on privacy and non disclosure and intellectual property protection. Lawyers on different teams usually share a lot of memos and snippets of old cases and reports. 

A member of the team discovers https://pastebin.com/ but due to concerns on violating the company’s privacy policy decides against using it. Instead they come to you to build something similar for use within the company.

This API provides the similar functionalities to PastBin, but with security and data privacy considerations. This service take a bunch of text and return a short url to the caller. The service allows users to set an expiry for content so that it self destructs after the said expiry date, however, expiry is optional.


## Installation

### Prerequisites

- Node.JS
- MongoDB

### How to run
- In your termianl run ```cd pastebinclone```
- ```npm install```
- open __config/default.json__ file and fill the fields. This is required many features to work properly.
- ```npm run dev```
- Make API request calls using __Postman__ or any other REST client.

### Key design considerations

- Job Scheduling: This application uses ```node-schedule```, a dependency optimised for scheduling jobs that will run once, as against using a cron based implementation, which runs several times over an internal.

  This dependency is used to delete pastes on the specified expiresOn date.

  The downside of this dependency is that, once the application stops, all scheduled jobs are lost.

  For production based environment, its best to use a separate server or service to manage jobs scheduling that is always up and running, and communication between this app and the job scheduling server can happen over a message queue.

### Build instruction

This project was written using ES6 modules, hence the need for babel to transpile source code to ES5.

- run ```npm run build```. This creates a new ```dist``` directory.
- Execute the transpiled code, run ```npm start```.


### API Spec

The preferred JSON format for response follows the [JSEND](https://github.com/omniti-labs/jsend) specification, which lays down some rules for how JSON responses from web servers should be formatted.

<table>
<tr><th>Type</td><th>Description</th><th>Required Keys</th><th>Optional Keys</td></tr>
<tr><td>success</td><td>All went well, and (usually) some data was returned.</td><td>status, data</td><td></td></tr>
<tr><td>fail</td><td>There was a problem with the data submitted, or some pre-condition of the API call wasn't satisfied</td><td>status, data</td><td></td></tr>
<tr><td>error</td><td>An error occurred in processing the request, i.e. an exception was thrown</td><td>status, message</td><td>code, data</td></tr>
</table>

#### Endpoints

__Authentication__:

```POST /api/auth```

Example request body:

```
  {
    "name": "demo name",
    "email": "email@sample.com"
    "password": "password"
  }
```

No authentication required, returns a User.

Required fields:  ```email```, ```name```, ```password```

```POST /api/auth/login```

Example request body:

```
  {
    "email": "email@sample.com"
    "password": "password"
  }
```

No authentication required, returns a User.

Required fields:  ```email```, ```password```

```GET /api/auth/activate/:token```

No authentication required, returns an HTML page.


__Paste__:

```POST /api/paste```

Example request body:

```
  {
    "text": "demo name",
    "password": "password",
    "title": "title"
    "burnAfterRead": "true",
    "expiresOn": "8848402475" // UNIX timestamp,
  }
```

Authentication required, returns URL in response.data.

Required fields:  ```text```

```GET /api/paste```

Authentication required, returns a list of all response by the user associated with Bearer Token in request header.

```GET /api/paste/:id```

Example request body:


Authentication required, returns paste object.


```GET /api/paste/:id/download```

Example request body:


Authentication required, returns raw paste object.


```PUT /api/paste/:id```

Example request body:

```
  {
    "text": "demo name",
    "password": "password",
    "title": "title"
    "burnAfterRead": "true",
    "expiresOn": "8848402475" // UNIX timestamp,
  }
```

Authentication required, returns edited paste object in response.data.

```DELETE /api/paste/:id```

Example request body:


Authentication required, returns confirmation whether paste was successfully deleted or not, in response.data.

### Deployment

On the production server, or in an automated CI/CD pipeline;

- To deploy to production, create a ```production.json``` file in __config__ folder.
- Copy the values in ```default.json``` into the newly created ```production.json``` file.
- Run ```npm run build```
- Run ```npm start```

### Product roadmap

To further improve this API, these are the list of tasks to do;

- Add Unit and Integration tests.
