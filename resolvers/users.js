import { mongoConnection as db } from "../db/index.js";
//import { uploadStream } from "../lib";
import path from "path";

export const users = async (_, args) => {
    return await db.collection('User').find().toArray()
}

export const createUser = async (args) => {
    const users = db.collection('User')
    const { insertedId } = await users.insertOne(args)

    // var toPath = path.join(__dirname, 'assets', 'photos', `${insertedId}.jpg`)

    // await { stream } = args.input.file
    // await uploadFile(input.file, toPath)

    return await users.findOne({_id: insertedId})
}

export const createFakeUsers = async (_, args) => {
    const fakeApi = `https://randomuser.me/api/?results=${args.qtde}`

    var { results } = await fetch(fakeApi).then(res => res.json())

    var users = results.map((r) => ({
        name: `${r.name.first} ${r.name.last}`,
        //avatar: r.picture.thumbnail,
        //login: r.login.username,
        email: r.email
    }))

    await db.collection('User').insertMany(users)

    return users
}

