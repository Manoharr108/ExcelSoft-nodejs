const eoperation = require("../models/emplyoee");
const aoperation = require("../models/achiever");
const quicklinks = require("../models/quicklinks")
const {sendMassEmails } = require('./emailservice')
exports.AddEmplyoee =async(req, res)=>{
    let {empid, name, category, quarter,mail, remarks, role, photo, epublic}= req.body;
    try{
        // let emp = await eoperation.findOne({empid});
        // if (!emp) {
        //     return res.status(404).json({ message: 'Employee not found in database' });
        // }
        const duplicateEntry = await aoperation.findOne({ empid, category, quarter });
        if (duplicateEntry) {
            return res.status(409).json({ message: 'Employee already exists in the achievers list for this category and quarter.' });
        }
        const newEmp = new aoperation({
            empid: empid,
            name: name,
            photo: photo,
            role: role,
            mail:mail,
            remarks: remarks,
            category: category,
            quarter: quarter, 
            epublic: epublic
        });

        await newEmp.save();

        return res.status(201).json({ message: 'Employee added to achievers list', newEmp });
    }
    catch(err){
        return res.status(500).json({message:err.message});
    }
}

exports.AddTab =async(req, res)=>{
    let { category, quarter, epublic}= req.body;
    try{
        const newtab = new aoperation({
            category:category,
            quarter: quarter,
            epublic
        });
        await newtab.save();
        return res.status(201).json({ message: 'Tab added to achivevers list', newtab });
    }
    catch(err){
        return res.status(500).json({message:err.message});
    }
}

exports.EmplyoeeWithId =async(req, res)=>{
    let {empid} = req.params;
    try{
        let newemp = await eoperation.find({empid:empid});
        if(newemp.length>0){
            return res.status(201).json(newemp);
        }
        else{
            return res.status(404).json({message:"Employee not found"})
        }
    }
    catch(err){
        return res.status(500).json({message:err.message});
    }
}

exports.DeleteEmplyoee = async(req, res)=>{
    let {empid, category, quarter} = req.params;
    try {
        let emp = await aoperation.findOneAndDelete({
            empid:empid,
            category:category,
            quarter:quarter
        });
        if(emp){
            return res.status(200).json({message:"Successfully deleted from the particlular tab!!"})
        }
        else{
            return res.status(404).json({message:"Employee not found"})
        }
    } catch (error) {
        return res.status(500).json({message:"Error, something went wrong!"})
    }
}

exports.ModifyEmployee = async (req, res) => {
    let { empid, category, quarter } = req.params;
    let { name, photo, role, remarks, mail } = req.body;
  
    try {
      let emp = await aoperation.findOneAndUpdate(
        {
          empid: empid,
          category: category,
          quarter: quarter,
        },
        {
          $set: {
            name: name,  
            photo: photo, 
            role: role,  
            remarks: remarks, 
            mail:mail
          },
        },
        { new: true } 
      );
  
      if (!emp) {
        return res.status(404).json({ message: "Employee not found" });
      }
  
      return res.status(200).json({ message: "Successfully updated user!", emp });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  

exports.Employee = async(req,res)=>{
    let {category, quarter} = req.params;
    try{
        let emp = await aoperation.find({
            category:category,
            quarter:quarter
        });
        return res.status(200).json(emp);
    }
    catch(err){
        return res.status(500).json({message:"something went wrong!!"})
    }
};

exports.manageTab = async(req,res)=>{
    let {category, quarter} = req.params;
    try{
        let emp = await aoperation.find({
            category:category,
            quarter:quarter
        });
        return res.status(200).json(emp);
    }
    catch(err){
        return res.status(500).json({message:"something went wrong!!"})
    }
};

exports.AllEmployee = async(req,res)=>{
    try {
        let emp = await eoperation.find({});
        return res.status(200).json({emp})
    } catch (error) {
        return res.status(500).json({message:"something went wrong!"})
    }
}

exports.AllAchieversEmployee = async(req,res)=>{
    try {
        let emp = await aoperation.find({});
        return res.status(200).json({emp})
    } catch (error) {
        return res.status(500).json({message:"something went wrong!"})
    }
}

exports.FindAnEmplyoee = async(req,res)=>{
    let {empid, category, quarter} = req.params;
    try {
        let emp = await aoperation.findOne({empid, category, quarter});
        if(emp){
            return res.status(200).json(emp)
        }
        else{
            return res.status(404).json({message:"Employee not found"})
        }
    } catch (error) {
        return res.status(500).json({message:"something went wrong!"})
    }
}

exports.DeleteTab = async(req,res)=>{
    let {category, quarter} = req.params;
    try {
       let emp =  await aoperation.deleteMany({
        category:category,
        quarter:quarter
    })
    .then(()=>{
               return res.status(200).json({message:"Successfully removed the whole " +category +" tab"})
    })
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}


exports.publishquarter = async (req, res) => {
  try {
    const { activeQuarter } = req.params;
    const { hrMessage } = req.body;

    // 1. Publish employees
    const result = await aoperation.updateMany(
      { quarter: activeQuarter },
      { $set: { epublic: true } }
    );

    // 2. Publish quick links (Make all epublic: true)
    await quicklinks.updateMany({}, { $set: { "links.$[].epublic": true } });

    // 3. Fetch published employees (Only those with valid emails and names)
    const publishedEmployees = await aoperation.find({
      quarter: activeQuarter,
      epublic: true,
      name: { $exists: true, $ne: "" },
      mail: { $exists: true, $ne: "" },
      category: { $exists: true, $ne: "" }
    }).select('name mail category empid');

    if (publishedEmployees.length === 0) {
      return res.status(200).json({
        message: `Successfully published employees for quarter ${activeQuarter} and quick links, but no employees found for email notification.`
      });
    }

    // 4. Send emails in background
    setTimeout(async () => {
      try {
        console.log(`Starting email notification process for ${publishedEmployees.length} employees`);
        const emailResults = await sendMassEmails(publishedEmployees, activeQuarter, hrMessage) ;
        console.log('Email notification results:', emailResults);
      } catch (emailError) {
        console.error('Error in email notification process:', emailError);
      }
    }, 100);

    // 5. Final response
    return res.status(200).json({
      message: `Successfully published ${result.modifiedCount} employees for quarter ${activeQuarter} and all quick links. Email notifications are being sent.`,
      publishedCount: result.modifiedCount,
      emailsToSend: publishedEmployees.length
    });

  } catch (error) {
    console.error('Error in publishquarter:', error);
    return res.status(500).json({ 
      message: 'Server error while publishing employees and quick links.', 
      error: error.message 
    });
  }
};



exports.AllEmployeeWithQuarter = async (req, res) => {
    const { quarter } = req.params;
    
    try {
        const employees = await aoperation.find({ quarter: quarter });
        
        if (!employees || employees.length === 0) {
            return res.status(404).json({ message: "No employees found for this quarter." });
        }

        res.status(200).json(employees);
    } catch (error) {
        console.error("Error fetching employees by quarter:", error);
        res.status(500).json({ message: "Internal server error." });
  }
};

