"use client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const submitHandler = async (data: any) => {
    const res = await axios.post("http://localhost:8080/signup", data);
    if (res.status === 200) {
      console.log("User created successfully");
      router.push("/login");
    } else {
      setError(res.data.message);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submitHandler)}>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">Full Name</Label>
              <Input
                id="name"
                placeholder="Max"
                required
                {...register("name")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                {...register("email")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
            </div>
            <Button type="submit" className="w-full">
              Create an account
            </Button>
          </div>
          {error && (
            <div className="bg-red-100 text-red-600 mt-3 p-2 rounded-md">
              {error}
            </div>
          )}
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
