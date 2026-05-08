const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb+srv://codewithvivek404_db_user:12345@cluster0.hcwr9ws.mongodb.net/?appName=Cluster0');
  const Rider = mongoose.model('Rider', new mongoose.Schema({ userId: String }));
  const rider = await Rider.findOne();
  if (rider) {
    console.log('RIDER_ID=' + rider._id);
  } else {
    console.log('NO_RIDER_FOUND');
  }
  process.exit();
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
