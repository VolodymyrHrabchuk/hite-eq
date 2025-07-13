"use client";

import Image from "next/image";
import Logo from "../../../public/mainLogo.svg";
import { useRouter } from "next/navigation";
import { ROUTES } from "../routes";
import { useState } from "react"; // Import useState

const Dashboard = () => {
  const router = useRouter();

  // State variables for YOUR ORIGINAL form inputs
  const [name, setName] = useState(""); // Corresponds to your "Name" input
  const [schoolName, setSchoolName] = useState(""); // Corresponds to your "School Name" input
  const [emailInput, setEmailInput] = useState(""); // Corresponds to your "Email" input (originally id="phone")
  const [phoneNumberInput, setPhoneNumberInput] = useState(""); // Corresponds to your "Phone Number" input (originally id="message")

  const [loading, setLoading] = useState(false); // New loading state
  const [error, setError] = useState<string | null>(null); // New error state

  // IMPORTANT: Replace with a valid team ID from your backend.
  // You can get this by making a GET request to https://dashboard-athena.space/api/teams/
  const DEFAULT_TEAM_ID = 1; // <--- REPLACE THIS WITH A REAL TEAM ID!

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    setLoading(true);
    setError(null); // Clear previous errors

    try {
      // Map your form fields to the API's expected field names
      const payload = {
        email: emailInput, // Your "Email" input (originally phone ID) maps to API's 'email'
        first_name: name, // Your "Name" input maps to API's 'first_name'
        last_name: schoolName, // Your "School Name" input maps to API's 'last_name'
        phone_number: phoneNumberInput, // Your "Phone Number" input (originally message ID) maps to API's 'phone_number'
        team: DEFAULT_TEAM_ID, // Use the default/configured team ID
      };

      const response = await fetch(
        "https://dashboard-athena.space/api/users/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json(); // Always try to parse JSON for detailed errors

      if (!response.ok) {
        // If response.ok is false (e.g., 400 Bad Request)
        console.error(
          "User signup failed. Status:",
          response.status,
          "Details:",
          responseData
        );
        // Display specific error messages from the API to the user
        if (responseData && typeof responseData === "object") {
          const errorMessages = Object.keys(responseData)
            .map(
              (key) =>
                `${key}: ${
                  Array.isArray(responseData[key])
                    ? responseData[key].join(", ")
                    : responseData[key]
                }`
            )
            .join("; ");
          setError(`Signup failed: ${errorMessages}`);
        } else {
          setError(`Signup failed with status: ${response.status}`);
        }
        return; // Stop execution if signup failed
      }

      // Store the new user's ID in localStorage
      if (typeof window !== "undefined" && responseData.id) {
        localStorage.setItem("userId", responseData.id.toString());
        console.log("User ID stored in localStorage:", responseData.id);
      } else if (typeof window === "undefined") {
        console.warn(
          "localStorage not available (server-side render). Cannot store userId."
        );
      } else {
        console.warn(
          "User ID not found in API response, cannot store in localStorage."
        );
      }

      // Navigate to the assessments page
      router.push(ROUTES.Assessments);
    } catch (err) {
      console.error("Network or unexpected error during signup:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='absolute inset-0 flex flex-col items-center text-white mt-30'>
      <Image width={192} height={48} src={Logo} alt='Logo' quality={100} />

      {/* Title */}
      <div>
        <h1 className='text-[32px] text-center mt-18 mb-10 font-bold'>
          Hello! Let's get acquainted
        </h1>

        <form className='space-y-8' onSubmit={handleSignup}>
          <div>
            <label htmlFor='name' className='block text-sm mb-2'>
              Name
            </label>
            <input
              type='text'
              id='name'
              placeholder='Enter your name'
              value={name} // Bind to 'name' state
              onChange={(e) => setName(e.target.value)} // Update 'name' state
              className='w-[480px] px-6 py-[17.5px] rounded-full bg-transparent border border-white text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white'
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "30px",
              }}
            />
          </div>

          <div>
            <label htmlFor='school name' className='block text-sm mb-2'>
              School Name
            </label>
            <input
              type='text' // 'name' type is not standard for text fields; 'text' is better
              id='school name' // Keep your original ID
              placeholder='Enter your school name'
              value={schoolName} // Bind to 'schoolName' state
              onChange={(e) => setSchoolName(e.target.value)} // Update 'schoolName' state
              className='w-[480px] px-6 py-[17.5px] rounded-full bg-transparent border border-white text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white'
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "30px",
              }}
            />
          </div>

          <div>
            <label htmlFor='phone' className='block text-sm mb-2'>
              Email
            </label>
            <input
              type='email' // Changed to 'email' type for proper email input
              id='phone' // Keep your original ID 'phone' for the email input
              placeholder='Enter your email'
              value={emailInput} // Bind to 'emailInput' state
              onChange={(e) => setEmailInput(e.target.value)} // Update 'emailInput' state
              className='w-[480px] px-6 py-[17.5px] rounded-full bg-transparent border border-white text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white'
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "30px",
              }}
            />
          </div>

          <div>
            <label htmlFor='message' className='block text-sm mb-2'>
              Phone Number
            </label>
            <input
              type='tel'
              id='message'
              placeholder='+123456789'
              value={phoneNumberInput}
              onChange={(e) => {
                const value = e.target.value;
                if (!value.startsWith("+")) {
                  setPhoneNumberInput("+" + value.replace(/[^\d]/g, ""));
                } else {
                  setPhoneNumberInput(
                    "+" + value.slice(1).replace(/[^\d]/g, "")
                  );
                }
              }}
              className='w-[480px] px-6 py-[17.5px] rounded-full bg-transparent border border-white text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white'
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "30px",
              }}
            />
          </div>

          {error && <p className='text-red-500 text-sm text-center'>{error}</p>}

          <div className='mt-6'>
            <button
              type='submit' // Ensure this is type="submit" to trigger handleSignup
              className='w-[480px] py-[17.5px] rounded-full bg-white text-black font-medium text-lg'
              disabled={loading} // Disable button while loading
            >
              {loading ? "Signing up..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
