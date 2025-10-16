import mongoose from "mongoose";

type ConnectionObject = {
    isConnected:number;
}

const connection:ConnectionObject = {
    isConnected:0
}

 async function dbConnect():Promise<void>{
    if(connection.isConnected){
        console.log("Already connected to db");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI!,{})

        connection.isConnected = db.connections[0].readyState;

        console.log("Successfully connected to the database.");
    } catch (error) {
        console.log("Error while connecting to databse : ", error);
        process.exit(1);
    }

}

export default dbConnect;