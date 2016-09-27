# tacticalmastery api

### install
```
apt-get update
apt-get -y install npm nodejs-legacy
npm install -g forever nodemon pm2 babel-cli
npm install
```

### Code Quality Check

Always check our code quality. At best, we address the code alerts before we submit to repo.

`npm run lint`

### build
`rm -rf dist && babel . --ignore node_modules --out-dir dist --source-maps`

### start
`npm start`
