"use client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import Itenary from "@/components/itenary";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler, set } from "react-hook-form";
import Image from "next/image";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@radix-ui/react-toast";
import { useRouter } from "next/navigation";

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [vactionType, setVactionType] = useState<string | null>(null);
  const [travelType, setTravelType] = useState<string | null>(null);
  const [iternary, setIternary] = useState<any>(null);
  const [showItenary, setShowItenary] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();

  const submitHandler = async (data: any) => {
    console.log(data);
    setShowItenary(true);
    setLoading(true);
    data.location = vactionType;
    data.travel_with = travelType;

    const token = localStorage.getItem("access_token");

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const itenaryData = res.data;
      setLoading(false);
      setIternary(itenaryData);
    } catch (err) {
      toast({
        title: "Login Required",
        description: "Please login to continue",
        action: (
          <ToastAction
            altText="Login Now"
            onClick={() => {
              router.push("/login");
            }}
          >
            Login
          </ToastAction>
        ),
      });
    }
  };

  const surpriseHandler = async () => {
    setShowItenary(true);
    setLoading(true);

    // Get access_token from localstorage
    const token = localStorage.getItem("access_token");

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/suprise`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(false);
      setIternary(res.data);
    } catch (err) {
      toast({
        title: "Login Required",
        description: "Please login to continue",
        action: (
          <ToastAction
            altText="Login Now"
            onClick={() => {
              router.push("/login");
            }}
          >
            Login
          </ToastAction>
        ),
      });
    }
  };

  const fetchCountries = async () => {
    const res = await fetch("https://restcountries.com/v3.1/all");
    const data = await res.json();
    setCountries(data);
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-4">
      <div className="w-auto h-auto max-w-2xl p-4 flex justify-center">
        <Image
          src="/splash2.svg"
          alt="logo"
          className="object-cover"
          height={500}
          width={500}
          priority
        />
      </div>
      <div className="w-full max-w-2xl p-4 bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-3xl font-bold">
          Personalised Travel Recommendation and Planner
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit(submitHandler)}>
          <div className="space-y-2">
            <Label htmlFor="vacation-type">Where do you wanna travel?</Label>
            <p className=" text-xs text-gray-400 m-0">
              leave empty for a surprise
            </p>
            <Select onValueChange={(value) => setVactionType(value)}>
              <SelectTrigger id="location">
                <SelectValue placeholder="Choose an option" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem
                    value={country.name.common}
                    key={country.name.common}
                  >
                    {country.name.common}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                type="range"
                id="duration"
                min="1"
                max="8"
                defaultValue="1"
                {...register("duration")}
              />
              <div className="flex justify-between text-sm">
                <span>1</span>
                <span>8</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="budget">Budget (INR)</Label>
              <Input
                type="range"
                id="budget"
                min="500"
                max="150000"
                step={500}
                defaultValue="500"
                {...register("budget")}
              />
              <div className="flex justify-between text-sm">
                <span>1000</span>
                <span>200000</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="travel-with">Who are you travelling with?</Label>
            <Select
              onValueChange={(value) => setTravelType(value)}
              required
              defaultValue="solo"
            >
              <SelectTrigger id="travel-with">
                <SelectValue placeholder="Family" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="solo">Solo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority?</Label>
            <RadioGroup
              defaultValue="Explore as much as possible"
              {...register("priority")}
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Explore as much as possible" id="yes" />
                <Label htmlFor="yes">Explore as much as possible</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Relax and take in the beauty" id="no" />
                <Label htmlFor="no">Relax and take in the beauty</Label>
              </div>
            </RadioGroup>
          </div>
          <Button className="w-full" type="submit">
            Generate
          </Button>
          <Button className="w-full" type="button" onClick={surpriseHandler}>
            Surprise Me
          </Button>
        </form>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="w-full">
          {iternary && <Itenary itenaryData={iternary} />}
        </div>
      )}
    </div>
  );
}
