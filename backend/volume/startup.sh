npm install prisma --save-dev # no longer needed because it is already in package.json

# THIS IS PROBABLY NEEDED ON FRESH CLONE
npx prisma
npx prisma init
npx prisma migrate dev --name init
npm install @prisma/client

npx prisma generate

npm install
npm run start