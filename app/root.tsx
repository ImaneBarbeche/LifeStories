// import {
//   isRouteErrorResponse,
//   Links,
//   Meta,
//   Outlet,
//   Scripts,
//   ScrollRestoration,
// } from "react-router";
// import React from "react";
// import { createRoot } from 'react-dom/client'

// import type { Route } from "./+types/root";
// import "./app.css";

// import { Capacitor } from "@capacitor/core";
// import { JeepSqlite } from 'jeep-sqlite/dist/components/jeep-sqlite'
// import { defineCustomElements as pwaElements} from '@ionic/pwa-elements/loader';

//  pwaElements(window);
//  customElements.define('jeep-sqlite', JeepSqlite);
//  const platform = Capacitor.getPlatform();

//  const rootRender = () => {
//      const container = document.getElementById('root');
//      const root = createRoot(container!);
//      root.render(
//          <React.StrictMode>
//          <App />
//          </React.StrictMode>
//      );
//  }

// export const links: Route.LinksFunction = () => [
//   { rel: "preconnect", href: "https://fonts.googleapis.com" },
//   {
//     rel: "preconnect",
//     href: "https://fonts.gstatic.com",
//     crossOrigin: "anonymous",
//   },
//   {
//     rel: "stylesheet",
//     href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
//   },
// ];

// export function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <head>
//         <meta charSet="utf-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <Meta />
//         <Links />
//       </head>
//       <body>
//         {children}
//         <ScrollRestoration />
//         <Scripts />
//       </body>
//     </html>
//   );
// }

// export default function App() {
//   return <Outlet />;
// }

// export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
//   let message = "Oops!";
//   let details = "An unexpected error occurred.";
//   let stack: string | undefined;

//   if (isRouteErrorResponse(error)) {
//     message = error.status === 404 ? "404" : "Error";
//     details =
//       error.status === 404
//         ? "The requested page could not be found."
//         : error.statusText || details;
//   } else if (import.meta.env.DEV && error && error instanceof Error) {
//     details = error.message;
//     stack = error.stack;
//   }

//   return (
//     <main className="pt-16 p-4 container mx-auto">
//       <h1>{message}</h1>
//       <p>{details}</p>
//       {stack && (
//         <pre className="w-full p-4 overflow-x-auto">
//           <code>{stack}</code>
//         </pre>
//       )}
//     </main>
//   );
// }

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { LinksFunction } from "react-router";
import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import SqliteService from './services/sqliteService';
import DbVersionService from './services/dbVersionService';
import StorageService from './services/storageService';
import AppInitializer from "./components/AppInitializer";
import {JeepSqlite} from 'jeep-sqlite/dist/components/jeep-sqlite'
import { defineCustomElements as pwaElements} from '@ionic/pwa-elements/loader';
import "./app.css";


export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  // ... your other links
];

export const platform = Capacitor.getPlatform();

// Singleton Services - Create Context Providers
export const SqliteServiceContext = React.createContext(SqliteService);
export const DbVersionServiceContext = React.createContext(DbVersionService);
export const StorageServiceContext = React.createContext(
  new StorageService(SqliteService, DbVersionService)
);

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}


export default function App() {
  useEffect(() => {
    // Initialize jeep-sqlite for web platform only
    if (platform === 'web') {
      const initJeepSqlite = async () => {
        pwaElements(window);
        customElements.define('jeep-sqlite', JeepSqlite);
        
        // Create and append jeep-sqlite element
        const jeepEl = document.createElement("jeep-sqlite");
        document.body.appendChild(jeepEl);
        
        await customElements.whenDefined('jeep-sqlite');
      };
      
      initJeepSqlite().catch(console.error);
    }
  }, []);

  return (
    <SqliteServiceContext.Provider value={SqliteService}>
      <DbVersionServiceContext.Provider value={DbVersionService}>
        <StorageServiceContext.Provider 
          value={new StorageService(SqliteService, DbVersionService)}
        >
          <AppInitializer>
            <Outlet />
          </AppInitializer>
        </StorageServiceContext.Provider>
      </DbVersionServiceContext.Provider>
    </SqliteServiceContext.Provider>
  );
}