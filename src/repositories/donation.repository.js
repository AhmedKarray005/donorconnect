import { getDb } from "../db/mongo.js";
import { ObjectId } from "mongodb";

export async function getAllDonations() {
  return await getDb().collection("donations").find().toArray();
}

export async function getDonationById(id) {
  return await getDb()
    .collection("donations")
    .findOne({ _id: new ObjectId(id) });
}

export async function createDonation(data) {
  const result = await getDb().collection("donations").insertOne(data);

  return { _id: result.insertedId, ...data };
}

export async function updateDonation(id, data) {
  const result = await getDb()
    .collection("donations")
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: "after" }
    );

  return result;
}

export async function deleteDonation(id) {
  return await getDb()
    .collection("donations")
    .deleteOne({ _id: new ObjectId(id) });
}
