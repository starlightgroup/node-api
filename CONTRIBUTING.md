How to push code to this repository.
======================
1. Verify you have sane local setup - `nodejs` of `7.5.0`, npm of `^^4.1.2` redis database with stack 
settings listening on `localhost:6379`. You can use `docker-compose up` to help you. 
Anatolij works mainly with fedora linux and has ~0 skills with Windows and Macos, so he apologies if development
is more tricky on OSes other than linux.

2. Verify you have installed all nodejs modules and choosed proper code style for your IDE

3. Choose open backend related tickets on https://starlightgroup.atlassian.net

4. Make feature branch with name like `feature/SG-XX` or `hotfix/SG-XX` if it is related to ticket, or
with SANE name like `hotfix/stopThingsExploding` and so on

5. Verify that your code pass lint checks - `npm run-script lint`

6. Verify that your code pass unit tests - `npm test`

7. Push code to your feature branch and make pull request to `dev` branch. I repeat, `dev` branch.

8. Notify Anatolij or Yang to merge PR using slackchat.

Anatolij github id - @vodolaz095

Yang's github id - @starneit


Branch meaning
====================

- `dev` - code is working, ok to deploy locally for development or on dev server

- `staging` - code is working and mainly tested - ok to deploy on staging server

- `master` - code for production