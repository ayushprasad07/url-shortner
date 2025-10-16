"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import  { Loader } from "lucide-react"
import {useDebounceCallback} from "usehooks-ts"

export default function SignupForm() {
    const [credentials, setCredentials] = useState({username:"", email: "", password: ""});
    const [username, setUsername] = useState(credentials.username);
    const [usernameMessage, setUsernameMessage] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const debounce = useDebounceCallback(setUsername, 300);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.name === "username"){
            debounce(e.target.value);
        }
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
      };
    
  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const {username, email, password} = credentials;
        const response = await axios.post("/api/sign-up",{
            username,
            email,
            password
        });
        toast.success(response.data.message);
        router.replace(`/sign-in`);
    } catch (error) {
        console.log("Error while submitting form",error);
        toast.error("Error while submitting form");
    }finally{
        setIsSubmitting(false)
    }
    console.log("Form submitted");
  };

  useEffect(()=>{
    const username = credentials.username;
    const checkUsernameUnique = async()=>{
      if (!username || username.length < 2 || /[^a-zA-Z0-9_]/.test(username)) {
        setUsernameMessage('');
        return;
      }
      setIsCheckingUsername(true);
      setUsernameMessage('');
      try {
        const response = await axios.get(`/api/check-username-unique?username=${username}`)
        setUsernameMessage(response.data.message)
      } catch (error) {
        setUsernameMessage( error instanceof Error ? error.message : "Error while checking username");
      }finally{
        setIsCheckingUsername(false);
      }
    }
    checkUsernameUnique();
  },[username])


  return (
    <div className="p-2 flex justify-center items-center min-h-screen">
        <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black overflow-hidden">
        <h2 className="text-2xl text-center font-bold text-neutral-800 dark:text-neutral-200">
            Welcome to Linkxs
        </h2>
        <p className="mt-2 max-w-sm text-center text-sm text-neutral-600 dark:text-neutral-300">
            Login to Linkxs to continue
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
            <LabelInputContainer className="mb-4">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" placeholder="xyz" type="text" onChange={onChange}/>
            </LabelInputContainer>
            {isCheckingUsername && <Loader className="mr-2 h-4 w-4 animate-spin"/>}
            <p className={`text-sm ${usernameMessage==="Username is available" ? "text-green-500" : "text-red-500"} mb-2`}>{usernameMessage}</p>
            <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" placeholder="xyz@google.com" type="email" onChange={onChange}/>
            </LabelInputContainer>
            <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" placeholder="••••••••" type="password" onChange={onChange} />
            </LabelInputContainer>

            <button
            className="group/btn relative flex items-center justify-center block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            type="submit"
            >
            {isSubmitting ? (
                <>
                    <Loader className="mr-2 h-4 w-4 animate-spin"/>Please Wait
                </>
            ) : (<div>
                Sign up &rarr;
            </div>)}
            <BottomGradient />
            </button>

            <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

            <div className="flex flex-col space-y-4 text-center">
            Already have an account? <Link className="text-blue-500" href="/sign-in">Sign In</Link>
            </div>
        </form>
        </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
