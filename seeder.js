import { faker } from "@faker-js/faker";
import connect from "./utils/connect.js";
import mongoose from "mongoose";
import { User } from "./models/User.js";

async function seedData() {
  await connect();
  await User.deleteMany({});

  for (let i = 0; i < 20; i++) {
    const newUser = new User({
      name: faker.person.fullName(),
      age: faker.number.int({ min: 18, max: 25 }),
      email: faker.internet.email(),
    });
    await newUser.save();
  }
  console.log("Created and Saved successfuly!");
  await mongoose.connection.close();
}

seedData();
