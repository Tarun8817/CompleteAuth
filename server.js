import app from './src/app.js';
import connectDB from './src/config/database.js';

connectDB()

app.listen(3001,()=>{
    console.log('Server is running on port 3001');
})

