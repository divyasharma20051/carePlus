const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Appointment = require('../../models/appointment');
const Package = require('../../models/packages');
const Enquiry = require('../../models/Enquiry');
const sendEmail = require('../../utils/sendEmail');
const { publicUser, asyncHandler, escapeRegex } = require('../../utils/controllerHelpers');

exports.deleteUser = asyncHandler(async(req,res)=>
    {if(String(req.params.id)===String(req.session.user._id))
        return res.status(400).json({message:'You cannot delete your own admin account.'});
        const u=await User.findById(req.params.id);
        if(!u)return res.status(404).json({message:'User not found.'});
        if(u.role==='admin')return res.status(403).json({message:'Admin accounts cannot be deleted from this screen.'});
        await User.findByIdAndDelete(req.params.id);res.json({message:'User deleted.'});});
