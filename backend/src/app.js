import express from 'express'
import userRouter from './routers/user.route.js'
const app = express()

app.use(express.urlencoded({extended:true}))
app.use(express.json());


//routes:
app.use("/users/api",userRouter)

export default app;