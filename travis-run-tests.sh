if [ "${TRAVIS_BRANCH}" != "master" ] || [ "${TRAVIS_PULL_REQUEST}" != "false" ]
then
	SAUCE_USERNAME=$PR_SAUCE_USERNAME
	SAUCE_ACCESS_KEY=$PR_SAUCE_ACCESS_KEY
fi

if [ "${SAUCE_USERNAME}" ] && [ "${SAUCE_ACCESS_KEY}" ]
then
	grunt test:ci
else
	grunt test
fi