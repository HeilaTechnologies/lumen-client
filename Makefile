# Deploy compiled frontend to web server and puppet repo
#

all : deploy
.PHONY : all deploy production

deploy : production local
	rsync -r -v -e 'ssh -p 2222' --delete dist/production beta.wattsworth.net:/opt/angular/lumen && \
	rsync -r -v -e 'ssh -p 2222' --delete dist/local/ beta.wattsworth.net:/home/jdonnal/puppet/modules/static_sites/files/lumen && \
	ssh -A -p2222 beta.wattsworth.net /home/jdonnal/rebuild_angular.sh

production:
	ng build --e prod  -op dist/production -prod 
local:
	ng build -e local -op dist/local -prod

