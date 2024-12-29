const eoperation = require("../models/emplyoee");
const aoperation = require("../models/achiever");

exports.AddEmplyoee =async(req, res)=>{
    let {empid, name, category, quarter, remarks, role, photo}= req.body;
    try{
        let emp = await eoperation.findOne({empid});
        if (!emp) {
            return res.status(404).json({ message: 'Employee not found in database' });
        }
        const duplicateEntry = await aoperation.findOne({ empid, category, quarter });
        if (duplicateEntry) {
            return res.status(409).json({ message: 'Employee already exists in the achievers list for this category and quarter.' });
        }
        const newEmp = new aoperation({
            empid: empid,
            name: name,
            photo: photo,
            role: role,
            remarks: remarks,
            category: category,
            quarter: quarter

        });

        await newEmp.save();

        return res.status(201).json({ message: 'Employee added to achievers list', newEmp });
    }
    catch(err){
        return res.status(500).json({message:err.message});
    }
}

exports.AddTab =async(req, res)=>{
    let { category, quarter}= req.body;
    try{
        const newtab = new aoperation({
            category:category,
            quarter: quarter
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
    let { name, photo, role, remarks } = req.body;
  
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