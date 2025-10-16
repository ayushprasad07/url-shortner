import mongoose,{Schema} from "mongoose";

export interface IUser{
    _id:string,
    username:string,
    email:string,
    password:string
}

const userSchema = new Schema<IUser>({
    username:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true}
},{timestamps:true})

const User = mongoose.models.User || mongoose.model("User", userSchema); 

export default User;