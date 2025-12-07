import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js';
import { clerkWebhooks } from './controllers/webhooks.js'; 
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinay from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';

const app = express()



await connectDB()
await connectCloudinay();



app.use(cors())
app.use(clerkMiddleware())



app.get('/', (req,res)=>{res.send("Api Working")})

app.use('/clerk', express.raw({ type: 'application/json' }));
app.post('/clerk', clerkWebhooks);

app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);





const PORT = process.env.PORT || 5000

app.listen(PORT, ()=> {
    console.log(`Server is running on ${PORT}`)
    
})