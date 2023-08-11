const mongoose = require('mongoose');

//----------------------------------------------------DB - 'Users'---------------------------------------------------------

//Schemas for Database 'Users'

const SignupSchema = mongoose.Schema({                                              
    name:{
        type:String,                                                         
        required:true
    },
    email:{
        type:String,                                                         
        required:true
    },
    ph:{
        type:String,                                                         
        required:true
    },
    password:{
        type:String,                                                          
        required:true
    }
})
const CurriculumSavedSchema = mongoose.Schema({
    s_no:{
        type:String,                                                         
        required:true        
    },
    name:{
        type:String,                                                         
        required:true            
    },
    description:{
        type:String,
        required:true
    },
    approvedStatus:{
        type:Boolean,
        default:false
    },
    requirementName:{
        type:String,
        required:true
    },
    trainingArea:{
        type:String,
        required:true,
        enum: ['FSD', 'ML-AI', 'DSA', 'RPA', 'ST', 'CSA'],
    },
    institution:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true,
        enum: ['Retail', 'Academic', 'Corporate', 'Govt'],
    },
    trainingHours:{
        type:Number,
        required:true
    },
    referenceLink:String,
    referenceLinkID:String

})
const CurriculumSchema = mongoose.Schema({
    s_no:{
        type:String,                                                         
        required:true        
    },
    name:{
        type:String,                                                         
        required:true            
    },
    description:{
        type:String,
        required:true
    },
    approvedStatus:{
        type:Boolean,
        default:false
    }

})
const RequirementSchema=mongoose.Schema({
    requirementName:{
        type:String,
        required:true
    },
    trainingArea:{
        type:String,
        required:true,
        enum: ['FSD', 'ML-AI', 'DSA', 'RPA', 'ST', 'CSA'],
    },
    institution:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true,
        enum: ['Retail', 'Academic', 'Corporate', 'Govt'],
    },
    trainingHours:{
        type:Number,
        required:true
    },
    referenceLink:String,
    referenceLinkID:String
})



const users = mongoose.connection.useDb('Users');


const usersSignupLoginData = users.model('users',SignupSchema);
const curriculumSavedSchema = users.model('curriculum-save',CurriculumSavedSchema) 
const curriculumSchema = users.model('curriculums',CurriculumSchema) //final curriculum model
const requirementSchema = users.model('requirements',RequirementSchema)

//----------------------------------------------------DB - 'Chats' FOR FACULTY---------------------------------------------------------

//Schema for Database 'Chats'

const chats = mongoose.connection.useDb('Chats');

const chatUsersSchema=mongoose.Schema({
    sender:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true,
    },
    requirementName:{
        type:String,
        required:true,
    },
    timestamp:{
        type:String,
        required:true
    }
});

// function createCollection(username){
//     return  userChatModel = chats.model(username,chatUsersSchema);
// }

//------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------DB - 'admin' FOR Admin---------------------------------------------------------

//Schema for Database 'Chats'

const admin = mongoose.connection.useDb('AdminChats');

const chatAdminSchema=mongoose.Schema({
    sender:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true,
    },
    recipient:{
        type:String,
        required:true,
    },
    requirementName:{
        type:String,
        required:true,
    },
    timestamp:{
        type:String,
        required:true
    }
});

//Find the collections with the facultyname from the admin database to get the messages from the admin to the faculty
async function findCollectionWithFacultyNameChatDB(facultyName,requirementName) {
    try {
        console.log(facultyName)
      const collections = await chats.db.listCollections().toArray();
      console.log("Collections",collections)
    //   const matchingCollection = collections.find((collection) => collection.name === facultyName);
    //   console.log("matching Collection",matchingCollection)
      const facultyChatModel = chats.model(facultyName.name, chatAdminSchema,facultyName);       
      const messages = await facultyChatModel.find({requirementName:requirementName});
      //console.log("Messages",Messages)
      console.log(messages)
      return messages;
    } catch (error) {
      console.error('Error while searching for collection:', error);
      return [];
    }
  }
async function findCollectionWithFacultyNameAdminDB(facultyName,requirementName) {
    try {
        console.log(facultyName)
      const collections = await admin.db.listCollections().toArray();
      console.log(collections)
    //   const matchingCollection = collections.find((collection) => collection.name === facultyName);
    //   console.log(matchingCollection)
      const adminChatModel = admin.model(facultyName.name, chatAdminSchema,facultyName);       
      const messages = await adminChatModel.find({requirementName:requirementName});
      //const Messages = [...messages]
      //console.log("Messages",Messages)
      //console.log(Messages)
      return messages;
    } catch (error) {
      console.error('Error while searching for collection:', error);
      return [];
    }
  }
//Find the collections with the facultyname from the admin databaseand chat database to get the messages from the admin to the faculty
//   async function fetchMessagesFromCollections(facultyName) {
//     try {
//         console.log(`Inside the function ${facultyName}`)
//         const collectionNameAdmin = await findCollectionWithFacultyName(admin, facultyName);
//         const collectionNameFaculty = await findCollectionWithFacultyName(chats, facultyName);
  
//         const adminChatModel = admin.model(collectionNameAdmin, chatAdminSchema);
//         const messagesAdmin = await adminChatModel.find({});
//         console.log('Messages from Admin:', messagesAdmin);

//         const userChatModel = chats.model(collectionNameFaculty, chatUsersSchema);
//         const messagesFaculty = await userChatModel.find({});
//         console.log('Messages from faculty:', messagesFaculty);

//         const messages = [...messagesAdmin, ...messagesFaculty]; // Merge both arrays

//         // Sort the merged messages array based on the timestamp in ascending order
//         messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
//         console.log('Sorted Messages:', messages);

//         return messages;

//     } catch (error) {
//       console.error('Error while fetching data:', error);
//       return error
//     }
//   }
  
//   // Function to find the collection with the given faculty name
//   async function findCollectionWithFacultyName(dbname, facultyName) {
//     try {
//       const collections = await dbname.db.listCollections().toArray();
//       const matchingCollection = collections.find((collection) => collection.name === facultyName);
//       return matchingCollection ? matchingCollection.name : null;
//     } catch (error) {
//       console.error('Error while searching for collection:', error);
//       return null;
//     }
//   }
  
//------------------------------------------------------------------------------------------------------------------------

//module.exports = {usersSignupLoginData,curriculumSchema,requirementSchema,curriculumSavedSchema,createCollection};
//module.exports = {usersSignupLoginData,curriculumSchema,requirementSchema,curriculumSavedSchema,chats,chatUsersSchema,admin,chatAdminSchema,fetchMessagesFromCollections};
module.exports = {usersSignupLoginData,curriculumSchema,requirementSchema,curriculumSavedSchema,chats,chatUsersSchema,admin,chatAdminSchema,findCollectionWithFacultyNameChatDB,findCollectionWithFacultyNameAdminDB};