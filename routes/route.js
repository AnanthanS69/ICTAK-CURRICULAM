const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const secretKey = 'ICTAK';

router.use(express.json());
router.use(express.urlencoded({extended:true}));

const os = require('os');
const {google} = require('googleapis')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const keyFileContents = fs.readFileSync('ictak03-73387119ae0d.json');
const credentials = JSON.parse(keyFileContents);
const storage=multer.diskStorage({
    destination:os.tmpdir(),
    filename:function(req,file,callback){
        const extension = file.originalname.split('.').pop()
        callback(null, `${file.fieldname}-${Date.now()}.${extension}`)
    }
})
const upload = multer({storage:storage})

//const { usersSignupLoginData,curriculumSchema, requirementSchema, curriculumSavedSchema,chats,chatUsersSchema,admin,chatAdminSchema,fetchMessagesFromCollections}=require("../model/schema");
const { usersSignupLoginData,curriculumSchema, requirementSchema, curriculumSavedSchema,chats,chatUsersSchema,admin,chatAdminSchema,findCollectionWithFacultyNameChatDB,findCollectionWithFacultyNameAdminDB}=require("../model/schema");
//const { usersSignupLoginData,curriculumSchema, requirementSchema, curriculumSavedSchema,createCollection }=require("../model/schema");

router.post("/user-signup",async (req,res)=>{                              
    try{
        //console.log(req.headers.authorization)
        console.log(req.body);
        const user = req.body;                                               
        const newdata = await usersSignupLoginData(user);                               
        newdata.save();                                
        res.status(200).json({message:"POST Successful",api:'/signupstatus'});                                                                             
    }catch(error){
        res.status(400).json("Cannot /POST data");                            
        console.log(`Cannot POST data`);                                      
    }
})

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log(email,password)
  if(email==="admin@org.in" && password==="admin123"){
    const data = {email:email,role:"admin"}
    const token = jwt.sign({data},secretKey);
    res.status(200).json({ token, role:'admin', message: 'Admin Login successful',api:'/dashboard'});
  }else{
    usersSignupLoginData.findOne({ email, password })
    .then(user => {
      if (user) {
        const name = user.name;
        const data = {email:email,role:"user"}
        const token =jwt.sign({data}, secretKey)
        res.status(200).json({token, role:'user', message: 'Login successful',api:'/faculty-dashboard',user:name});
      } else {
        res.status(401).json({ error: 'Invalid username or password' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });

  }


});

  
  router.get('/fetchCurriculums',async(req,res)=>{
    try {
      res.set('Cache-Control', 'no-store');   
      let data = await curriculumSavedSchema.find({});
      res.set('Cache-Control', 'no-store');
      console.log(data)
      res.json({data:data,status:200}).status(201);
    } catch (error) {
      res.status(400).json({ message: "GET request CANNOT be completed" });       
    }
    })

    router.post('/curriculumform',upload.array('files'), async (req, res) => {
      try {

        console.log(req.body)
  
  
       const Files = req.files
  
        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes:['https://www.googleapis.com/auth/drive']
        })
  
        const drive = google.drive({
          version:'v3',
          auth
        }) 
        const uploadFiles = []
        let webViewLinkCurriculum;
        let fileIdCurriculum;
         // const file = req.files
          for (const file of Files){
            console.log("File",file)
            console.log(file.originalname)
            console.log(file.mimetype)
            const response =  await drive.files.create({
              requestBody:{
                name:file.originalname,
                mimetype:file.mimetype,
                parents:['1td9NQOCq8DBbM6KUrNGJ98uYm16uJb5A']
              },
              media:{
                body:fs.createReadStream(file.path)
              }
            })
            console.log(response)
            fileIdCurriculum = response.data.id; 
            console.log(fileIdCurriculum)
            webViewLinkCurriculum = `https://drive.google.com/file/d/${fileIdCurriculum}/view`;
          }

          const {s_no,name,description,approvedStatus,requirementName,trainingArea,institution,category,trainingHours} = req.body;
          const newCurriculum = new curriculumSavedSchema({
            s_no:s_no,
            name:name,
            description:description,
            approvedStatus:approvedStatus,
            requirementName:requirementName,
            trainingArea:trainingArea,
            institution:institution,
            category:category,
            trainingHours:trainingHours,
            referenceLink:webViewLinkCurriculum,
            referenceLinkID:fileIdCurriculum
          })
          // const {requirementName,
          //    trainingArea, 
          //    institution,
          //    category,
          //    trainingHours, referenceLink } = req.body
    //       const newRequirement = new requirementSchema({
    //         requirementName:requirementName,
    //         trainingArea:trainingArea,
    //         institution:institution,
    //         category:category,
    //         trainingHours:trainingHours,
    //         referenceLink:webViewLink,
    //         referenceLinkID:fileId
    //       })
  
    //   const createdRequirement = await newRequirement.save()
    //   console.log(createdRequirement)
    //   res.status(201).json({ data: createdRequirement, message: 'Requirement created successfully'});
    // } catch (error) {
    //   res.status(500).json({ error: 'Failed to create requirement' });
    // }




   
        //const newCurriculum = req.body;
        console.log(newCurriculum)
        const createdCurriculum = await curriculumSavedSchema(newCurriculum);
        createdCurriculum.save();   
        res.json({ data: createdCurriculum, message: 'Curriculum created successfully',status:200});
      } catch (error) {
        res.status(500).json({ error: 'Failed to create curriculum' });
      }
    });

    router.get('/curriculum/:id',async(req,res)=>{
      try {
        let id = req.params.id;
        let data = await curriculumSavedSchema.findById(id);
        res.set('Cache-Control', 'no-store');
        console.log(data)
        res.json({data:data,status:200}).status(200);
      } catch (error) {
        res.status(400).json({ message: "GET request CANNOT be completed" });       
      }
      }
    ) 
    
    router.put("/editdetails/:id",async (req,res)=>{                               
      try{
          let id = req.params.id;
          let updateData = {$set: req.body};

          const updated = await curriculumSavedSchema.findByIdAndUpdate(id,updateData);  
          console.log(updated)
          res.set('Cache-Control', 'no-store');                            
          res.json({message:"UPDATE Successful",status:200});                                                                          
      }catch(error){
          res.status(400).json("Cannot /UPDATE data");                            
          console.log(`Cannot POST data`);                               
      }
  })

  router.delete("/delete-curriculum/:id",async (req,res)=>{
    try {
        let id = req.params.id;
        console.log(id);  
        let data = await curriculumSavedSchema.findByIdAndRemove(id);
        res.set('Cache-Control', 'no-store');      
        res.json({data:data,status:200}).status(201);
    } catch (error) {
        res.status(400).json({ message: "DELETE request CANNOT be completed" });       
    }
})



