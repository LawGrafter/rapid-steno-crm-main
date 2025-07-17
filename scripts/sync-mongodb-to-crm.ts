import { createMongoDBSync } from '../src/integrations/software-integration/MongoDBSync';

const MONGO_URI = 'mongodb+srv://rapidsteno:uXsGv3N8zO1mMBFi@rapidsteno.9l3v7.mongodb.net/rapidSteno?retryWrites=true&w=majority';
const sync = createMongoDBSync(MONGO_URI);

sync.syncAllUsers({}).then(result => {
  console.log('Sync complete:', result);
  process.exit(0);
}).catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
}); 