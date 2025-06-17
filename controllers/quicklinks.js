const { resolveContent } = require("nodemailer/lib/shared")
const quicklinks = require("../models/quicklinks")


exports.GetAllQuickLinks=async(req,res)=>{
    let links
    try{
        links = await quicklinks.find()
        return res.status(200).json(links)
    }
    catch(err){
        return res.status(500).json({message:"Something went wrong! : "+err.message})
    }
}

exports.AddGroupLinks=async(req,res)=>{
    let {category, links} = req.body
    try{
        let group = new quicklinks({
            category,
            links
        })
        await group.save()
        return res.status(201).json({message:"New group added", group})
    }
    catch(err){
        return res.status(500).json({message:"Something went wrong!", err})
    }
}

exports.deleteGroup=async(req,res)=>{
    let {category} = req.body
    try{
        let group = await quicklinks.findOneAndDelete({category:category})
        if(group){
            return res.status(200).json({message:"Successfully deleted group of links!"})
        }
        else{
            return res.status(404).json({message:"Group deletion failed!"})
        }
    }
    catch(err){
        return res.status(500).json(err.message)
    }
}

exports.addLinkToGroup = async (req, res) => {
    let { category, name, url } = req.body;

    try {
        // Find the group by category
        let group = await quicklinks.findOne({ category });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        group.links.push({ name, url });
        await group.save();

        return res.status(200).json({ message: "Link added to group", group });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong!", error: error.message });
    }
}

exports.deleteLink = async (req, res) => {
    let { category, name } = req.body;

    try {
        let group = await quicklinks.findOne({ category });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        let initialLength = group.links.length;
        group.links = group.links.filter(link => link.name !== name);

        if (group.links.length === initialLength) {
            return res.status(404).json({ message: "Link not found in the group" });
        }

        await group.save();

        return res.status(200).json({ message: "Successfully deleted the link!", group });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong: " + error.message });
    }
}

exports.EditLink=async(req,res)=>{
    let {category, name, url} = req.body

    try {
         let group = await quicklinks.findOne({ category });

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Find the specific link by name
        let link = group.links.find(link => link.name === name);

        if (!link) {
            return res.status(404).json({ message: "Link not found in the group" });
        }
        
        link.url = url;
        link.epublic = false;

        await group.save();

        return res.status(200).json({ message: "Link updated successfully!", group });
    } catch (error) {
         return res.status(500).json({ message: "Something went wrong: " + error.message });
    }
}