router.post('/rform', upload.array('files'),async (req, res) => {
  try {

      console.log(req.body)


     const Files = req.files

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes:['https://www.googleapis.com/auth/drive']
      })

      const drive = google.drive({
        version:'v3',
        auth
      }) 
      const uploadFiles = []
      let webViewLink;
      let fileId;
       // const file = req.files
        for (const file of Files){
          console.log("File",file)
          console.log(file.originalname)
          console.log(file.mimetype)
          const response =  await drive.files.create({
            requestBody:{
              name:file.originalname,
              mimetype:file.mimetype,
              parents:['1td9NQOCq8DBbM6KUrNGJ98uYm16uJb5A']
            },
            media:{
              body:fs.createReadStream(file.path)
            }
          })
          fileId = response.data.id; 
          console.log(fileId)
          webViewLink = `https://drive.google.com/file/d/${fileId}/view`;
        }
        const {requirementName, trainingArea, institution, category, trainingHours, referenceLink } = req.body
        const newRequirement = new requirementSchema({
          requirementName:requirementName,
          trainingArea:trainingArea,
          institution:institution,
          category:category,
          trainingHours:trainingHours,
          referenceLink:webViewLink,
          referenceLinkID:fileId
        })

    const createdRequirement = await newRequirement.save()
    console.log(createdRequirement)
    res.status(201).json({ data: createdRequirement, message: 'Requirement created successfully'});
  } catch (error) {
    res.status(500).json({ error: 'Failed to create requirement' });
  }
});

// API to fetch all requirements
router.get('/rlist', async (req, res) => {
  try {
    const requirements = await requirementSchema.find();
    res.status(200).json(requirements);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requirements' });
  }
});

router.get('/requirement/:id',async(req,res)=>{
  try {
    let id = req.params.id;
    let data = await requirementSchema.findById(id);
    res.set('Cache-Control', 'no-store');
    console.log(data)
    res.json({data:data,status:200}).status(200);
  } catch (error) {
    res.status(400).json({ message: "GET request CANNOT be completed" });       
  }
  }
) 

