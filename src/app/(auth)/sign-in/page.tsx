"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { Loader } from "lucide-react"

const SignIn = () => {

    const [credentials, setCredentials] = useState({identifier:"", password: ""});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    }


  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const response = await signIn("credentials",{
            redirect: false,
            identifier : credentials.identifier,
            password : credentials.password
        });

        if(response?.error){
            toast.error(response.error);
        }else{
            toast.success("Login successful");
        }

        if(response?.url){
            router.replace("/dashboard");
        }
    } catch (error) {
        console.log("Error while submitting form",error);
        toast.error("Error while submitting form");
    }finally{
        setIsSubmitting(false)
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center p-2">
        <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
            <h2 className="text-2xl font-semibold text-center font-bold text-neutral-800 dark:text-neutral-200">
                Welcome to Linkxs
            </h2>
            <p className="mt-2 text-center max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
                Login to Linkxs
            </p>
        
            <form className="my-8" onSubmit={handleSubmit}>
                <LabelInputContainer className="mb-4">
                <Label htmlFor="identifier">Email/Username</Label>
                <Input id="identifier" name="identifier" placeholder="Email/Username" type="text" onChange={handleChange}/>
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" placeholder="••••••••" type="password" onChange={handleChange} />
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
                Sign in &rarr;
            </div>)}
                <BottomGradient />
                </button>
        
                <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
        
                <div className="flex flex-col space-y-4 text-center">
                Don't have an account?<Link className="text-sm text-blue-700 underline dark:text-neutral-200" href="/sign-up">Sign up</Link>
                </div>
            </form>
        </div>
    </div>
  )
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

export default SignIn
