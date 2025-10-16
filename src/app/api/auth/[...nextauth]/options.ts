import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"


export const authOptions : NextAuthOptions = {
    providers : [
        CredentialsProvider({
            id : "credentials",
            name : "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },

            async authorize(credentials : any) : Promise<any> {
                await dbConnect();
                
                try {
                    const user = await User.findOne({
                        $or : [
                            {email : credentials.identifier},
                            {username : credentials.identifier}
                        ]
                    })

                    if(!user){
                        throw new Error("User not found");
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password,user.password);

                    if(!isPasswordValid){
                        throw new Error("Invalid password");
                    }else{
                        return user;
                    }
                } catch (error) {
                    console.log("Error while logging in",error);
                    throw new Error("Error while logging in");
                }
            }
        })
    ],
    callbacks:{
        async session({ session, token }) {

            if(token){
                session.user._id = token._id?.toString();
                session.user.email = token.email;
                session.user.username = token.username;
            }
            return session
        },

        async jwt({ token, user }) {

            if(user){
                token.username = user.username;
                token.email = user.email;
                token._id = user._id?.toString();
            }
            return token
        }
    },
    pages : {
        signIn : "/sign-in"  
    },
    session:{
        strategy : "jwt"
    },
    secret : process.env.NEXTAUTH_SECRET
}