// Add a new route for curriculum approval
router.put('/approve/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = { approvedStatus: true }; // Set the approvedStatus to 'Approved'
    const updatedCurriculum = await curriculumSavedSchema.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    console.log('Curriculum approved:', updatedCurriculum);
    res.json({ data: updatedCurriculum, message: 'Curriculum approved successfully' });
  } catch (error) {
    console.error('Error while approving curriculum:', error);
    res.status(500).json({ error: 'Failed to approve curriculum' });
  }
});
router.get('/pendingCurriculums', async (req, res) => {
  try {
    const pendingCurriculums = await curriculumSavedSchema.find({ approvedStatus: false });
    res.set('Cache-Control', 'no-store');
    res.status(200).json({ data: pendingCurriculums });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending curriculum approvals' });
  }
});
router.get('/my-curriculums/:user', async (req, res) => {
  try {
    const user = req.params.user;
    const myCurriculums = await curriculumSavedSchema.find({name : user });
    //res.set('Cache-Control', 'no-store');
    res.status(200).json({ data: myCurriculums });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending curriculum approvals' });
  }
});

//---------------------------------------------------------------------------------------------------------

// router.get('/login-faculty/:username',async (req,res)=>{
//   try {
//     console.log("here")
//     let username = req.params.username;
//     await createCollection(username);
//     res.json({status:200})
//   } catch (error) {
//     console.log(error)
//     res.json({status:400})
//   }
// })

router.post('/send-message-faculty', async (req, res) => {
  try {
    console.log(`Req: ${req.body}`)
    const { sender, content, requirementName, timestamp } = req.body;
    console.log(`Req: ${sender} ${content} ${requirementName} ${timestamp}`)
    const collectionName = sender; // The collection name will be the same as the sender's username
    console.log(`collection name: ${collectionName}`)
    const userChatModel = chats.model(collectionName, chatUsersSchema,collectionName);
    console.log(`Model: ${userChatModel}`)

    // Create a new document with the message data
    const newMessage = new userChatModel({
      sender,
      content,
      requirementName,
      timestamp
    });
    console.log(`New message ${newMessage}`)
    // Save the new document to the appropriate collection
    await newMessage.save();

    res.json({ message: 'Message saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

router.post('/send-message-admin', async (req, res) => {
  try {
    console.log(`Req: ${req.body}`)
    const { sender, content, recipient,requirementName, timestamp } = req.body;
    console.log(`Req: ${sender} ${content} ${recipient} ${requirementName} ${timestamp}`)
    const newCollection = recipient; // The collection name will be the same as the sender's username
    console.log(`collection name: ${newCollection}`)
    const adminChatModel = admin.model(newCollection, chatAdminSchema,newCollection);
    console.log(`Model: ${adminChatModel}`)

    // Create a new document with the message data
    const newMessage = new adminChatModel({
      sender,
      content,
      recipient,
      requirementName,
      timestamp
    });
   console.log(`New message ${newMessage}`)
    // Save the new document to the appropriate collection
    await newMessage.save();

    res.json({ message: 'Message saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});


// Usage in your route handler
router.get('/messages-all', async (req, res) => {
  const facultyName = req.query.facultyname;
  const requirementName = req.query.requirementName;
  console.log(facultyName)

  try {
    if(facultyName){
      const messages = await findCollectionWithFacultyNameChatDB(facultyName,requirementName);
      console.log(`Messages are:`)
      console.log(messages)
      res.json({status:200,messages:messages})
    }
    else{
      res.json({messages:"Facultyname not valid"})
    }
  } catch (error) {
    res.status(500).json({status:400,messages:"error"});
  }
});

router.get('/messages-all-admin', async (req, res) => {
  const facultyName = req.query.facultyname;
  const requirementName = req.query.requirementName;
  console.log(facultyName)

  try {
    if(facultyName){
      const messages = await findCollectionWithFacultyNameAdminDB(facultyName,requirementName);
      console.log(`Messages are:`)
      console.log(messages)
      res.json({status:200,messages:messages})
    }
    else{
      res.json({messages:"Facultyname not valid"})
    }
  } catch (error) {
    res.status(500).json({status:400,messages:"error"});
  }
});


//---------------------------------------------------------------------------------------------------------

module.exports = router;