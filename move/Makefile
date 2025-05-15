docker:
	docker-compose up -d

migrate:
	cd ./api/ ; db-migrate up -e local

node-memory-mac:
	export NODE_OPTIONS="--max-old-space-size=8192"

node-memory-windows:
	Set NODE_OPTIONS="--max-old-space-size=8192"
