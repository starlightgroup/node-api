# tacticalmastery api

`npm start`


# how to build both api and frontend on the same domain

this is not 100% production ready approach.

1. Check system
===============

you need linux box with `npm`, `node`,`redis`,`git`. I tested on this versions

```shell

    [vodolaz095@ivory flashlightsforever]$ node -v
    v6.8.0
    [vodolaz095@ivory flashlightsforever]$ npm -v
    4.1.2
    [vodolaz095@ivory flashlightsforever]$ redis-server -v
    Redis server v=3.0.6 sha=00000000:0 malloc=jemalloc-4.0.4 bits=64 build=6dcf3277028a695a
    [vodolaz095@ivory flashlightsforever]$ git version
    git version 2.7.4

```

it is possible to build and run this api on other OSes, but i have near 0 skills with them.

2. Check redis
===============
you need start `redis` server with stack sessings - listening on localhost:6379 without password

3. Clone repos 
===============
You need to clone both frontend and backend repo in, for example `/home/{username}/projects/starlight`

```shell

  $ mkdir -p ~/projects/starlightgroup
  $ git clone
  $ cd ~/projects/starlightgroup

  $ git clone git@github.com:starlightgroup/flashlightsforever.git
  $ git clone git@github.com:starlightgroup/node-api.git

```

4. Set proper branches and install dependencies 
================
Than you need to change branch to `dev` in both repos and install modules required


For frontend

```shell

  $ cd ~/projects/starlightgroup/flashlightsforever
  $ git checkout dev
  $ npm install
  $ ./node_modules/.bin/gulp


```

For backend


```

  $ cd ~/projects/starlightgroup/node-api
  $ git checkout dev
  $ npm install

```

5. Link code 
===============

Backend has embedded web server, that serves all static files from `~/projects/node-api/public`
We will use it to serve both frontend and backend from the same domain. To do so, we need to
symlink compiled frontend code to web server folder.


```

  $ ln -s ~/projects/starlightgroup/flashlightsforever/tacticalsales ~/projects/starlightgroup/node-api/public

```

6. Start code
================
Than we need to start code

```

  $ cd ~/projects/starlightgroup/node-api
  $ npm start

```

7. Verify code is running
=================
It will start both frontend code and backend code on [http://localhost:8000](http://localhost:8000)


Frontend files are accessible on
[http://localhost:8000/index.html](http://localhost:8000/index.html)

API accessible on

[http://localhost:8000/api/v2/ping](http://localhost:8000/api/v2/ping)



# Starting code using docker-compose

1. Clone repos 
===============
You need to clone both frontend and backend repo in, for example `/home/{username}/projects/starlight`

```shell

  $ mkdir -p ~/projects/starlightgroup
  $ git clone
  $ cd ~/projects/starlightgroup

  $ git clone git@github.com:starlightgroup/flashlightsforever.git
  $ git clone git@github.com:starlightgroup/node-api.git


```

2. Set proper branches 
================
Than you need to change branch to `dev` in both repos and install modules required


For backend


```

  $ cd ~/projects/starlightgroup/node-api
  $ git checkout dev

```

For frontend (you need to build code)

```shell

  $ cd ~/projects/starlightgroup/flashlightsforever
  $ git checkout dev
  $ npm install
  $ ./node_modules/.bin/gulp


```


3. Symlink/copy frontend code to `public/` directory in `node-api` directory.
=====================================

Backend has embedded web server, that serves all static files from `~/projects/node-api/public`
We will use it to serve both frontend and backend from the same domain. To do so, we need to
symlink compiled frontend code to web server folder.


```

  $ ln -s ~/projects/starlightgroup/flashlightsforever/tacticalsales ~/projects/starlightgroup/node-api/public

``` 
 
4. Start application by docker compose
======================================


```

  # docker-compose up --build 

```

5. It have to start webserver on http://localhost:8000/
With frontend served from `public/` folder. You can edit frontend code on the fly - it will 
be instantly loaded to web server