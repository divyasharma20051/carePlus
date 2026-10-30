require('dotenv').config();
console.log('EMAIL_USER loaded:', Boolean(process.env.EMAIL_USER));
console.log('EMAIL_PASS loaded:', Boolean(process.env.EMAIL_PASS));
const express=require('express'); const path=require('path'); const session=require('express-session'); const cors=require('cors'); const helmet=require('helmet'); const morgan=require('morgan');
const connectDB=require('./config/db');
const app=express();
app.disable('x-powered-by');
app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'},contentSecurityPolicy:false}));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}));

app.use(express.json({limit:'1mb'})); app.use(express.urlencoded({extended:true,limit:'1mb'})); app.use(morgan('dev'));
app.use('/images',express.static(path.join(__dirname,'public/images')));
app.use(session({name:'careplus.sid',secret:process.env.SESSION_SECRET||'dev-only-change-this-secret',resave:false,saveUninitialized:false,rolling:true,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:1000*60*60*12}}));
app.use('/api',require('./routes/index'));
app.use((req,res)=>res.status(404).json({message:'API route not found.'}));
app.use((err,req,res,next)=>{console.error(err);if(err.code===11000)return res.status(409).json({message:'This record already exists.'});if(err.name==='ValidationError')return res.status(400).json({message:err.message});res.status(500).json({message:process.env.NODE_ENV==='production'?'An unexpected server error occurred.':err.message||'Internal server error.'});});
const port=process.env.PORT||5000;
connectDB().then(()=>app.listen(port,()=>console.log(`CarePlus API listening on http://localhost:${port}`))).catch(err=>{console.error('MongoDB connection failed:',err.message);process.exit(1);});
