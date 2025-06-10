"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/stores/useAuthStore";
import FetchTokenButton from "@/app/FetchTokenButton";

const Debug = () => {
  const [supabaseStatus, setSupabaseStatus] = useState<string>("Checking...");
  const [dbConnectionStatus, setDbConnectionStatus] =
    useState<string>("Checking...");
  const { user, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const supabase = createClient();

        // Test basic connection
        const { error } = await supabase
          .from("profiles")
          .select("count")
          .limit(1);

        if (error) {
          setSupabaseStatus(`Error: ${error.message}`);
          setDbConnectionStatus(`Error: ${error.message}`);
        } else {
          setSupabaseStatus("✅ Connected");
          setDbConnectionStatus("✅ Database accessible");
        }
      } catch (error) {
        setSupabaseStatus(`❌ Connection failed: ${error}`);
        setDbConnectionStatus(`❌ Database inaccessible: ${error}`);
      }
    };

    checkSupabase();

    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const testAuthFlow = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("Current session:", session);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Debug Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Supabase Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Supabase Status</h2>
          <div className="space-y-2">
            <p>
              <strong>Connection:</strong> {supabaseStatus}
            </p>
            <p>
              <strong>Database:</strong> {dbConnectionStatus}
            </p>
            <p>
              <strong>URL:</strong>{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}
            </p>
            <p>
              <strong>Anon Key:</strong>{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                ? "✅ Set"
                : "❌ Missing"}
            </p>
          </div>
        </div>

        {/* Auth Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p>
              <strong>Initialized:</strong> {isInitialized ? "✅ Yes" : "❌ No"}
            </p>
            <p>
              <strong>User:</strong>{" "}
              {user ? "✅ Logged in" : "❌ Not logged in"}
            </p>
            {user && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <p>
                  <strong>ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Username:</strong>{" "}
                  {user.profile?.username || "Not set"}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={testAuthFlow}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Auth Flow
          </button>
        </div>

        {/* Token Management */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Token Management</h2>
          <FetchTokenButton />
        </div>

        {/* Environment Check */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Environment</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
            </p>
            <p>
              <strong>Next.js Version:</strong> 14.2.8
            </p>
            <p>
              <strong>App Router:</strong> ✅ Enabled
            </p>
            <p>
              <strong>TypeScript:</strong> ✅ Enabled
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => (window.location.href = "/profile")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Go to Profile
          </button>
          <button
            onClick={() => (window.location.href = "/signin")}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Sign In
          </button>
          <button
            onClick={() => (window.location.href = "/admin/badges")}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Admin Panel
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default Debug;
