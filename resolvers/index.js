import { createFakeUsers, createUser, users } from "./users.js";
import { PubSub } from 'graphql-subscriptions';
import { createWriteStream, unlink } from "fs";
import { 
    GraphQLNonNull, 
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLScalarType 
} from "graphql";

const pubsub = new PubSub();

async function storeUpload(upload) {
    const { createReadStream, filename } = await upload;
    const stream = createReadStream();
    const storedFileName = `${shortId.generate()}-${filename}`;
    const storedFileUrl = new URL(storedFileName, UPLOAD_DIRECTORY_URL);
  
    // Store the file in the filesystem.
    await new Promise((resolve, reject) => {
      // Create a stream to which the upload will be written.
      const writeStream = createWriteStream(storedFileUrl);
  
      // When the upload is fully written, resolve the promise.
      writeStream.on("finish", resolve);
  
      // If there's an error writing the file, remove the partially written file
      // and reject the promise.
      writeStream.on("error", (error) => {
        unlink(storedFileUrl, () => {
          reject(error);
        });
      });
  
      // In Node.js <= v13, errors are not automatically propagated between piped
      // streams. If there is an error receiving the upload, destroy the write
      // stream with the corresponding error.
      stream.on("error", (error) => writeStream.destroy(error));
  
      // Pipe the upload into the write stream.
      stream.pipe(writeStream);
    });  
}

export const resolvers = {
    Query: {
        users
    },

    Mutation: {
        createUser: async (parent, args) => {
            const user = createUser(args)
            
            storeUpload(args.file[0])

            pubsub.publish('USER_CREATED', {
                userCreated: user,
            });
            return user
        },
        createFakeUsers: (parent, args) => {
            const users = createFakeUsers(parent, args)
            pubsub.publish('USERS_CREATED', {
                usersCreated: users,
            });
            return users
        }
    },

    Subscription: {
        userCreated: {
            subscribe: () => pubsub.asyncIterator(['USER_CREATED']),
            //subscribe: () => {console.log('teste'); return {name: "teste"}}  
        },
        usersCreated: {
            subscribe: () => pubsub.asyncIterator(['USERS_CREATED'])  
        },
    },

    // DateTime: new GraphQLScalarType({
    //     name: 'DateTime',
    //     description: 'A valid date tiem value.',
    //     parseValue: value => new Date(value),
    //     serialize: value => new Date(value).toISOString(),
    //     parseLiteral: ast => ast.value
    // }),

    Upload: new GraphQLObjectType({
        name: "Upload",
        description: "A stored file.",
        fields: () => ({
            id: {
                description: "Unique ID.",
                type: new GraphQLNonNull(GraphQLString),
                resolve: (storedFileName) => storedFileName,
            },
            name: {
                description: "File name.",
                type: new GraphQLNonNull(GraphQLString),
                resolve: (storedFileName) => storedFileName,
            
            },
            url: {
                description: "File URL.",
                type: new GraphQLNonNull(GraphQLString),
                resolve: (storedFileName) =>
                    new URL(storedFileName, UPLOAD_DIRECTORY_URL),
            },
        })
    })
}