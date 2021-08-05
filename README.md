# how to just build on local library 

npm run my-libbuild


# how to pack library

npm run my-libbuild
cd dist/my-lib/
npm pack

go to project folder - 
npm install ../my-workspace/dist/my-lib/my-lib-0.0.1.tgz


# How to publish a version

Update version in file => 

\ui-core\projects\my-lib\package.json


# Export Token
export CODEARTIFACT_AUTH_TOKEN=`aws codeartifact get-authorization-token --domain libs --domain-owner 698866732047 --query authorizationToken --output text`

aws codeartifact login --tool npm --repository code-arti-lib --domain libs --domain-owner 698866732047


npm run my-lib-publish


#How to install new library version in application 

export CODEARTIFACT_AUTH_TOKEN=`aws codeartifact get-authorization-token --domain libs --domain-owner 698866732047 --query authorizationToken --output text`

aws codeartifact login --tool npm --repository code-arti-lib --domain libs --domain-owner 698866732047

npm install  @gourav/my-lib@1.0.0


