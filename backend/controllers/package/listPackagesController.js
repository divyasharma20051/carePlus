const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Appointment = require('../../models/appointment');
const Package = require('../../models/packages');
const Enquiry = require('../../models/Enquiry');
const sendEmail = require('../../utils/sendEmail');
const { publicUser, asyncHandler, escapeRegex } = require('../../utils/controllerHelpers');

exports.listPackages = asyncHandler(async(req,res)=>{
  const filter={}; if(req.query.category)filter.category=new RegExp('^'+escapeRegex(req.query.category)+'$','i'); if(req.query.gender && req.query.gender!=='all')filter.gender=new RegExp('^'+escapeRegex(req.query.gender)+'$','i'); if(req.query.search)filter.packageName=new RegExp(escapeRegex(req.query.search),'i');
  const packages=await Package.find(filter).sort({packageName:1});res.json({packages});
});
