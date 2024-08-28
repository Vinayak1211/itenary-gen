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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const submitHandler = async (data: any) => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`, data);
    if (res.status === 200) {
      console.log("User logged in successfully");
      localStorage.setItem("access_token", res.data.token);
      router.push("/");
    } else {
      setError(res.data.message);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submitHandler)}>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
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
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                {...register("password")}
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
          {error && (
            <div className="bg-red-100 text-red-600 mt-3 p-2 rounded-md">
              {error}
            </div>
          )}
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
