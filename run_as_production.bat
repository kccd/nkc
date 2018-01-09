
@set NODE_ENV=production
:loop
@echo Starting...
@node.exe -i server.js
@goto :loop
