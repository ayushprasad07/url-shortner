import mongoose,{Schema,Document} from "mongoose";

export interface IURL extends Document{
    _id:string;
    stdId:string;
    originalUrl:string;
}

const urlSchema = new Schema<IURL>({
    stdId: {type:String},
    originalUrl :{type : String, required:true}
},{timestamps:true})

const URL = mongoose.models.URL || mongoose.model("URL", urlSchema); 

export default URL;